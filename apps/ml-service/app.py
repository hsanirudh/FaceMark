#!/usr/bin/env python3
"""
Face Recognition Service - MVC Architecture
Main application entry point using Model-View-Controller pattern
"""

from views import create_app

def main():
    """Main function to run the Flask application"""
    app = create_app()
    
    print("Starting Face Recognition Service")
    print("Available endpoints:")
    print("  GET  /health               - Health check")
    print("  POST /detect_faces         - Detect faces in image")
    print("  POST /recognize_faces      - Recognize faces in image")
    print("  POST /dataset/add          - Add person to dataset")
    print("  GET  /dataset/list         - List dataset contents")
    print("  POST /dataset/recompute    - Recompute all embeddings")
    print("  GET  /metrics              - Prometheus metrics")
    print("-" * 50)
    
    # Run the application
    app.run(host='0.0.0.0', port=5001, debug=False)

if __name__ == '__main__':
    main() 