#!/usr/bin/env python3
"""
Simplified Interactive Python Learning Web App
This version works without complex dependencies
"""

from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import json
import sys
import io
import traceback
import ast
from datetime import datetime

# Create Flask app
app = Flask(__name__, template_folder='frontend/templates', static_folder='frontend/static')
app.secret_key = 'demo-secret-key'
CORS(app)

# Simple flowchart generator
class SimpleFlowchartGenerator:
    def __init__(self):
        self.node_id_counter = 0
    
    def generate_node_id(self):
        self.node_id_counter += 1
        return f"node_{self.node_id_counter}"
    
    def generate_from_problem(self, problem):
        """Generate a simple flowchart from problem description"""
        self.node_id_counter = 0
        
        nodes = []
        edges = []
        
        # Start node
        start_id = self.generate_node_id()
        nodes.append({
            'id': start_id,
            'type': 'start',
            'label': 'Start',
            'x': 400,
            'y': 50
        })
        
        # Analyze problem for steps
        steps = self._analyze_problem_steps(problem)
        
        prev_id = start_id
        y_pos = 150
        
        for step in steps:
            node_id = self.generate_node_id()
            node_type = self._determine_node_type(step)
            
            nodes.append({
                'id': node_id,
                'type': node_type,
                'label': step,
                'x': 400,
                'y': y_pos
            })
            
            edges.append({
                'from': prev_id,
                'to': node_id,
                'label': ''
            })
            
            prev_id = node_id
            y_pos += 100
        
        # End node
        end_id = self.generate_node_id()
        nodes.append({
            'id': end_id,
            'type': 'end',
            'label': 'End',
            'x': 400,
            'y': y_pos
        })
        
        edges.append({
            'from': prev_id,
            'to': end_id,
            'label': ''
        })
        
        return {
            'nodes': nodes,
            'edges': edges,
            'title': 'Problem Solution Flowchart'
        }
    
    def generate_from_code(self, code):
        """Generate flowchart from Python code"""
        self.node_id_counter = 0
        
        try:
            tree = ast.parse(code)
            nodes = []
            edges = []
            
            # Start node
            start_id = self.generate_node_id()
            nodes.append({
                'id': start_id,
                'type': 'start',
                'label': 'Start',
                'x': 400,
                'y': 50
            })
            
            prev_id = start_id
            y_pos = 150
            
            # Simple analysis of AST nodes
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    node_id = self.generate_node_id()
                    nodes.append({
                        'id': node_id,
                        'type': 'process',
                        'label': f'Function: {node.name}',
                        'x': 400,
                        'y': y_pos
                    })
                    edges.append({'from': prev_id, 'to': node_id, 'label': ''})
                    prev_id = node_id
                    y_pos += 100
                
                elif isinstance(node, ast.If):
                    node_id = self.generate_node_id()
                    nodes.append({
                        'id': node_id,
                        'type': 'decision',
                        'label': 'If condition',
                        'x': 400,
                        'y': y_pos
                    })
                    edges.append({'from': prev_id, 'to': node_id, 'label': ''})
                    prev_id = node_id
                    y_pos += 100
                
                elif isinstance(node, (ast.For, ast.While)):
                    node_id = self.generate_node_id()
                    loop_type = 'For' if isinstance(node, ast.For) else 'While'
                    nodes.append({
                        'id': node_id,
                        'type': 'loop',
                        'label': f'{loop_type} loop',
                        'x': 400,
                        'y': y_pos
                    })
                    edges.append({'from': prev_id, 'to': node_id, 'label': ''})
                    prev_id = node_id
                    y_pos += 100
            
            # End node
            end_id = self.generate_node_id()
            nodes.append({
                'id': end_id,
                'type': 'end',
                'label': 'End',
                'x': 400,
                'y': y_pos
            })
            
            edges.append({
                'from': prev_id,
                'to': end_id,
                'label': ''
            })
            
            return {
                'nodes': nodes,
                'edges': edges,
                'title': 'Code Flow Diagram'
            }
            
        except SyntaxError as e:
            return {
                'nodes': [{
                    'id': 'error_node',
                    'type': 'error',
                    'label': f'Syntax Error: {str(e)}',
                    'x': 400,
                    'y': 100
                }],
                'edges': [],
                'title': 'Error in Code'
            }
    
    def _analyze_problem_steps(self, problem):
        """Simple problem analysis"""
        steps = []
        problem_lower = problem.lower()
        
        if 'input' in problem_lower:
            steps.append('Get input from user')
        
        if any(word in problem_lower for word in ['calculate', 'compute', 'find', 'determine']):
            steps.append('Process data')
        
        if any(word in problem_lower for word in ['if', 'condition', 'check']):
            steps.append('Check condition')
        
        if any(word in problem_lower for word in ['loop', 'repeat', 'for', 'while']):
            steps.append('Repeat process')
        
        if any(word in problem_lower for word in ['output', 'print', 'display', 'show']):
            steps.append('Display result')
        
        if not steps:
            steps = ['Read input', 'Process data', 'Generate output']
        
        return steps
    
    def _determine_node_type(self, step):
        """Determine node type from step description"""
        step_lower = step.lower()
        
        if 'input' in step_lower:
            return 'input'
        elif any(word in step_lower for word in ['output', 'display', 'print', 'show']):
            return 'output'
        elif any(word in step_lower for word in ['if', 'condition', 'check']):
            return 'decision'
        elif any(word in step_lower for word in ['loop', 'repeat']):
            return 'loop'
        else:
            return 'process'

