#!/usr/bin/env python3
"""
Test the chatbot error detection functionality
"""

import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the SimpleChatbot from app_simple.py
from app_simple import SimpleChatbot

def test_chatbot_error_detection():
    """Test the chatbot's error detection capabilities"""
    
    chatbot = SimpleChatbot()
    
    print("🤖 Testing Chatbot Error Detection")
    print("=" * 50)
    
    # Test cases with different types of Python errors
    test_cases = [
        {
            'input': 'I got a SyntaxError: invalid syntax',
            'expected_type': 'error_help'
        },
        {
            'input': 'IndentationError: expected an indented block',
            'expected_type': 'error_help'
        },
        {
            'input': 'NameError: name x is not defined',
            'expected_type': 'error_help'
        },
        {
            'input': 'TypeError: unsupported operand type',
            'expected_type': 'error_help'
        },
        {
            'input': 'IndexError: list index out of range',
            'expected_type': 'error_help'
        },
        {
            'input': 'Hello, how are you?',
            'expected_type': 'help'
        },
        {
            'input': 'What is a variable?',
            'expected_type': 'help'
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🧪 Test {i}: {test_case['input'][:50]}...")
        
        response = chatbot.get_response(test_case['input'])
        
        print(f"✅ Response Type: {response['type']}")
        print(f"📝 Message Preview: {response['message'][:100]}...")
        
        if 'error' in test_case['input'].lower():
            if response['type'] == 'error_help':
                print("✅ Correctly detected as error help!")
            else:
                print("❌ Failed to detect error")
        else:
            print("✅ Normal response")
        
        print("-" * 30)

if __name__ == '__main__':
    test_chatbot_error_detection()
