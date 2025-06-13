import cv2
import numpy as np
import os
import pickle
import insightface
from scipy.spatial.distance import cdist
from typing import Dict, List, Tuple, Optional
import base64
from config import get_config

class FaceModel:
    
    def __init__(self, config_name=None):
        self.config = get_config(config_name)
        self.dataset_folder = self.config.DATASET_FOLDER
        self.embeddings_file = self.config.EMBEDDINGS_FILE
        self.face_analysis_model = None
        self.dataset_embeddings = {}
        
        os.makedirs(self.dataset_folder, exist_ok=True)
    
    def initialize_model(self):
        """Initialize InsightFace face analysis model"""
        try:
            self.face_analysis_model = insightface.app.FaceAnalysis(
                providers=self.config.PROVIDERS,
                allowed_modules=self.config.ALLOWED_MODULES
            )
            self.face_analysis_model.prepare(ctx_id=self.config.CTX_ID, det_size=self.config.DETECTION_SIZE)
            print("InsightFace models (detection and recognition) initialized successfully")
            
            self.load_dataset_embeddings()
            return True
            
        except Exception as e:
            print(f"Error initializing models: {e}")
            return False
    
    def is_model_loaded(self) -> bool:
        """Check if the face analysis model is loaded"""
        return self.face_analysis_model is not None
    
    def get_dataset_size(self) -> int:
        """Get the number of people in the dataset"""
        return len(self.dataset_embeddings)
    
    def load_dataset_embeddings(self):
        """Load precomputed embeddings from pickle file or recompute if not exists"""
        if os.path.exists(self.embeddings_file):
            try:
                with open(self.embeddings_file, 'rb') as f:
                    self.dataset_embeddings = pickle.load(f)
                print(f"Loaded {len(self.dataset_embeddings)} precomputed embeddings")
                return
            except Exception as e:
                print(f"Error loading embeddings file: {e}")
        
        print("Recomputing dataset embeddings...")
        self.dataset_embeddings = self.compute_dataset_embeddings()
        self.save_dataset_embeddings()
    
    def compute_dataset_embeddings(self) -> Dict[str, np.ndarray]:
        """Compute and return embeddings for all faces in the dataset"""
        embeddings = {}
        
        if not os.path.exists(self.dataset_folder) or self.face_analysis_model is None:
            return embeddings
        
        print(f"Debug: Starting to process dataset folder: {self.dataset_folder}")
        
        for person_name in os.listdir(self.dataset_folder):
            person_path = os.path.join(self.dataset_folder, person_name)
            
            if os.path.isdir(person_path):
                person_embeddings = []
                image_files = [f for f in os.listdir(person_path) 
                              if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                print(f"Debug: Found {len(image_files)} image files for {person_name}")
                
                for image_file in image_files:
                    image_path = os.path.join(person_path, image_file)
                    try:
                        image = cv2.imread(image_path)
                        if image is not None:
                            faces = self.face_analysis_model.get(image)
                            if faces and len(faces) > 0:
                                person_embeddings.append(faces[0].embedding)
                                print(f"Debug: Added embedding for face in {image_file}")
                        else:
                            print(f"Debug: Failed to load image: {image_path}")
                    except Exception as e:
                        print(f"Error processing {image_path}: {e}")
                
                if person_embeddings:
                    avg_embedding = np.mean(person_embeddings, axis=0)
                    embeddings[person_name] = avg_embedding
                    print(f"Computed embedding for {person_name} from {len(person_embeddings)} images")
                else:
                    print(f"Debug: No embeddings computed for {person_name}")
        
        print(f"Debug: Total embeddings computed: {len(embeddings)}")
        return embeddings
    
    def save_dataset_embeddings(self):
        """Save computed embeddings to pickle file"""
        try:
            with open(self.embeddings_file, 'wb') as f:
                pickle.dump(self.dataset_embeddings, f)
            print(f"Saved {len(self.dataset_embeddings)} embeddings to {self.embeddings_file}")
        except Exception as e:
            print(f"Error saving embeddings: {e}")
    
    def detect_faces(self, image: np.ndarray) -> List[Dict]:
        """Detect faces in an image and return face data"""
        if self.face_analysis_model is None:
            raise Exception("Face analysis model not loaded")
        
        faces = self.face_analysis_model.get(image)
        detected_faces = []
        
        for i, face in enumerate(faces):
            bbox = face.bbox.astype(int)
            x1, y1, x2, y2 = bbox
            
            aligned_face = self._align_face(image, face)
            
            face_crop_b64 = None
            if aligned_face is not None:
                _, buffer = cv2.imencode('.jpg', aligned_face)
                face_crop_b64 = base64.b64encode(buffer).decode('utf-8')
            
            detected_faces.append({
                "face_id": i,
                "bbox": [int(x1), int(y1), int(x2), int(y2)],
                "confidence": float(face.det_score) if hasattr(face, 'det_score') else 0.95,
                "landmarks": face.kps.tolist() if hasattr(face, 'kps') else None,
                "face_crop_base64": face_crop_b64
            })
        
        return detected_faces
    
    def recognize_faces(self, image: np.ndarray, threshold: float = 0.6) -> Tuple[List[Dict], List[Dict]]:
        """Recognize faces in an image and return recognized faces and attendance records"""
        if self.face_analysis_model is None:
            raise Exception("Face analysis model not loaded")
        
        faces = self.face_analysis_model.get(image)
        
        if not faces:
            return [], []
        
        face_embeddings = [face.embedding for face in faces]
        
        matches = self._find_best_matches_batch(face_embeddings, threshold)
        
        recognized_faces = []
        attendance_records = []
        
        for i, (face, match) in enumerate(zip(faces, matches)):
            face_data = {
                "face_id": i,
                "bbox": face.bbox.astype(int).tolist(),
                "confidence": float(face.det_score) if hasattr(face, 'det_score') else 0.95
            }
            
            if match:
                face_data.update({
                    "name": match["name"],
                    "recognition_confidence": match["confidence"]
                })
                recognized_faces.append(face_data)
                
                attendance_records.append({
                    "person_name": match["name"],
                    "confidence": match["confidence"],
                    "timestamp": None,
                    "bbox": face.bbox.astype(int).tolist()
                })
            else:
                face_data["name"] = "Unknown"
                face_data["recognition_confidence"] = 0.0
                recognized_faces.append(face_data)
        
        return recognized_faces, attendance_records
    
    def add_person_to_dataset(self, person_name: str, images: List) -> Tuple[List[str], bool]:
        """Add a person with images to the dataset"""
        person_folder = os.path.join(self.dataset_folder, person_name)
        os.makedirs(person_folder, exist_ok=True)
        
        uploaded_files = []
        
        for i, image_file in enumerate(images):
            if image_file.filename:
                filename = f"{person_name}_{i+1}.jpg"
                filepath = os.path.join(person_folder, filename)
                image_file.save(filepath)
                uploaded_files.append(filename)
        
        # Recompute embeddings for this person
        person_embeddings = []
        for image_file in uploaded_files:
            image_path = os.path.join(person_folder, image_file)
            try:
                image = cv2.imread(image_path)
                if image is not None and self.face_analysis_model is not None:
                    faces = self.face_analysis_model.get(image)
                    if faces and len(faces) > 0:
                        person_embeddings.append(faces[0].embedding)
            except Exception as e:
                print(f"Error processing {image_path}: {e}")
        
        embeddings_computed = False
        if person_embeddings:
            avg_embedding = np.mean(person_embeddings, axis=0)
            self.dataset_embeddings[person_name] = avg_embedding
            self.save_dataset_embeddings()
            embeddings_computed = True
        
        return uploaded_files, embeddings_computed
    
    def get_dataset_info(self) -> Dict:
        """Get information about the dataset"""
        dataset_info = []
        
        if os.path.exists(self.dataset_folder):
            for person_name in os.listdir(self.dataset_folder):
                person_path = os.path.join(self.dataset_folder, person_name)
                if os.path.isdir(person_path):
                    image_count = len([f for f in os.listdir(person_path) 
                                     if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
                    has_embedding = person_name in self.dataset_embeddings
                    dataset_info.append({
                        "name": person_name,
                        "image_count": image_count,
                        "has_embedding": has_embedding
                    })
        
        return {
            "dataset": dataset_info,
            "total_people": len(dataset_info),
            "total_embeddings": len(self.dataset_embeddings)
        }
    
    def recompute_all_embeddings(self) -> int:
        """Recompute all dataset embeddings"""
        print("Recomputing all dataset embeddings...")
        self.dataset_embeddings = self.compute_dataset_embeddings()
        self.save_dataset_embeddings()
        return len(self.dataset_embeddings)
    
    def _align_face(self, image: np.ndarray, face) -> Optional[np.ndarray]:
        """Align face using landmarks"""
        try:
            aligned_face = face.align()
            return aligned_face
        except:
            # Fallback: crop using bounding box
            bbox = face.bbox.astype(int)
            x1, y1, x2, y2 = bbox
            return image[y1:y2, x1:x2]
    
    def _find_best_matches_batch(self, face_embeddings: List[np.ndarray], threshold: float = 0.6) -> List[Optional[Dict]]:
        """Find best matches for multiple face embeddings using batch processing"""
        if not self.dataset_embeddings or not face_embeddings:
            return [None] * len(face_embeddings)
        
        # Convert dataset embeddings to arrays
        known_names = list(self.dataset_embeddings.keys())
        known_embeddings = np.array([self.dataset_embeddings[name] for name in known_names])
        
        # Compute cosine similarities using cdist
        query_embeddings = np.array(face_embeddings)
        distances = cdist(query_embeddings, known_embeddings, metric='cosine')
        similarities = 1 - distances  # Convert distance to similarity
        
        results = []
        for i, face_similarities in enumerate(similarities):
            best_idx = np.argmax(face_similarities)
            best_similarity = face_similarities[best_idx]
            
            if best_similarity > threshold:
                results.append({
                    "name": known_names[best_idx],
                    "confidence": float(best_similarity)
                })
            else:
                results.append(None)
        
        return results 