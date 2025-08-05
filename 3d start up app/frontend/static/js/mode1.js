// Mode 1: Problem to Code functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeMode1();
});

function initializeMode1() {
    // Initialize event listeners specific to Mode 1
    const generateFlowchartBtn = document.getElementById('generate-flowchart-btn');
    const clearProblemBtn = document.getElementById('clear-problem-btn');
    const problemInput = document.getElementById('problem-input');
    
    if (generateFlowchartBtn) {
        generateFlowchartBtn.addEventListener('click', generateFlowchartFromProblem);
    }
    
    if (clearProblemBtn) {
        clearProblemBtn.addEventListener('click', clearProblemInput);
    }
    
    if (problemInput) {
        problemInput.addEventListener('input', updateGenerateButton);
    }
    
    // Initialize sample problems
    initializeSampleProblems();
    
    // Update button state initially
    updateGenerateButton();
}

async function generateFlowchartFromProblem() {
    const problemInput = document.getElementById('problem-input');
    const problem = problemInput.value.trim();
    
    if (!problem) {
        showNotification('Please enter a problem description first!', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/generate_flowchart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ problem: problem })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Render the flowchart
            renderFlowchart(result.flowchart);
            showNotification('Flowchart generated successfully!', 'success');
            
            // Provide coding guidance
            provideCodingGuidance(result.flowchart);
            
            // Focus on code editor
            if (codeEditor) {
                codeEditor.focus();
            }
        } else {
            showNotification(`Failed to generate flowchart: ${result.error}`, 'error');
            clearFlowchart();
        }
    } catch (error) {
        console.error('Error generating flowchart:', error);
        showNotification('Network error: Could not connect to server', 'error');
        clearFlowchart();
    } finally {
        showLoading(false);
    }
}

function provideCodingGuidance(flowchartData) {
    if (!flowchartData || !flowchartData.nodes) return;
    
    // Generate coding hints based on flowchart
    const hints = generateCodingHints(flowchartData.nodes);
    
    // Add hints to code editor as comments
    if (codeEditor && hints.length > 0) {
        const currentCode = codeEditor.getValue();
        if (currentCode.trim() === '# Write your Python code here' || currentCode.trim() === '') {
            const hintComments = hints.map(hint => `# ${hint}`).join('\n');
            const templateCode = `${hintComments}\n\n# Your code here:\n`;
            codeEditor.setValue(templateCode);
            codeEditor.setCursor(codeEditor.lineCount(), 0);
        }
    }
    
    // Show guidance in chatbot
    if (window.chatbot) {
        const guidanceMessage = `I've generated a flowchart for your problem! Here are some coding tips:\n\n${hints.map(hint => `• ${hint}`).join('\n')}\n\nFeel free to ask me if you need help with any specific part!`;
        window.chatbot.addMessage({
            type: 'bot',
            content: guidanceMessage,
            timestamp: new Date()
        });
    }
}

function generateCodingHints(nodes) {
    const hints = [];
    
    nodes.forEach(node => {
        switch (node.type) {
            case 'input':
                hints.push('Use input() function to get user input');
                break;
            case 'output':
                hints.push('Use print() function to display output');
                break;
            case 'decision':
                hints.push('Use if-elif-else statements for decision making');
                break;
            case 'loop':
                hints.push('Use for or while loops for repetition');
                break;
            case 'process':
                if (node.label.toLowerCase().includes('calculate')) {
                    hints.push('Perform mathematical calculations using operators (+, -, *, /)');
                }
                break;
        }
    });
    
    // Add general hints
    if (hints.length === 0) {
        hints.push('Follow the flowchart step by step');
        hints.push('Use meaningful variable names');
        hints.push('Add comments to explain your code');
    }
    
    return [...new Set(hints)]; // Remove duplicates
}

function clearProblemInput() {
    const problemInput = document.getElementById('problem-input');
    if (problemInput) {
        problemInput.value = '';
        updateGenerateButton();
        clearFlowchart();
        showNotification('Problem description cleared!', 'info');
    }
}

function updateGenerateButton() {
    const problemInput = document.getElementById('problem-input');
    const generateBtn = document.getElementById('generate-flowchart-btn');
    
    if (problemInput && generateBtn) {
        const hasText = problemInput.value.trim().length > 0;
        generateBtn.disabled = !hasText;
        
        if (hasText) {
            generateBtn.classList.remove('disabled');
        } else {
            generateBtn.classList.add('disabled');
        }
    }
}

function initializeSampleProblems() {
    // Handle sample problem selection
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sample-problem')) {
            const problem = e.target.getAttribute('data-problem');
            if (problem) {
                const problemInput = document.getElementById('problem-input');
                if (problemInput) {
                    problemInput.value = problem;
                    updateGenerateButton();
                }
                
                // Close modal
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
                
                showNotification('Sample problem loaded!', 'success');
            }
        }
    });
    
    // Sample problems button
    const samplesBtn = document.getElementById('samples-btn');
    if (samplesBtn) {
        samplesBtn.addEventListener('click', showSampleProblems);
    }
}

function showSampleProblems() {
    const modal = document.getElementById('samples-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Help functionality specific to Mode 1
function showMode1Help() {
    const helpContent = `
        <div class="help-content">
            <h4>Mode 1: Problem to Code</h4>
            <p>This mode helps you solve programming problems step by step:</p>
            
            <ol>
                <li><strong>Describe the Problem:</strong> Enter a clear description of what your program should do</li>
                <li><strong>Generate Flowchart:</strong> Click the button to create a visual flowchart</li>
                <li><strong>Write Code:</strong> Follow the flowchart to write your Python code</li>
                <li><strong>Test Your Code:</strong> Run your code to see if it works correctly</li>
            </ol>
            
            <h4>Tips for Better Problem Descriptions:</h4>
            <ul>
                <li>Be specific about inputs and outputs</li>
                <li>Mention any conditions or special cases</li>
                <li>Include examples if helpful</li>
                <li>Break complex problems into smaller parts</li>
            </ul>
            
            <h4>Example Problem Description:</h4>
            <p><em>"Write a program that asks the user for their age and determines if they can vote (18 or older). Display an appropriate message."</em></p>
        </div>
    `;
    
    showModal('Mode 1 Help', helpContent);
}

// Override help button for Mode 1
document.addEventListener('DOMContentLoaded', function() {
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.removeEventListener('click', showHelpModal);
        helpBtn.addEventListener('click', showMode1Help);
    }
});

// Keyboard shortcuts for Mode 1
document.addEventListener('keydown', function(e) {
    // Ctrl+G to generate flowchart
    if (e.ctrlKey && e.key === 'g') {
        e.preventDefault();
        generateFlowchartFromProblem();
    }
    
    // Ctrl+Shift+C to clear problem
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        clearProblemInput();
    }
});

// Auto-save problem description to localStorage
function autoSaveProblem() {
    const problemInput = document.getElementById('problem-input');
    if (problemInput) {
        problemInput.addEventListener('input', function() {
            localStorage.setItem('mode1_problem', this.value);
        });
        
        // Load saved problem on page load
        const savedProblem = localStorage.getItem('mode1_problem');
        if (savedProblem) {
            problemInput.value = savedProblem;
            updateGenerateButton();
        }
    }
}

// Initialize auto-save
document.addEventListener('DOMContentLoaded', autoSaveProblem);

// Export functions for external use
window.Mode1 = {
    generateFlowchartFromProblem,
    clearProblemInput,
    showSampleProblems,
    showMode1Help
};
