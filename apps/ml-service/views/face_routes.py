from flask import Flask, jsonify
from flask_cors import CORS
from prometheus_client import generate_latest
from controllers.face_controller import FaceController
from models.face_model import FaceModel
from config import get_config

def create_app(config_name=None):
    """Application factory pattern"""
    config = get_config(config_name)
    
    app = Flask(__name__)
    app.config.from_object(config)
    CORS(app)
    
    # Initialize model and controller
    face_model = FaceModel(config_name)
    face_controller = FaceController(face_model, config_name)
    
    # Initialize the face analysis model
    if not face_model.initialize_model():
        print("Warning: Face model initialization failed")
    
    # Health check route
    @app.route('/health', methods=['GET'])
    def health():
        result = face_controller.health_check()
        return jsonify(result)
    
    # Face detection route
    @app.route('/detect_faces', methods=['POST'])
    def detect_faces():
        result = face_controller.detect_faces()
        if isinstance(result, tuple):
            data, status_code = result
            return jsonify(data), status_code
        return jsonify(result)
    
    # Face recognition route
    @app.route('/recognize_faces', methods=['POST'])
    def recognize_faces():
        result = face_controller.recognize_faces()
        if isinstance(result, tuple):
            data, status_code = result
            return jsonify(data), status_code
        return jsonify(result)
    
    # Dataset management routes
    @app.route('/dataset/add', methods=['POST'])
    def add_to_dataset():
        result = face_controller.add_to_dataset()
        if isinstance(result, tuple):
            data, status_code = result
            return jsonify(data), status_code
        return jsonify(result)
    
    @app.route('/dataset/list', methods=['GET'])
    def list_dataset():
        result = face_controller.list_dataset()
        if isinstance(result, tuple):
            data, status_code = result
            return jsonify(data), status_code
        return jsonify(result)
    
    @app.route('/dataset/recompute', methods=['POST'])
    def recompute_embeddings():
        result = face_controller.recompute_embeddings()
        if isinstance(result, tuple):
            data, status_code = result
            return jsonify(data), status_code
        return jsonify(result)
    
    # Prometheus metrics route
    @app.route('/metrics', methods=['GET'])
    def metrics():
        from flask import Response
        return Response(generate_latest(), mimetype='text/plain')
    
    return app 