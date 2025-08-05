// Mode 2: Code Analysis functionality

document.addEventListener('DOMContentLoaded', function() {
    initializeMode2();
});

function initializeMode2() {
    // Initialize event listeners specific to Mode 2
    const analyzeCodeBtn = document.getElementById('analyze-code-btn');
    const loadSampleBtn = document.getElementById('load-sample-btn');
    const refreshAnalysisBtn = document.getElementById('refresh-analysis-btn');
    const clearErrorsBtn = document.getElementById('clear-errors-btn');
    const exportFlowchartBtn = document.getElementById('export-flowchart-btn');
    
    if (analyzeCodeBtn) {
        analyzeCodeBtn.addEventListener('click', analyzeCode);
    }
    
    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', showSampleCodes);
    }
    
    if (refreshAnalysisBtn) {
        refreshAnalysisBtn.addEventListener('click', refreshAnalysis);
    }
    
    if (clearErrorsBtn) {
        clearErrorsBtn.addEventListener('click', clearErrors);
    }
    
    if (exportFlowchartBtn) {
        exportFlowchartBtn.addEventListener('click', exportFlowchart);
    }
    
    // Initialize sample codes
    initializeSampleCodes();
    
    // Auto-analyze on code change (debounced)
    if (codeEditor) {
        let analysisTimeout;
        codeEditor.on('change', function() {
            clearTimeout(analysisTimeout);
            analysisTimeout = setTimeout(autoAnalyze, 2000); // 2 second delay
        });
    }
}

async function analyzeCode() {
    if (!codeEditor) return;
    
    const code = codeEditor.getValue().trim();
    if (!code || code === '# Write your Python code here') {
        showNotification('Please write some code first!', 'warning');
        return;
    }
    
    showLoading(true);
    
    try {
        const response = await fetch('/api/analyze_code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Render the flowchart
            renderFlowchart(result.flowchart);
            
            // Display errors
            displayErrors(result.errors);
            
            showNotification('Code analyzed successfully!', 'success');
            
            // Provide analysis feedback
            provideAnalysisFeedback(result.flowchart, result.errors);
        } else {
            showNotification(`Failed to analyze code: ${result.error}`, 'error');
            clearFlowchart();
            clearErrors();
        }
    } catch (error) {
        console.error('Error analyzing code:', error);
        showNotification('Network error: Could not connect to server', 'error');
        clearFlowchart();
        clearErrors();
    } finally {
        showLoading(false);
    }
}

function displayErrors(errors) {
    const errorsContainer = document.getElementById('errors-container');
    if (!errorsContainer) return;
    
    errorsContainer.innerHTML = '';
    
    if (!errors || errors.length === 0) {
        errorsContainer.innerHTML = `
            <div class="errors-placeholder">
                <i class="fas fa-check-circle"></i>
                <p>No errors found! Your code looks good.</p>
            </div>
        `;
        return;
    }
    
    errors.forEach(error => {
        const errorElement = document.createElement('div');
        errorElement.className = `error-item ${error.severity}`;
        
        errorElement.innerHTML = `
            <div class="error-icon ${error.severity}">
                <i class="fas fa-${getErrorIcon(error.severity)}"></i>
            </div>
            <div class="error-content">
                <div class="error-type">${error.type.replace(/_/g, ' ')}</div>
                <div class="error-message">${error.message}</div>
                ${error.line ? `<div class="error-line">Line ${error.line}</div>` : ''}
            </div>
        `;
        
        // Add click handler to jump to line
        if (error.line && codeEditor) {
            errorElement.addEventListener('click', () => {
                codeEditor.setCursor(error.line - 1, 0);
                codeEditor.focus();
                showNotification(`Jumped to line ${error.line}`, 'info');
            });
            errorElement.style.cursor = 'pointer';
        }
        
        errorsContainer.appendChild(errorElement);
    });
}

function getErrorIcon(severity) {
    const icons = {
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        style: 'info-circle'
    };
    return icons[severity] || 'info-circle';
}

