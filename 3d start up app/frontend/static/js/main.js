// Main JavaScript for Interactive Python Learning App

// Global variables
let codeEditor = null;
let currentFlowchart = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeCodeEditor();
    initializeEventListeners();
    initializeModals();
});

// Navigation functionality
function initializeNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navMenu.classList.remove('active');
            }
        });
    }
}

// Initialize CodeMirror editor
function initializeCodeEditor() {
    const codeEditorElement = document.getElementById('code-editor');
    if (codeEditorElement) {
        codeEditor = CodeMirror(codeEditorElement, {
            mode: 'python',
            theme: 'monokai',
            lineNumbers: true,
            indentUnit: 4,
            indentWithTabs: false,
            lineWrapping: true,
            matchBrackets: true,
            autoCloseBrackets: true,
            foldGutter: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
            extraKeys: {
                'Ctrl-Space': 'autocomplete',
                'F11': function(cm) {
                    cm.setOption('fullScreen', !cm.getOption('fullScreen'));
                },
                'Esc': function(cm) {
                    if (cm.getOption('fullScreen')) cm.setOption('fullScreen', false);
                }
            }
        });
        
        // Update stats on change
        codeEditor.on('change', updateCodeStats);
        codeEditor.on('cursorActivity', updateCursorPosition);
        
        // Set initial placeholder
        if (codeEditor.getValue() === '') {
            codeEditor.setValue('# Write your Python code here\n');
            codeEditor.setCursor(1, 0);
        }
    }
}

// Update code statistics
function updateCodeStats() {
    if (!codeEditor) return;
    
    const lineCountElement = document.getElementById('line-count');
    const charCountElement = document.getElementById('char-count');
    
    if (lineCountElement) {
        lineCountElement.textContent = `Lines: ${codeEditor.lineCount()}`;
    }
    
    if (charCountElement) {
        const content = codeEditor.getValue();
        charCountElement.textContent = `Characters: ${content.length}`;
    }
}

// Update cursor position
function updateCursorPosition() {
    if (!codeEditor) return;
    
    const cursorPositionElement = document.getElementById('cursor-position');
    if (cursorPositionElement) {
        const cursor = codeEditor.getCursor();
        cursorPositionElement.textContent = `Line ${cursor.line + 1}, Col ${cursor.ch + 1}`;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Code execution
    const runCodeBtn = document.getElementById('run-code-btn');
    if (runCodeBtn) {
        runCodeBtn.addEventListener('click', executeCode);
    }
    
    // Clear code
    const clearCodeBtn = document.getElementById('clear-code-btn');
    if (clearCodeBtn) {
        clearCodeBtn.addEventListener('click', clearCode);
    }
    
    // Copy code
    const copyCodeBtn = document.getElementById('copy-code-btn');
    if (copyCodeBtn) {
        copyCodeBtn.addEventListener('click', copyCode);
    }
    
    // Clear output
    const clearOutputBtn = document.getElementById('clear-output-btn');
    if (clearOutputBtn) {
        clearOutputBtn.addEventListener('click', clearOutput);
    }
    
    // Copy output
    const copyOutputBtn = document.getElementById('copy-output-btn');
    if (copyOutputBtn) {
        copyOutputBtn.addEventListener('click', copyOutput);
    }
    
    // Flowchart controls
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const resetZoomBtn = document.getElementById('reset-zoom-btn');
    
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => zoomFlowchart(1.2));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => zoomFlowchart(0.8));
    if (resetZoomBtn) resetZoomBtn.addEventListener('click', resetFlowchartZoom);
    
    // Quick actions
    const samplesBtn = document.getElementById('samples-btn');
    const helpBtn = document.getElementById('help-btn');
    
    if (samplesBtn) samplesBtn.addEventListener('click', showSamplesModal);
    if (helpBtn) helpBtn.addEventListener('click', showHelpModal);
}

