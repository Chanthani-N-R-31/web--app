// Chatbot functionality for Interactive Python Learning App

class Chatbot {
    constructor() {
        console.log('Chatbot constructor called');
        this.isOpen = false;
        this.messages = [];
        this.isTyping = false;

        try {
            this.initializeElements();
            this.initializeEventListeners();
            this.addWelcomeMessage();
            console.log('Chatbot initialization completed');
        } catch (error) {
            console.error('Error in chatbot constructor:', error);
        }
    }
    
    initializeElements() {
        console.log('Initializing chatbot elements...');
        this.chatbotToggle = document.getElementById('chatbot-toggle');
        this.chatbotWindow = document.getElementById('chatbot-window');
        this.chatbotClose = document.getElementById('chatbot-close');
        this.chatbotMessages = document.getElementById('chatbot-messages');
        this.chatbotInput = document.getElementById('chatbot-input-field');
        this.chatbotSend = document.getElementById('chatbot-send');

        // Debug: Check if elements were found
        const elements = {
            'chatbot-toggle': this.chatbotToggle,
            'chatbot-window': this.chatbotWindow,
            'chatbot-close': this.chatbotClose,
            'chatbot-messages': this.chatbotMessages,
            'chatbot-input-field': this.chatbotInput,
            'chatbot-send': this.chatbotSend
        };

        for (const [name, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Chatbot element not found: ${name}`);
            } else {
                console.log(`Chatbot element found: ${name}`);
            }
        }
    }
    
    initializeEventListeners() {
        if (this.chatbotToggle) {
            this.chatbotToggle.addEventListener('click', () => this.toggleChatbot());
        }
        
        if (this.chatbotClose) {
            this.chatbotClose.addEventListener('click', () => this.closeChatbot());
        }
        
        if (this.chatbotSend) {
            this.chatbotSend.addEventListener('click', () => this.sendMessage());
        }
        
        if (this.chatbotInput) {
            this.chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            this.chatbotInput.addEventListener('input', () => {
                this.updateSendButton();
            });
        }
        
        // Close chatbot when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.chatbotWindow.contains(e.target) && 
                !this.chatbotToggle.contains(e.target)) {
                this.closeChatbot();
            }
        });
    }
    
    toggleChatbot() {
        if (this.isOpen) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }
    
    openChatbot() {
        this.isOpen = true;
        this.chatbotWindow.classList.add('active');
        this.chatbotInput.focus();
        
        // Update toggle icon
        this.chatbotToggle.innerHTML = '<i class="fas fa-times"></i>';
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    closeChatbot() {
        this.isOpen = false;
        this.chatbotWindow.classList.remove('active');
        
        // Update toggle icon
        this.chatbotToggle.innerHTML = '<i class="fas fa-comments"></i>';
    }
    
    addWelcomeMessage() {
        const welcomeMessage = {
            type: 'bot',
            content: "Hello! I'm your Python learning assistant. I can help you with:\n\n• Programming concepts\n• Debugging tips\n• Code explanations\n• Motivation when you're stuck\n\nWhat would you like to learn about?",
            timestamp: new Date()
        };
        
        this.addMessage(welcomeMessage);
    }
    
    async sendMessage() {
        const message = this.chatbotInput.value.trim();
        if (!message || this.isTyping) return;
        
        // Add user message
        const userMessage = {
            type: 'user',
            content: message,
            timestamp: new Date()
        };
        
        this.addMessage(userMessage);
        this.chatbotInput.value = '';
        this.updateSendButton();
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to backend
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            const result = await response.json();
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            if (result.success) {
                const botMessage = {
                    type: 'bot',
                    content: result.response.message,
                    messageType: result.response.type,
                    suggestions: result.response.suggestions,
                    codeExample: result.response.code_example,
                    timestamp: new Date()
                };

                this.addMessage(botMessage);
            } else {
                this.addErrorMessage('Sorry, I encountered an error. Please try again.');
            }
        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTypingIndicator();
            this.addErrorMessage('Sorry, I couldn\'t connect to the server. Please check your connection.');
        }
    }
    
    addMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}-message`;

        // Add data-type attribute for special styling
        if (message.type === 'bot' && message.messageType) {
            messageElement.setAttribute('data-type', message.messageType);
        }

        const contentElement = document.createElement('div');
        contentElement.className = 'message-content';

        // Format message content
        let content = this.formatMessageContent(message.content);
        contentElement.innerHTML = content;

        messageElement.appendChild(contentElement);

        // Add suggestions if available
        if (message.suggestions && message.suggestions.length > 0) {
            const suggestionsElement = this.createSuggestions(message.suggestions);
            messageElement.appendChild(suggestionsElement);
        }

        // Add code example if available
        if (message.codeExample) {
            const codeElement = this.createCodeExample(message.codeExample);
            messageElement.appendChild(codeElement);
        }

        this.chatbotMessages.appendChild(messageElement);
        this.scrollToBottom();

        // Store message
        this.messages.push(message);
    }
    
    formatMessageContent(content) {
        // Convert newlines to <br>
        content = content.replace(/\n/g, '<br>');

        // Format code blocks (both ```python and ``` variants)
        content = content.replace(/```python\n([\s\S]*?)\n```/g,
            '<pre class="code-block"><code>$1</code></pre>');
        content = content.replace(/```\n([\s\S]*?)\n```/g,
            '<pre class="code-block"><code>$1</code></pre>');
        content = content.replace(/```([^`]+)```/g,
            '<pre class="code-block"><code>$1</code></pre>');

        // Format inline code
        content = content.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

        // Format bullet points
        content = content.replace(/^• (.+)$/gm, '<li>$1</li>');
        content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Format numbered lists
        content = content.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
        content = content.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');

        // Format bold text
        content = content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        // Format error indicators with icons
        content = content.replace(/🐛/g, '<span class="error-icon">🐛</span>');
        content = content.replace(/💡/g, '<span class="tip-icon">💡</span>');
        content = content.replace(/🔧/g, '<span class="fix-icon">🔧</span>');
        content = content.replace(/🔍/g, '<span class="search-icon">🔍</span>');

        return content;
    }
    
    createSuggestions(suggestions) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'message-suggestions';
        
        const title = document.createElement('div');
        title.className = 'suggestions-title';
        title.textContent = 'Quick suggestions:';
        suggestionsContainer.appendChild(title);
        
        suggestions.forEach(suggestion => {
            const suggestionBtn = document.createElement('button');
            suggestionBtn.className = 'suggestion-btn';
            suggestionBtn.textContent = suggestion;
            suggestionBtn.addEventListener('click', () => {
                this.chatbotInput.value = suggestion;
                this.sendMessage();
            });
            suggestionsContainer.appendChild(suggestionBtn);
        });
        
        return suggestionsContainer;
    }
    
    createCodeExample(code) {
        const codeContainer = document.createElement('div');
        codeContainer.className = 'message-code-example';
        
        const title = document.createElement('div');
        title.className = 'code-example-title';
        title.innerHTML = '<i class="fas fa-code"></i> Code Example:';
        codeContainer.appendChild(title);
        
        const codeElement = document.createElement('pre');
        codeElement.className = 'code-example';
        codeElement.innerHTML = `<code>${this.escapeHtml(code)}</code>`;
        codeContainer.appendChild(codeElement);
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-code-btn';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(code).then(() => {
                copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                }, 2000);
            });
        });
        codeContainer.appendChild(copyBtn);
        
        return codeContainer;
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message bot-message typing-indicator';
        typingElement.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.chatbotMessages.appendChild(typingElement);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = this.chatbotMessages.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    addErrorMessage(message) {
        const errorMessage = {
            type: 'bot',
            content: `<i class="fas fa-exclamation-triangle"></i> ${message}`,
            timestamp: new Date()
        };
        
        this.addMessage(errorMessage);
    }
    
    updateSendButton() {
        const hasText = this.chatbotInput.value.trim().length > 0;
        this.chatbotSend.disabled = !hasText || this.isTyping;
        
        if (hasText && !this.isTyping) {
            this.chatbotSend.style.opacity = '1';
        } else {
            this.chatbotSend.style.opacity = '0.5';
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatbotMessages.scrollTop = this.chatbotMessages.scrollHeight;
        }, 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Public methods for external use
    askQuestion(question) {
        if (!this.isOpen) {
            this.openChatbot();
        }
        
        this.chatbotInput.value = question;
        this.sendMessage();
    }
    
    clearHistory() {
        this.messages = [];
        this.chatbotMessages.innerHTML = '';
        this.addWelcomeMessage();
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing chatbot...');
    try {
        window.chatbot = new Chatbot();
        console.log('Chatbot initialized successfully');
    } catch (error) {
        console.error('Failed to initialize chatbot:', error);
        // Fallback: try again after a delay
        setTimeout(() => {
            try {
                window.chatbot = new Chatbot();
                console.log('Chatbot initialized on retry');
            } catch (retryError) {
                console.error('Chatbot initialization failed on retry:', retryError);
            }
        }, 1000);
    }
});

// Helper functions for other parts of the app
function askChatbot(question) {
    if (window.chatbot) {
        window.chatbot.askQuestion(question);
    }
}

function openChatbot() {
    if (window.chatbot) {
        window.chatbot.openChatbot();
    }
}
