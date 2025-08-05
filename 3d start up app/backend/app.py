# Flask Backend for Interactive Python Learning Web App
from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import json
import sys
import io
import traceback
import subprocess
import tempfile
import os
from datetime import datetime

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
app.secret_key = 'your-secret-key-here'  # Change this in production
CORS(app)

# Import custom modules
try:
    from flowchart_generator import FlowchartGenerator
    from code_executor import CodeExecutor
    from chatbot import Chatbot

    # Initialize components
    flowchart_gen = FlowchartGenerator()
    code_exec = CodeExecutor()
    chatbot = Chatbot()
    modules_loaded = True
except ImportError as e:
    print(f"Warning: Could not import custom modules: {e}")
    flowchart_gen = None
    code_exec = None
    chatbot = None
    modules_loaded = False

@app.route('/')
def home():
    """Render the home page"""
    return render_template('index.html')

@app.route('/mode1')
def mode1():
    """Render Mode 1 - Question to Flowchart to Code"""
    return render_template('mode1.html')

@app.route('/mode2')
def mode2():
    """Render Mode 2 - Code to Flowchart for Error Analysis"""
    return render_template('mode2.html')

@app.route('/api/generate_flowchart', methods=['POST'])
def generate_flowchart():
    """Generate flowchart from problem description"""
    if not modules_loaded or not flowchart_gen:
        return jsonify({
            'success': False,
            'error': 'Flowchart generator not available',
            'message': 'Backend modules not loaded properly'
        }), 500

    try:
        data = request.get_json()
        problem = data.get('problem', '')

        if not problem:
            return jsonify({'error': 'No problem description provided'}), 400

        flowchart_data = flowchart_gen.generate_from_problem(problem)
        return jsonify({
            'success': True,
            'flowchart': flowchart_data,
            'message': 'Flowchart generated successfully'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to generate flowchart'
        }), 500

@app.route('/api/analyze_code', methods=['POST'])
def analyze_code():
    """Analyze code and generate flowchart with error detection"""
    if not modules_loaded or not flowchart_gen or not code_exec:
        return jsonify({
            'success': False,
            'error': 'Code analyzer not available',
            'message': 'Backend modules not loaded properly'
        }), 500

    try:
        data = request.get_json()
        code = data.get('code', '')

        if not code:
            return jsonify({'error': 'No code provided'}), 400

        # Generate flowchart from code
        flowchart_data = flowchart_gen.generate_from_code(code)

        # Analyze for errors
        errors = code_exec.analyze_code(code)

        return jsonify({
            'success': True,
            'flowchart': flowchart_data,
            'errors': errors,
            'message': 'Code analyzed successfully'
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to analyze code'
        }), 500

@app.route('/api/execute_code', methods=['POST'])
def execute_code():
    """Execute Python code safely"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        result = code_exec.execute_code(code)
        return jsonify({
            'success': True,
            'result': result,
            'message': 'Code executed successfully'
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to execute code'
        }), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chatbot interactions"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        
        if not message:
            return jsonify({'error': 'No message provided'}), 400
        
        response = chatbot.get_response(message)
        return jsonify({
            'success': True,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to process chat message'
        }), 500

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
