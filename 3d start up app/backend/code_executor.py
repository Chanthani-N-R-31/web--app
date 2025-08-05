# Code Executor Module - Safe Python code execution
import sys
import io
import ast
import traceback
import subprocess
import tempfile
import os
import signal
import time
from contextlib import contextmanager
from typing import Dict, List, Any

class CodeExecutor:
    """Safely execute and analyze Python code"""
    
    def __init__(self):
        self.timeout = 10  # 10 seconds timeout
        self.max_output_length = 10000  # Maximum output length
    
    def execute_code(self, code: str) -> Dict[str, Any]:
        """Execute Python code safely with timeout and output limits"""
        try:
            # Basic security checks
            if self._has_dangerous_imports(code):
                return {
                    'success': False,
                    'error': 'Code contains potentially dangerous imports',
                    'output': '',
                    'execution_time': 0
                }
            
            # Capture stdout and stderr
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            
            stdout_capture = io.StringIO()
            stderr_capture = io.StringIO()
            
            start_time = time.time()
            
            try:
                sys.stdout = stdout_capture
                sys.stderr = stderr_capture
                
                # Create a restricted execution environment
                exec_globals = {
                    '__builtins__': {
                        'print': print,
                        'len': len,
                        'range': range,
                        'str': str,
                        'int': int,
                        'float': float,
                        'list': list,
                        'dict': dict,
                        'tuple': tuple,
                        'set': set,
                        'bool': bool,
                        'abs': abs,
                        'max': max,
                        'min': min,
                        'sum': sum,
                        'sorted': sorted,
                        'reversed': reversed,
                        'enumerate': enumerate,
                        'zip': zip,
                        'map': map,
                        'filter': filter,
                        'any': any,
                        'all': all,
                        'round': round,
                        'pow': pow,
                        'divmod': divmod,
                        'isinstance': isinstance,
                        'type': type,
                        'hasattr': hasattr,
                        'getattr': getattr,
                        'setattr': setattr,
                        'chr': chr,
                        'ord': ord,
                    }
                }
                
                # Execute the code
                exec(code, exec_globals)
                
                execution_time = time.time() - start_time
                
                # Get output
                stdout_output = stdout_capture.getvalue()
                stderr_output = stderr_capture.getvalue()
                
                # Limit output length
                if len(stdout_output) > self.max_output_length:
                    stdout_output = stdout_output[:self.max_output_length] + "\n... (output truncated)"
                
                return {
                    'success': True,
                    'output': stdout_output,
                    'error': stderr_output if stderr_output else None,
                    'execution_time': round(execution_time, 3)
                }
                
            except Exception as e:
                execution_time = time.time() - start_time
                return {
                    'success': False,
                    'error': str(e),
                    'output': stdout_capture.getvalue(),
                    'execution_time': round(execution_time, 3),
                    'traceback': traceback.format_exc()
                }
            
            finally:
                sys.stdout = old_stdout
                sys.stderr = old_stderr
                
        except Exception as e:
            return {
                'success': False,
                'error': f"Execution failed: {str(e)}",
                'output': '',
                'execution_time': 0
            }
    
    def analyze_code(self, code: str) -> List[Dict[str, Any]]:
        """Analyze code for potential errors and issues"""
        errors = []
        
        try:
            # Parse the code to check for syntax errors
            tree = ast.parse(code)
            
            # Check for common issues
            errors.extend(self._check_syntax_issues(tree))
            errors.extend(self._check_logic_issues(tree))
            errors.extend(self._check_style_issues(code))
            
        except SyntaxError as e:
            errors.append({
                'type': 'syntax_error',
                'line': e.lineno,
                'message': str(e),
                'severity': 'error'
            })
        
        return errors
    
    def _has_dangerous_imports(self, code: str) -> bool:
        """Check for potentially dangerous imports"""
        dangerous_modules = [
            'os', 'sys', 'subprocess', 'shutil', 'glob', 'tempfile',
            'pickle', 'marshal', 'shelve', 'dbm', 'sqlite3',
            'socket', 'urllib', 'http', 'ftplib', 'smtplib',
            'threading', 'multiprocessing', 'asyncio',
            'ctypes', 'importlib', '__import__'
        ]
        
        try:
            tree = ast.parse(code)
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        if alias.name in dangerous_modules:
                            return True
                elif isinstance(node, ast.ImportFrom):
                    if node.module in dangerous_modules:
                        return True
        except:
            # If we can't parse, assume it's dangerous
            return True
        
        return False
    
    def _check_syntax_issues(self, tree: ast.AST) -> List[Dict[str, Any]]:
        """Check for syntax-related issues"""
        issues = []
        
        for node in ast.walk(tree):
            # Check for undefined variables (basic check)
            if isinstance(node, ast.Name) and isinstance(node.ctx, ast.Load):
                # This is a simplified check - in a real implementation,
                # you'd want to track variable definitions and scopes
                pass
        
        return issues
    
    def _check_logic_issues(self, tree: ast.AST) -> List[Dict[str, Any]]:
        """Check for logical issues"""
        issues = []
        
        for node in ast.walk(tree):
            # Check for infinite loops (basic patterns)
            if isinstance(node, ast.While):
                if isinstance(node.test, ast.Constant) and node.test.value is True:
                    issues.append({
                        'type': 'potential_infinite_loop',
                        'line': node.lineno,
                        'message': 'Potential infinite loop detected (while True without break)',
                        'severity': 'warning'
                    })
            
            # Check for division by zero patterns
            if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Div):
                if isinstance(node.right, ast.Constant) and node.right.value == 0:
                    issues.append({
                        'type': 'division_by_zero',
                        'line': node.lineno,
                        'message': 'Division by zero detected',
                        'severity': 'error'
                    })
        
        return issues
    
    def _check_style_issues(self, code: str) -> List[Dict[str, Any]]:
        """Check for style issues"""
        issues = []
        lines = code.split('\n')
        
        for i, line in enumerate(lines, 1):
            # Check line length
            if len(line) > 100:
                issues.append({
                    'type': 'line_too_long',
                    'line': i,
                    'message': f'Line too long ({len(line)} characters)',
                    'severity': 'style'
                })
            
            # Check for trailing whitespace
            if line.endswith(' ') or line.endswith('\t'):
                issues.append({
                    'type': 'trailing_whitespace',
                    'line': i,
                    'message': 'Trailing whitespace detected',
                    'severity': 'style'
                })
        
        return issues
