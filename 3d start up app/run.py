#!/usr/bin/env python3
"""
Interactive Python Learning Web App
Entry point for running the application
"""

import os
import sys

# Add the backend directory to the Python path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.insert(0, backend_dir)

from app import app

if __name__ == '__main__':
    # Configuration
    debug_mode = os.environ.get('FLASK_DEBUG', 'True').lower() == 'true'
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('FLASK_PORT', 5000))
    
    print("🐍 Interactive Python Learning Web App")
    print("=" * 50)
    print(f"🌐 Server starting on http://{host}:{port}")
    print(f"🔧 Debug mode: {debug_mode}")
    print("=" * 50)
    print("📚 Features available:")
    print("  • Mode 1: Problem to Code")
    print("  • Mode 2: Code Analysis")
    print("  • Interactive AI Chatbot")
    print("  • Safe Code Execution")
    print("  • Visual Flowcharts")
    print("=" * 50)
    print("🚀 Ready to start learning Python!")
    print("   Open your browser and navigate to the URL above")
    print("   Press Ctrl+C to stop the server")
    print()
    
    try:
        app.run(
            debug=debug_mode,
            host=host,
            port=port,
            threaded=True
        )
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Happy coding!")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("💡 Try running: pip install -r requirements.txt")
        sys.exit(1)
