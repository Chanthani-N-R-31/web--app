#!/usr/bin/env python3
"""
Test script to verify the Interactive Python Learning Web App setup
"""

import os
import sys
import importlib.util

def test_file_structure():
    """Test if all required files exist"""
    print("🔍 Checking file structure...")
    
    required_files = [
        'backend/app.py',
        'backend/flowchart_generator.py',
        'backend/code_executor.py',
        'backend/chatbot.py',
        'frontend/templates/base.html',
        'frontend/templates/index.html',
        'frontend/templates/mode1.html',
        'frontend/templates/mode2.html',
        'frontend/static/css/style.css',
        'frontend/static/css/flowchart.css',
        'frontend/static/js/main.js',
        'frontend/static/js/chatbot.js',
        'frontend/static/js/flowchart.js',
        'frontend/static/js/mode1.js',
        'frontend/static/js/mode2.js',
        'requirements.txt',
        'README.md',
        'run.py'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing files:")
        for file_path in missing_files:
            print(f"   - {file_path}")
        return False
    else:
        print("✅ All required files present")
        return True

def test_python_imports():
    """Test if Python modules can be imported"""
    print("\n🐍 Testing Python imports...")
    
    # Add backend to path
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
    sys.path.insert(0, backend_dir)
    
    modules_to_test = [
        ('flask', 'Flask'),
        ('flask_cors', 'CORS'),
        ('ast', None),
        ('json', None),
        ('datetime', None)
    ]
    
    failed_imports = []
    
    for module_name, class_name in modules_to_test:
        try:
            module = importlib.import_module(module_name)
            if class_name:
                getattr(module, class_name)
            print(f"✅ {module_name}")
        except ImportError as e:
            print(f"❌ {module_name}: {e}")
            failed_imports.append(module_name)
    
    return len(failed_imports) == 0

def test_backend_modules():
    """Test if backend modules can be imported"""
    print("\n🔧 Testing backend modules...")
    
    # Add backend to path
    backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
    sys.path.insert(0, backend_dir)
    
    backend_modules = [
        'flowchart_generator',
        'code_executor',
        'chatbot'
    ]
    
    failed_modules = []
    
    for module_name in backend_modules:
        try:
            importlib.import_module(module_name)
            print(f"✅ {module_name}")
        except ImportError as e:
            print(f"❌ {module_name}: {e}")
            failed_modules.append(module_name)
    
    return len(failed_modules) == 0

def test_app_creation():
    """Test if Flask app can be created"""
    print("\n🌐 Testing Flask app creation...")
    
    try:
        # Add backend to path
        backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
        sys.path.insert(0, backend_dir)
        
        from app import app
        
        # Test if app is a Flask instance
        from flask import Flask
        if isinstance(app, Flask):
            print("✅ Flask app created successfully")
            return True
        else:
            print("❌ App is not a Flask instance")
            return False
            
    except Exception as e:
        print(f"❌ Failed to create Flask app: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Interactive Python Learning Web App - Setup Test")
    print("=" * 60)
    
    tests = [
        ("File Structure", test_file_structure),
        ("Python Imports", test_python_imports),
        ("Backend Modules", test_backend_modules),
        ("Flask App", test_app_creation)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} test failed with exception: {e}")
    
    print("\n" + "=" * 60)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Your setup is ready.")
        print("\n🚀 To start the application, run:")
        print("   python run.py")
        print("\n   Then open http://localhost:5000 in your browser")
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        print("\n💡 Try running: pip install -r requirements.txt")
    
    return passed == total

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
