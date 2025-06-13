import os

class Config:
    
    # Server settings
    HOST = '0.0.0.0'
    PORT = 5001
    DEBUG = False
    
    # Directory settings
    DATASET_FOLDER = 'dataset'
    UPLOAD_FOLDER = 'uploads'
    EMBEDDINGS_FILE = 'dataset_embeddings.pkl'
    
    # Face recognition settings
    RECOGNITION_THRESHOLD = 0.6
    DETECTION_SIZE = (640, 640)
    
    # InsightFace settings
    PROVIDERS = ['CPUExecutionProvider']
    ALLOWED_MODULES = ['detection', 'recognition']
    CTX_ID = 0
    
    # Supported image formats
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff'}
    
    # Performance settings
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = True
    DATASET_FOLDER = 'test_dataset'
    UPLOAD_FOLDER = 'test_uploads'
    EMBEDDINGS_FILE = 'test_embeddings.pkl'

# Configuration mapping
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

def get_config(config_name=None):
    """Get configuration based on environment"""
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'default')
    return config.get(config_name, DevelopmentConfig) 