function provideAnalysisFeedback(flowchartData, errors) {
    if (!window.chatbot) return;
    
    let feedback = "I've analyzed your code! Here's what I found:\n\n";
    
    // Flowchart feedback
    if (flowchartData && flowchartData.nodes) {
        feedback += `📊 **Code Structure:**\n`;
        feedback += `• Your code has ${flowchartData.nodes.length} main components\n`;
        
        const nodeTypes = flowchartData.nodes.reduce((acc, node) => {
            acc[node.type] = (acc[node.type] || 0) + 1;
            return acc;
        }, {});
        
        if (nodeTypes.decision) {
            feedback += `• Contains ${nodeTypes.decision} decision point(s)\n`;
        }
        if (nodeTypes.loop) {
            feedback += `• Contains ${nodeTypes.loop} loop(s)\n`;
        }
        if (nodeTypes.input) {
            feedback += `• Takes user input\n`;
        }
        if (nodeTypes.output) {
            feedback += `• Produces output\n`;
        }
    }
    
    // Error feedback
    if (errors && errors.length > 0) {
        feedback += `\n🐛 **Issues Found:**\n`;
        
        const errorCounts = errors.reduce((acc, error) => {
            acc[error.severity] = (acc[error.severity] || 0) + 1;
            return acc;
        }, {});
        
        if (errorCounts.error) {
            feedback += `• ${errorCounts.error} error(s) that need fixing\n`;
        }
        if (errorCounts.warning) {
            feedback += `• ${errorCounts.warning} warning(s) to consider\n`;
        }
        if (errorCounts.style) {
            feedback += `• ${errorCounts.style} style suggestion(s)\n`;
        }
        
        feedback += `\nClick on any error above to jump to that line in your code!`;
    } else {
        feedback += `\n✅ **Great job!** No errors found in your code.`;
    }
    
    feedback += `\n\nNeed help fixing any issues? Just ask me!`;
    
    window.chatbot.addMessage({
        type: 'bot',
        content: feedback,
        timestamp: new Date()
    });
}

function autoAnalyze() {
    if (!codeEditor) return;
    
    const code = codeEditor.getValue().trim();
    if (code && code !== '# Write your Python code here' && code.length > 10) {
        analyzeCode();
    }
}

function refreshAnalysis() {
    analyzeCode();
}

function clearErrors() {
    const errorsContainer = document.getElementById('errors-container');
    if (errorsContainer) {
        errorsContainer.innerHTML = `
            <div class="errors-placeholder">
                <i class="fas fa-check-circle"></i>
                <p>Error analysis will appear here after code analysis</p>
            </div>
        `;
        showNotification('Errors cleared!', 'info');
    }
}

function exportFlowchart() {
    if (flowchartRenderer) {
        const svgData = flowchartRenderer.exportSVG();
        if (svgData) {
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'flowchart.svg';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showNotification('Flowchart exported!', 'success');
        } else {
            showNotification('No flowchart to export!', 'warning');
        }
    }
}

function initializeSampleCodes() {
    // Handle sample code selection
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('sample-code')) {
            const code = e.target.getAttribute('data-code');
            if (code && codeEditor) {
                codeEditor.setValue(code);
                updateCodeStats();
                
                // Close modal
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
                
                showNotification('Sample code loaded!', 'success');
                
                // Auto-analyze the loaded code
                setTimeout(analyzeCode, 500);
            }
        }
    });
}

