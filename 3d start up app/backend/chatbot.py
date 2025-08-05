# Chatbot Module for Student Assistance
import json
import random
from typing import Dict, List, Any
from datetime import datetime

class Chatbot:
    """Interactive chatbot for student assistance and motivation"""
    
    def __init__(self):
        self.conversation_history = []
        self.motivational_quotes = [
            "Great job! Keep coding and learning!",
            "Every expert was once a beginner. You're doing great!",
            "Debugging is like being a detective. You've got this!",
            "Code is poetry written in logic. Keep creating!",
            "The best way to learn programming is by programming!",
            "Errors are not failures, they're learning opportunities!",
            "Programming is thinking, not typing. Take your time!",
            "Every line of code you write makes you a better programmer!"
        ]
        
        self.faq_responses = {
            'what is python': "Python is a high-level, interpreted programming language known for its simplicity and readability. It's great for beginners!",
            'how to start coding': "Start with simple programs like 'Hello World', then gradually work on small projects. Practice regularly!",
            'what is a variable': "A variable is a container that stores data values. In Python, you can create variables like: name = 'John'",
            'what is a function': "A function is a block of reusable code that performs a specific task. You define it with 'def' keyword.",
            'what is a loop': "A loop is used to repeat a block of code. Python has 'for' loops and 'while' loops.",
            'what is an if statement': "An if statement is used to make decisions in code. It executes code only if a condition is true.",
            'how to debug code': "Debugging involves finding and fixing errors. Read error messages carefully, use print statements, and test small parts of your code.",
            'what is syntax error': "A syntax error occurs when Python can't understand your code due to incorrect syntax. Check for typos and proper indentation.",
            'what is indentation': "Indentation in Python is used to define code blocks. Use 4 spaces or 1 tab consistently.",
            'how to learn faster': "Practice regularly, work on projects, read others' code, and don't be afraid to make mistakes!"
        }
        
        self.programming_help = {
            'variables': {
                'explanation': "Variables store data that can be used later in your program.",
                'example': "age = 25\nname = 'Alice'\nprint(f'{name} is {age} years old')",
                'tips': "Choose descriptive variable names and follow naming conventions."
            },
            'functions': {
                'explanation': "Functions are reusable blocks of code that perform specific tasks.",
                'example': "def greet(name):\n    return f'Hello, {name}!'\n\nprint(greet('World'))",
                'tips': "Keep functions small and focused on one task."
            },
            'loops': {
                'explanation': "Loops allow you to repeat code multiple times.",
                'example': "for i in range(5):\n    print(f'Count: {i}')\n\nwhile x < 10:\n    x += 1",
                'tips': "Be careful with while loops to avoid infinite loops."
            },
            'conditionals': {
                'explanation': "Conditionals let your program make decisions based on conditions.",
                'example': "if age >= 18:\n    print('Adult')\nelse:\n    print('Minor')",
                'tips': "Use elif for multiple conditions and ensure proper indentation."
            }
        }
    
    def get_response(self, message: str) -> Dict[str, Any]:
        """Generate response to user message"""
        message_lower = message.lower().strip()
        
        # Add to conversation history
        self.conversation_history.append({
            'user_message': message,
            'timestamp': datetime.now().isoformat()
        })
        
        response = self._generate_response(message_lower)
        
        # Add response to history
        self.conversation_history[-1]['bot_response'] = response
        
        return {
            'message': response['text'],
            'type': response['type'],
            'suggestions': response.get('suggestions', []),
            'code_example': response.get('code_example'),
            'timestamp': datetime.now().isoformat()
        }
    
    def _generate_response(self, message: str) -> Dict[str, Any]:
        """Generate appropriate response based on message content"""

        # Check for Python errors first (highest priority)
        error_response = self._detect_and_handle_python_error(message)
        if error_response:
            return error_response

        # Check for greetings
        if any(greeting in message for greeting in ['hello', 'hi', 'hey', 'good morning', 'good afternoon']):
            return {
                'text': "Hello! I'm here to help you learn Python programming. Feel free to ask me questions about coding concepts, paste error messages for debugging help, or let me know if you need motivation!",
                'type': 'greeting',
                'suggestions': ['What is Python?', 'How do I start coding?', 'Explain variables', 'Show me a loop example', 'Help with errors']
            }

        # Check for motivation requests
        if any(word in message for word in ['motivate', 'encourage', 'stuck', 'frustrated', 'difficult', 'hard']):
            quote = random.choice(self.motivational_quotes)
            return {
                'text': f"{quote} Remember, every programmer faces challenges. The key is to keep practicing and learning from mistakes!",
                'type': 'motivation',
                'suggestions': ['Ask a coding question', 'Get help with debugging', 'Learn about functions', 'Paste error message']
            }

        # Check for help requests
        if any(word in message for word in ['help', 'explain', 'what is', 'how to']):
            return self._handle_help_request(message)

        # Check for code-related questions
        if any(word in message for word in ['code', 'program', 'function', 'variable', 'loop', 'if']):
            return self._handle_coding_question(message)

        # Check FAQ
        for question, answer in self.faq_responses.items():
            if question in message:
                return {
                    'text': answer,
                    'type': 'faq',
                    'suggestions': ['Ask another question', 'Get a code example', 'Need motivation?', 'Paste error for help']
                }

        # Default response
        return {
            'text': "I'm here to help you with Python programming! You can ask me about variables, functions, loops, conditionals, or any other programming concepts. You can also paste Python error messages and I'll help you fix them!",
            'type': 'default',
            'suggestions': [
                'Explain variables',
                'Show me a function example',
                'What are loops?',
                'Help with debugging',
                'Paste error message',
                'Motivate me!'
            ]
        }
    
    def _handle_help_request(self, message: str) -> Dict[str, Any]:
        """Handle specific help requests"""
        
        # Check for specific topics
        for topic, info in self.programming_help.items():
            if topic in message or topic[:-1] in message:  # Handle singular forms
                return {
                    'text': f"{info['explanation']}\n\nHere's an example:\n```python\n{info['example']}\n```\n\nTip: {info['tips']}",
                    'type': 'help',
                    'code_example': info['example'],
                    'suggestions': ['Try this example', 'Ask about another topic', 'Need more help?']
                }
        
        return {
            'text': "I can help you with various Python concepts like variables, functions, loops, and conditionals. What specific topic would you like to learn about?",
            'type': 'help',
            'suggestions': ['Variables', 'Functions', 'Loops', 'Conditionals', 'Debugging']
        }
    
    def _handle_coding_question(self, message: str) -> Dict[str, Any]:
        """Handle coding-specific questions"""
        
        if 'error' in message or 'bug' in message or 'debug' in message:
            return {
                'text': "Debugging can be tricky, but here are some tips:\n1. Read the error message carefully\n2. Check your syntax and indentation\n3. Use print statements to track values\n4. Test small parts of your code\n5. Take breaks when frustrated\n\nWhat specific error are you encountering?",
                'type': 'debugging',
                'suggestions': ['Syntax error help', 'Logic error help', 'Show me an example', 'Motivate me']
            }
        
        if 'syntax' in message:
            return {
                'text': "Syntax errors occur when Python can't understand your code. Common causes:\n- Missing colons (:) after if, for, while, def\n- Incorrect indentation\n- Mismatched parentheses or quotes\n- Typos in keywords\n\nAlways check these first!",
                'type': 'syntax_help',
                'code_example': "# Correct syntax examples:\nif x > 5:\n    print('Greater than 5')\n\nfor i in range(3):\n    print(i)",
                'suggestions': ['Show me correct examples', 'Help with indentation', 'Other error types']
            }
        
        return {
            'text': "I'm here to help with your coding questions! Could you be more specific about what you'd like to learn or what problem you're facing?",
            'type': 'coding',
            'suggestions': ['Variables', 'Functions', 'Loops', 'Debugging', 'Syntax help']
        }
    
    def get_conversation_history(self) -> List[Dict[str, Any]]:
        """Get conversation history"""
        return self.conversation_history
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []

    def _detect_and_handle_python_error(self, message: str) -> Dict[str, Any]:
        """Detect Python errors in message and provide solutions"""

        # Common Python error patterns
        error_patterns = {
            'SyntaxError': {
                'keywords': ['syntaxerror', 'invalid syntax', 'unexpected token', 'missing colon'],
                'solutions': [
                    "Check for missing colons (:) after if, for, while, def, class statements",
                    "Ensure proper indentation (use 4 spaces or 1 tab consistently)",
                    "Check for missing or mismatched parentheses, brackets, or quotes",
                    "Make sure you're not using Python keywords as variable names"
                ],
                'example': "# Correct syntax:\nif x > 5:\n    print('Greater than 5')\n\nfor i in range(3):\n    print(i)"
            },
            'IndentationError': {
                'keywords': ['indentationerror', 'expected an indented block', 'unindent', 'indentation'],
                'solutions': [
                    "Use consistent indentation (4 spaces recommended)",
                    "Make sure code blocks after if, for, while, def are indented",
                    "Don't mix tabs and spaces - choose one and stick with it",
                    "Check that all lines in the same block have the same indentation level"
                ],
                'example': "# Correct indentation:\nif True:\n    print('This is indented')\n    print('This too')\nprint('This is not indented')"
            },
            'NameError': {
                'keywords': ['nameerror', 'name is not defined', 'not defined'],
                'solutions': [
                    "Make sure you've defined the variable before using it",
                    "Check for typos in variable names (Python is case-sensitive)",
                    "Ensure you've imported necessary modules",
                    "Variables defined inside functions are only available inside those functions"
                ],
                'example': "# Correct usage:\nname = 'Alice'  # Define first\nprint(name)     # Then use"
            },
            'TypeError': {
                'keywords': ['typeerror', 'unsupported operand', 'not callable', 'takes', 'arguments'],
                'solutions': [
                    "Check that you're using the right data types for operations",
                    "Make sure you're calling functions with the correct number of arguments",
                    "Convert data types when necessary (int(), str(), float())",
                    "Check if you're trying to call something that isn't a function"
                ],
                'example': "# Type conversion:\nage = int(input('Enter age: '))  # Convert string to int\nresult = str(age) + ' years old'  # Convert int to string"
            },
            'IndexError': {
                'keywords': ['indexerror', 'list index out of range', 'string index out of range'],
                'solutions': [
                    "Check that your index is within the valid range (0 to len(list)-1)",
                    "Use len() to check the size of your list/string before accessing",
                    "Remember that Python uses 0-based indexing",
                    "Use try-except blocks to handle potential index errors"
                ],
                'example': "# Safe indexing:\nmy_list = [1, 2, 3]\nif len(my_list) > 2:\n    print(my_list[2])  # Safe access"
            },
            'ValueError': {
                'keywords': ['valueerror', 'invalid literal', 'could not convert'],
                'solutions': [
                    "Check that you're converting the right type of data",
                    "Validate user input before converting",
                    "Use try-except blocks to handle conversion errors",
                    "Make sure the string contains a valid number when converting to int/float"
                ],
                'example': "# Safe conversion:\ntry:\n    num = int(input('Enter number: '))\nexcept ValueError:\n    print('Please enter a valid number')"
            },
            'AttributeError': {
                'keywords': ['attributeerror', 'has no attribute', 'object has no attribute'],
                'solutions': [
                    "Check that the object has the method/attribute you're trying to use",
                    "Make sure you're calling methods on the right type of object",
                    "Check for typos in method/attribute names",
                    "Verify that you've imported the necessary modules"
                ],
                'example': "# Check object type:\nmy_string = 'hello'\nprint(my_string.upper())  # String method\n\nmy_list = [1, 2, 3]\nmy_list.append(4)  # List method"
            },
            'KeyError': {
                'keywords': ['keyerror', 'key not found'],
                'solutions': [
                    "Check that the key exists in the dictionary before accessing",
                    "Use dict.get() method with a default value",
                    "Use 'in' operator to check if key exists",
                    "Check for typos in key names"
                ],
                'example': "# Safe dictionary access:\nmy_dict = {'name': 'Alice', 'age': 25}\n# Method 1:\nif 'name' in my_dict:\n    print(my_dict['name'])\n# Method 2:\nprint(my_dict.get('height', 'Not specified'))"
            }
        }

        message_lower = message.lower()

        # Check if message contains error indicators
        error_indicators = ['error', 'traceback', 'exception', 'line', 'file']
        if not any(indicator in message_lower for indicator in error_indicators):
            return None

        # Find matching error type
        for error_type, error_info in error_patterns.items():
            if any(keyword in message_lower for keyword in error_info['keywords']):
                response_text = f"🐛 **{error_type} Detected!**\n\n"
                response_text += f"This error typically occurs when:\n"

                # Add solutions
                for i, solution in enumerate(error_info['solutions'], 1):
                    response_text += f"{i}. {solution}\n"

                response_text += f"\n💡 **Example of correct code:**\n```python\n{error_info['example']}\n```"
                response_text += f"\n\n🔧 **Quick Fix Tips:**\n"
                response_text += f"• Read the error message carefully - it tells you the line number\n"
                response_text += f"• Check the exact line mentioned in the error\n"
                response_text += f"• Look at the lines just before the error too\n"
                response_text += f"• Test your fix with a simple example first"

                return {
                    'text': response_text,
                    'type': 'error_help',
                    'code_example': error_info['example'],
                    'suggestions': [
                        'Show me more examples',
                        'Explain this error type',
                        'Help with debugging',
                        'Test my fixed code'
                    ]
                }

        # Generic error response if no specific pattern matched
        if any(word in message_lower for word in ['error', 'traceback', 'exception']):
            return {
                'text': "🐛 **I see you're having a Python error!**\n\nTo help you better, please:\n\n1. **Copy the full error message** (including the traceback)\n2. **Share the problematic code** if possible\n3. **Tell me what you were trying to do**\n\n🔍 **Common debugging steps:**\n• Read the error message carefully\n• Check the line number mentioned\n• Look for typos and syntax issues\n• Ensure proper indentation\n• Verify variable names are spelled correctly\n\nPaste the complete error message and I'll give you specific help!",
                'type': 'error_help',
                'suggestions': [
                    'Paste full error message',
                    'Show me the code',
                    'Debugging tips',
                    'Common Python errors'
                ]
            }

        return None