// Execute Python code
async function executeCode() {
    if (!codeEditor) return;
    
    const code = codeEditor.getValue().trim();
    if (!code || code === '# Write your Python code here') {
        showNotification('Please write some code first!', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/execute_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code })
        });
        
        const result = await response.json();
        
        if (result.success) {
            displayOutput(result.result);
            showNotification('Code executed successfully!', 'success');
        } else {
            displayOutput({
                success: false,
                error: result.error,
                output: '',
                execution_time: 0
            });
            showNotification('Code execution failed!', 'error');
        }
    } catch (error) {
        console.error('Error executing code:', error);
        displayOutput({
            success: false,
            error: 'Network error: Could not connect to server',
            output: '',
            execution_time: 0
        });
        showNotification('Network error occurred!', 'error');
    } finally {
        showLoading(false);
    }
}

// Display code output
function displayOutput(result) {
    const outputContainer = document.getElementById('output-container');
    if (!outputContainer) return;
    
    outputContainer.innerHTML = '';
    
    if (result.success) {
        const outputDiv = document.createElement('div');
        outputDiv.className = 'output-success';
        outputDiv.innerHTML = `
            <div class="output-header">
                <i class="fas fa-check-circle"></i>
                <span>Execution completed in ${result.execution_time}s</span>
            </div>
            <pre class="output-content">${escapeHtml(result.output || 'No output')}</pre>
        `;
        outputContainer.appendChild(outputDiv);
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'output-error';
        errorDiv.innerHTML = `
            <div class="output-header">
                <i class="fas fa-exclamation-circle"></i>
                <span>Execution failed</span>
            </div>
            <pre class="output-content error-content">${escapeHtml(result.error)}</pre>
            ${result.output ? `<pre class="output-content">${escapeHtml(result.output)}</pre>` : ''}
        `;
        outputContainer.appendChild(errorDiv);
    }
}

// Clear code editor
function clearCode() {
    if (codeEditor) {
        codeEditor.setValue('# Write your Python code here\n');
        codeEditor.setCursor(1, 0);
        updateCodeStats();
        showNotification('Code cleared!', 'info');
    }
}

// Copy code to clipboard
function copyCode() {
    if (codeEditor) {
        const code = codeEditor.getValue();
        navigator.clipboard.writeText(code).then(() => {
            showNotification('Code copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy code!', 'error');
        });
    }
}

// Clear output
function clearOutput() {
    const outputContainer = document.getElementById('output-container');
    if (outputContainer) {
        outputContainer.innerHTML = `
            <div class="output-placeholder">
                <i class="fas fa-terminal"></i>
                <p>Code output will appear here when you run your program</p>
            </div>
        `;
        showNotification('Output cleared!', 'info');
    }
}

// Copy output to clipboard
function copyOutput() {
    const outputContainer = document.getElementById('output-container');
    if (outputContainer) {
        const outputContent = outputContainer.textContent || outputContainer.innerText;
        navigator.clipboard.writeText(outputContent).then(() => {
            showNotification('Output copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy output!', 'error');
        });
    }
}

// Flowchart zoom functions
function zoomFlowchart(factor) {
    // Implementation depends on the flowchart library used
    console.log('Zoom flowchart by factor:', factor);
}

function resetFlowchartZoom() {
    // Implementation depends on the flowchart library used
    console.log('Reset flowchart zoom');
}

// Modal functions
function initializeModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });
    
    // Close modals with close button
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
}

function showSamplesModal() {
    const modal = document.getElementById('samples-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showHelpModal() {
    // Create help modal content dynamically
    const helpContent = `
        <div class="help-content">
            <h4>How to Use This App</h4>
            <ul>
                <li><strong>Mode 1:</strong> Enter a problem description to get a flowchart, then write code</li>
                <li><strong>Mode 2:</strong> Write code to get a flowchart and error analysis</li>
                <li><strong>Code Editor:</strong> Use Ctrl+Space for autocomplete, F11 for fullscreen</li>
                <li><strong>Chatbot:</strong> Click the chat icon for help and motivation</li>
            </ul>
            <h4>Keyboard Shortcuts</h4>
            <ul>
                <li><strong>Ctrl+Enter:</strong> Run code</li>
                <li><strong>Ctrl+Space:</strong> Autocomplete</li>
                <li><strong>F11:</strong> Toggle fullscreen editor</li>
            </ul>
        </div>
    `;
    
    showModal('Help', helpContent);
}

function showModal(title, content) {
    // Create modal dynamically
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Utility functions
function showLoading(show) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.add('active');
        } else {
            loadingOverlay.classList.remove('active');
        }
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+Enter to run code
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        executeCode();
    }
});
