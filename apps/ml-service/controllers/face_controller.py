from flask import request, jsonify
from werkzeug.utils import secure_filename
import cv2
import os
import time
from typing import Dict, Any
from models.face_model import FaceModel
from prometheus_client import Counter, Histogram
from config import get_config

class FaceController:
    """Controller class for face recognition endpoints"""
    
    def __init__(self, face_model: FaceModel, config_name=None):
        self.config = get_config(config_name)
        self.face_model = face_model
        self.upload_folder = self.config.UPLOAD_FOLDER
        
        os.makedirs(self.upload_folder, exist_ok=True)
        
        self.face_detection_counter = Counter('face_detection_requests_total', 'Total face detection requests')
        self.face_recognition_counter = Counter('face_recognition_requests_total', 'Total face recognition requests')
        self.face_detection_duration = Histogram('face_detection_duration_seconds', 'Face detection duration')
        self.face_recognition_duration = Histogram('face_recognition_duration_seconds', 'Face recognition duration')
    
    def health_check(self) -> Dict[str, Any]:
        """Health check endpoint"""
        return {
            "status": "healthy", 
            "model_loaded": self.face_model.is_model_loaded(),
            "dataset_size": self.face_model.get_dataset_size()
        }
    
    def detect_faces(self) -> Dict[str, Any]:
        """Detect faces in uploaded image"""
        start_time = time.time()
        self.face_detection_counter.inc()
        
        try:
            # Validate request
            if 'image' not in request.files:
                return {"error": "No image file provided"}, 400
                
            if not self.face_model.is_model_loaded():
                return {"error": "Face analysis model not loaded"}, 500
                
            image_file = request.files['image']
            if image_file.filename == '':
                return {"error": "No image selected"}, 400
            
            image = self._save_and_load_image(image_file)
            if image is None:
                return {"error": "Invalid image format"}, 400
            
            detected_faces = self.face_model.detect_faces(image)
            
            self._cleanup_temp_file(image_file.filename)
            
            self.face_detection_duration.observe(time.time() - start_time)
            
            return {
                "faces_detected": len(detected_faces),
                "faces": detected_faces
            }
            
        except Exception as e:
            return {"error": str(e)}, 500
    
    def recognize_faces(self) -> Dict[str, Any]:
        """Recognize faces in uploaded image"""
        start_time = time.time()
        self.face_recognition_counter.inc()
        
        try:
            # Validate request
            if 'image' not in request.files:
                return {"error": "No image file provided"}, 400
                
            if not self.face_model.is_model_loaded():
                return {"error": "Face analysis model not loaded"}, 500
                
            image_file = request.files['image']
            if image_file.filename == '':
                return {"error": "No image selected"}, 400
            
            image = self._save_and_load_image(image_file)
            if image is None:
                return {"error": "Invalid image format"}, 400
            
            recognized_faces, attendance_records = self.face_model.recognize_faces(image)
            
            current_time = time.time()
            for record in attendance_records:
                record["timestamp"] = current_time
            
            self._cleanup_temp_file(image_file.filename)
            
            self.face_recognition_duration.observe(time.time() - start_time)
            
            return {
                "total_faces": len(recognized_faces),
                "recognized_faces": recognized_faces,
                "attendance_records": attendance_records
            }
            
        except Exception as e:
            return {"error": str(e)}, 500
    
    def add_to_dataset(self) -> Dict[str, Any]:
        """Add person with images to dataset"""
        try:
            # Validate request
            if 'images' not in request.files:
                return {"error": "No images provided"}, 400
                
            person_name = request.form.get('person_name')
            if not person_name:
                return {"error": "Person name is required"}, 400
            
            images = request.files.getlist('images')
            if not images:
                return {"error": "At least one image is required"}, 400
            
            uploaded_files, embeddings_computed = self.face_model.add_person_to_dataset(
                person_name, images
            )
            
            return {
                "message": f"Added {len(uploaded_files)} images for {person_name}",
                "files": uploaded_files,
                "embeddings_computed": embeddings_computed
            }
            
        except Exception as e:
            return {"error": str(e)}, 500
    
    def list_dataset(self) -> Dict[str, Any]:
        """List all people in dataset"""
        try:
            return self.face_model.get_dataset_info()
        except Exception as e:
            return {"error": str(e)}, 500
    
    def recompute_embeddings(self) -> Dict[str, Any]:
        """Recompute all dataset embeddings"""
        try:
            total_embeddings = self.face_model.recompute_all_embeddings()
            
            return {
                "message": "Dataset embeddings recomputed successfully",
                "total_embeddings": total_embeddings
            }
        except Exception as e:
            return {"error": str(e)}, 500
    
    def _save_and_load_image(self, image_file) -> cv2.Mat:
        """Save uploaded image file and load it with OpenCV"""
        filename = secure_filename(image_file.filename)
        filepath = os.path.join(self.upload_folder, filename)
        image_file.save(filepath)
        
        image = cv2.imread(filepath)
        return image
    
    def _cleanup_temp_file(self, filename: str):
        """Remove temporary uploaded file"""
        try:
            filepath = os.path.join(self.upload_folder, secure_filename(filename))
            if os.path.exists(filepath):
                os.remove(filepath)
        except Exception as e:
            print(f"Error cleaning up temp file {filename}: {e}") 