function showSampleCodes() {
    const modal = document.getElementById('samples-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Debug tips functionality
function showDebugTips() {
    const debugTipsContent = `
        <div class="debug-tips-content">
            <h4>🐛 Debugging Tips</h4>
            
            <h5>Common Python Errors:</h5>
            <ul>
                <li><strong>SyntaxError:</strong> Check for missing colons, parentheses, or quotes</li>
                <li><strong>IndentationError:</strong> Ensure consistent indentation (4 spaces or 1 tab)</li>
                <li><strong>NameError:</strong> Variable used before being defined</li>
                <li><strong>TypeError:</strong> Wrong data type for an operation</li>
                <li><strong>IndexError:</strong> Accessing list/string index that doesn't exist</li>
            </ul>
            
            <h5>Debugging Strategies:</h5>
            <ul>
                <li>Read error messages carefully - they tell you what's wrong</li>
                <li>Use print() statements to check variable values</li>
                <li>Test small parts of your code separately</li>
                <li>Check your logic step by step</li>
                <li>Take breaks when frustrated - fresh eyes help!</li>
            </ul>
            
            <h5>Code Quality Tips:</h5>
            <ul>
                <li>Use meaningful variable names</li>
                <li>Add comments to explain complex logic</li>
                <li>Keep functions small and focused</li>
                <li>Handle edge cases and errors</li>
                <li>Test with different inputs</li>
            </ul>
        </div>
    `;
    
    showModal('Debugging Tips', debugTipsContent);
}

// Help functionality specific to Mode 2
function showMode2Help() {
    const helpContent = `
        <div class="help-content">
            <h4>Mode 2: Code Analysis</h4>
            <p>This mode helps you understand and debug your Python code:</p>
            
            <ol>
                <li><strong>Write/Paste Code:</strong> Enter your Python code in the editor</li>
                <li><strong>Analyze Code:</strong> Click to generate a flowchart and find errors</li>
                <li><strong>Review Flowchart:</strong> See the visual representation of your code's logic</li>
                <li><strong>Fix Errors:</strong> Click on errors to jump to the problematic lines</li>
                <li><strong>Test Code:</strong> Run your code to verify it works correctly</li>
            </ol>
            
            <h4>Features:</h4>
            <ul>
                <li><strong>Auto-Analysis:</strong> Code is analyzed automatically as you type</li>
                <li><strong>Error Detection:</strong> Finds syntax, logic, and style issues</li>
                <li><strong>Visual Flowchart:</strong> Shows your code's structure and flow</li>
                <li><strong>Interactive Errors:</strong> Click errors to jump to the line</li>
                <li><strong>Export Options:</strong> Save your flowchart as SVG</li>
            </ul>
            
            <h4>Error Types:</h4>
            <ul>
                <li><span style="color: #e74c3c;">🔴 Errors:</span> Must be fixed for code to run</li>
                <li><span style="color: #f39c12;">🟡 Warnings:</span> Potential issues to consider</li>
                <li><span style="color: #3498db;">🔵 Style:</span> Code style improvements</li>
            </ul>
        </div>
    `;
    
    showModal('Mode 2 Help', helpContent);
}

// Override help and debug buttons for Mode 2
document.addEventListener('DOMContentLoaded', function() {
    const helpBtn = document.getElementById('help-btn');
    const debugTipsBtn = document.getElementById('debug-tips-btn');
    
    if (helpBtn) {
        helpBtn.removeEventListener('click', showHelpModal);
        helpBtn.addEventListener('click', showMode2Help);
    }
    
    if (debugTipsBtn) {
        debugTipsBtn.addEventListener('click', showDebugTips);
    }
});

// Keyboard shortcuts for Mode 2
document.addEventListener('keydown', function(e) {
    // Ctrl+A to analyze code
    if (e.ctrlKey && e.key === 'a' && e.target.closest('.CodeMirror')) {
        // Don't override select all in code editor
        return;
    }
    
    if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        analyzeCode();
    }
    
    // Ctrl+E to export flowchart
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        exportFlowchart();
    }
    
    // F5 to refresh analysis
    if (e.key === 'F5') {
        e.preventDefault();
        refreshAnalysis();
    }
});

// Auto-save code to localStorage
function autoSaveCode() {
    if (codeEditor) {
        codeEditor.on('change', function() {
            localStorage.setItem('mode2_code', codeEditor.getValue());
        });
        
        // Load saved code on page load
        const savedCode = localStorage.getItem('mode2_code');
        if (savedCode && savedCode.trim() !== '') {
            codeEditor.setValue(savedCode);
            updateCodeStats();
            // Auto-analyze after a short delay
            setTimeout(autoAnalyze, 1000);
        }
    }
}

// Initialize auto-save
document.addEventListener('DOMContentLoaded', autoSaveCode);

// Export functions for external use
window.Mode2 = {
    analyzeCode,
    showSampleCodes,
    showDebugTips,
    showMode2Help,
    exportFlowchart
};