# Simple code executor
class SimpleCodeExecutor:
    def execute_code(self, code):
        """Execute Python code safely"""
        try:
            # Capture output
            old_stdout = sys.stdout
            stdout_capture = io.StringIO()
            sys.stdout = stdout_capture
            
            # Execute code
            exec(code)
            
            # Get output
            output = stdout_capture.getvalue()
            sys.stdout = old_stdout
            
            return {
                'success': True,
                'output': output,
                'error': None,
                'execution_time': 0.1
            }
            
        except Exception as e:
            sys.stdout = old_stdout
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'execution_time': 0.0
            }
    
    def analyze_code(self, code):
        """Simple code analysis"""
        errors = []
        
        try:
            ast.parse(code)
        except SyntaxError as e:
            errors.append({
                'type': 'syntax_error',
                'line': e.lineno,
                'message': str(e),
                'severity': 'error'
            })
        
        return errors

# Simple chatbot
class SimpleChatbot:
    def get_response(self, message):
        """Simple chatbot responses with error detection"""
        message_lower = message.lower()

        # Check for Python errors first
        error_response = self._detect_python_error(message_lower)
        if error_response:
            return error_response

        if any(word in message_lower for word in ['hello', 'hi', 'hey']):
            response = "Hello! I'm here to help you learn Python. You can ask about concepts or paste error messages for debugging help!"
        elif 'variable' in message_lower:
            response = "Variables store data in Python. Example: name = 'Alice', age = 25"
        elif 'function' in message_lower:
            response = "Functions are reusable code blocks. Example: def greet(name): return f'Hello {name}!'"
        elif 'loop' in message_lower:
            response = "Loops repeat code. For loop: for i in range(5): print(i). While loop: while x < 10: x += 1"
        elif 'help' in message_lower:
            response = "I can help with Python concepts like variables, functions, loops, and conditionals. You can also paste error messages!"
        else:
            response = "That's a great question! I can help with Python basics like variables, functions, loops, conditionals, and debugging errors."

        return {
            'message': response,
            'type': 'help',
            'suggestions': ['Variables', 'Functions', 'Loops', 'Conditionals', 'Paste error message']
        }

    def _detect_python_error(self, message_lower):
        """Detect and help with Python errors"""

        # Check for error indicators
        if not any(word in message_lower for word in ['error', 'traceback', 'exception']):
            return None

        # Syntax Error
        if any(word in message_lower for word in ['syntaxerror', 'invalid syntax', 'missing colon']):
            return {
                'message': "🐛 **SyntaxError detected!**\n\nCommon fixes:\n• Add missing colon (:) after if, for, while, def\n• Check for missing quotes or parentheses\n• Ensure proper indentation\n• Don't use Python keywords as variable names\n\nExample:\n```python\nif x > 5:  # Don't forget the colon!\n    print('Greater than 5')\n```",
                'type': 'error_help',
                'suggestions': ['Show syntax examples', 'Indentation help', 'More debugging tips']
            }

        # Indentation Error
        elif any(word in message_lower for word in ['indentationerror', 'indentation', 'expected an indented block']):
            return {
                'message': "🐛 **IndentationError detected!**\n\nCommon fixes:\n• Use 4 spaces for each indentation level\n• Don't mix tabs and spaces\n• Indent code blocks after if, for, while, def\n• Make sure all lines in same block have same indentation\n\nExample:\n```python\nif True:\n    print('Indented correctly')  # 4 spaces\n    print('This too')           # 4 spaces\nprint('Not indented')           # 0 spaces\n```",
                'type': 'error_help',
                'suggestions': ['Indentation examples', 'Editor settings', 'More help']
            }

        # Name Error
        elif any(word in message_lower for word in ['nameerror', 'not defined', 'name is not defined']):
            return {
                'message': "🐛 **NameError detected!**\n\nCommon fixes:\n• Define variables before using them\n• Check for typos (Python is case-sensitive)\n• Import necessary modules\n• Check variable scope (function vs global)\n\nExample:\n```python\nname = 'Alice'  # Define first\nprint(name)     # Then use\n```",
                'type': 'error_help',
                'suggestions': ['Variable examples', 'Import help', 'Scope explanation']
            }

        # Type Error
        elif any(word in message_lower for word in ['typeerror', 'unsupported operand', 'not callable']):
            return {
                'message': "🐛 **TypeError detected!**\n\nCommon fixes:\n• Check data types before operations\n• Convert types when needed: int(), str(), float()\n• Verify function calls have correct arguments\n• Make sure you're calling actual functions\n\nExample:\n```python\nage = int(input('Age: '))  # Convert to int\nresult = 'I am ' + str(age) + ' years old'  # Convert to string\n```",
                'type': 'error_help',
                'suggestions': ['Type conversion', 'Function examples', 'Data types']
            }

        # Index Error
        elif any(word in message_lower for word in ['indexerror', 'list index out of range', 'string index out of range']):
            return {
                'message': "🐛 **IndexError detected!**\n\nCommon fixes:\n• Check list/string length before accessing\n• Remember Python uses 0-based indexing\n• Use len() to get size\n• Handle with try-except\n\nExample:\n```python\nmy_list = [1, 2, 3]\nif len(my_list) > 2:\n    print(my_list[2])  # Safe access\n```",
                'type': 'error_help',
                'suggestions': ['List examples', 'Safe indexing', 'Try-except help']
            }

        # Generic error help
        else:
            return {
                'message': "🐛 **Python Error Detected!**\n\nTo help you better:\n1. Share the complete error message\n2. Show me the problematic code\n3. Tell me what you were trying to do\n\n🔧 **Quick debugging tips:**\n• Read error messages carefully\n• Check the line number mentioned\n• Look for typos and syntax issues\n• Ensure proper indentation",
                'type': 'error_help',
                'suggestions': ['Paste full error', 'Show code', 'Debugging guide', 'Common errors']
            }

        return None

# Initialize components
flowchart_gen = SimpleFlowchartGenerator()
code_exec = SimpleCodeExecutor()
chatbot = SimpleChatbot()

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/mode1')
def mode1():
    return render_template('mode1.html')

@app.route('/mode2')
def mode2():
    return render_template('mode2.html')

@app.route('/api/generate_flowchart', methods=['POST'])
def generate_flowchart():
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
    try:
        data = request.get_json()
        code = data.get('code', '')
        
        if not code:
            return jsonify({'error': 'No code provided'}), 400
        
        flowchart_data = flowchart_gen.generate_from_code(code)
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
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🐍 Interactive Python Learning Web App (Simplified)")
    print("=" * 50)
    print("🌐 Server starting on http://localhost:5000")
    print("🚀 Ready to start learning Python!")
    print("   Open your browser and navigate to the URL above")
    print("   Press Ctrl+C to stop the server")
    print()
    
    app.run(debug=True, host='0.0.0.0', port=5000)
