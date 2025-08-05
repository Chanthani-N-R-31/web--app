# Flowchart Generator Module
import ast
import json
import re
from typing import Dict, List, Any

class FlowchartGenerator:
    """Generate flowcharts from problems or code"""
    
    def __init__(self):
        self.node_id_counter = 0
        
    def generate_node_id(self):
        """Generate unique node ID"""
        self.node_id_counter += 1
        return f"node_{self.node_id_counter}"
    
    def generate_from_problem(self, problem: str) -> Dict[str, Any]:
        """Generate flowchart from problem description"""
        # Reset counter for new flowchart
        self.node_id_counter = 0
        
        # Basic problem analysis and flowchart generation
        nodes = []
        edges = []
        
        # Start node
        start_id = self.generate_node_id()
        nodes.append({
            'id': start_id,
            'type': 'start',
            'label': 'Start',
            'x': 100,
            'y': 50
        })
        
        # Analyze problem for key components
        steps = self._analyze_problem_steps(problem)
        
        prev_id = start_id
        y_pos = 150
        
        for i, step in enumerate(steps):
            node_id = self.generate_node_id()
            node_type = self._determine_node_type(step)
            
            nodes.append({
                'id': node_id,
                'type': node_type,
                'label': step,
                'x': 100,
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
            'x': 100,
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
    
    def generate_from_code(self, code: str) -> Dict[str, Any]:
        """Generate flowchart from Python code"""
        # Reset counter for new flowchart
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
                'x': 100,
                'y': 50
            })
            
            # Process AST nodes
            prev_id = start_id
            y_pos = 150
            
            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
                    node_id = self.generate_node_id()
                    label = f"Define {node.name}"
                    
                    nodes.append({
                        'id': node_id,
                        'type': 'process',
                        'label': label,
                        'x': 100,
                        'y': y_pos
                    })
                    
                    edges.append({
                        'from': prev_id,
                        'to': node_id,
                        'label': ''
                    })
                    
                    prev_id = node_id
                    y_pos += 100
                
                elif isinstance(node, ast.If):
                    node_id = self.generate_node_id()
                    condition = ast.unparse(node.test) if hasattr(ast, 'unparse') else 'condition'
                    
                    nodes.append({
                        'id': node_id,
                        'type': 'decision',
                        'label': f"If {condition}",
                        'x': 100,
                        'y': y_pos
                    })
                    
                    edges.append({
                        'from': prev_id,
                        'to': node_id,
                        'label': ''
                    })
                    
                    prev_id = node_id
                    y_pos += 100
                
                elif isinstance(node, ast.For):
                    node_id = self.generate_node_id()
                    target = ast.unparse(node.target) if hasattr(ast, 'unparse') else 'item'
                    iter_obj = ast.unparse(node.iter) if hasattr(ast, 'unparse') else 'iterable'
                    
                    nodes.append({
                        'id': node_id,
                        'type': 'loop',
                        'label': f"For {target} in {iter_obj}",
                        'x': 100,
                        'y': y_pos
                    })
                    
                    edges.append({
                        'from': prev_id,
                        'to': node_id,
                        'label': ''
                    })
                    
                    prev_id = node_id
                    y_pos += 100
                
                elif isinstance(node, ast.While):
                    node_id = self.generate_node_id()
                    condition = ast.unparse(node.test) if hasattr(ast, 'unparse') else 'condition'
                    
                    nodes.append({
                        'id': node_id,
                        'type': 'loop',
                        'label': f"While {condition}",
                        'x': 100,
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
                'x': 100,
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
            # Return error flowchart
            return self._generate_error_flowchart(f"Syntax Error: {str(e)}")
    
    def _analyze_problem_steps(self, problem: str) -> List[str]:
        """Analyze problem and extract logical steps"""
        # Simple keyword-based analysis
        steps = []
        
        # Common programming patterns
        if 'input' in problem.lower():
            steps.append('Get input from user')
        
        if any(word in problem.lower() for word in ['calculate', 'compute', 'find']):
            steps.append('Perform calculations')
        
        if 'loop' in problem.lower() or 'repeat' in problem.lower():
            steps.append('Repeat process')
        
        if 'condition' in problem.lower() or 'if' in problem.lower():
            steps.append('Check condition')
        
        if 'output' in problem.lower() or 'print' in problem.lower():
            steps.append('Display result')
        
        # Default steps if no specific patterns found
        if not steps:
            steps = [
                'Read problem requirements',
                'Process data',
                'Generate output'
            ]
        
        return steps
    
    def _determine_node_type(self, step: str) -> str:
        """Determine flowchart node type based on step content"""
        step_lower = step.lower()
        
        if 'input' in step_lower or 'read' in step_lower:
            return 'input'
        elif 'output' in step_lower or 'display' in step_lower or 'print' in step_lower:
            return 'output'
        elif 'if' in step_lower or 'condition' in step_lower or 'check' in step_lower:
            return 'decision'
        elif 'loop' in step_lower or 'repeat' in step_lower:
            return 'loop'
        else:
            return 'process'
    
    def _generate_error_flowchart(self, error_message: str) -> Dict[str, Any]:
        """Generate flowchart showing error"""
        return {
            'nodes': [
                {
                    'id': 'error_node',
                    'type': 'error',
                    'label': error_message,
                    'x': 100,
                    'y': 100
                }
            ],
            'edges': [],
            'title': 'Error in Code'
        }
