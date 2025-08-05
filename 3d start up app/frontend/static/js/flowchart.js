// Flowchart visualization functionality

class FlowchartRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.svg = null;
        this.nodes = [];
        this.edges = [];
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        
        this.initializeSVG();
        this.setupEventListeners();
    }
    
    initializeSVG() {
        if (!this.container) return;
        
        // Clear container
        this.container.innerHTML = '';
        
        // Create SVG element
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.setAttribute('viewBox', '0 0 800 600');
        this.svg.style.background = '#fafafa';
        
        // Create defs for arrow markers
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#34495e');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        this.svg.appendChild(defs);
        
        // Create main group for transformations
        this.mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.svg.appendChild(this.mainGroup);
        
        this.container.appendChild(this.svg);
    }
    
    setupEventListeners() {
        if (!this.svg) return;
        
        // Mouse events for panning
        this.svg.addEventListener('mousedown', (e) => this.startPan(e));
        this.svg.addEventListener('mousemove', (e) => this.pan(e));
        this.svg.addEventListener('mouseup', () => this.endPan());
        this.svg.addEventListener('mouseleave', () => this.endPan());
        
        // Wheel event for zooming
        this.svg.addEventListener('wheel', (e) => this.zoom(e));
        
        // Prevent context menu
        this.svg.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    renderFlowchart(flowchartData) {
        if (!flowchartData || !this.mainGroup) return;
        
        // Clear previous content
        this.mainGroup.innerHTML = '';
        this.nodes = flowchartData.nodes || [];
        this.edges = flowchartData.edges || [];
        
        // Render edges first (so they appear behind nodes)
        this.edges.forEach(edge => this.renderEdge(edge));
        
        // Render nodes
        this.nodes.forEach(node => this.renderNode(node));
        
        // Add legend
        this.addLegend();
        
        // Reset view
        this.resetView();
    }
    
    renderNode(node) {
        const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        nodeGroup.setAttribute('class', 'flowchart-node');
        nodeGroup.setAttribute('data-node-id', node.id);
        
        // Determine node shape and size based on type
        const { shape, width, height } = this.getNodeGeometry(node.type);
        
        // Create node shape
        let shapeElement;
        switch (shape) {
            case 'ellipse':
                shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                shapeElement.setAttribute('cx', node.x);
                shapeElement.setAttribute('cy', node.y);
                shapeElement.setAttribute('rx', width / 2);
                shapeElement.setAttribute('ry', height / 2);
                break;
            case 'diamond':
                shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const points = [
                    `${node.x},${node.y - height/2}`,
                    `${node.x + width/2},${node.y}`,
                    `${node.x},${node.y + height/2}`,
                    `${node.x - width/2},${node.y}`
                ].join(' ');
                shapeElement.setAttribute('points', points);
                break;
            case 'parallelogram':
                shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                const offset = 15;
                const paraPoints = [
                    `${node.x - width/2 + offset},${node.y - height/2}`,
                    `${node.x + width/2},${node.y - height/2}`,
                    `${node.x + width/2 - offset},${node.y + height/2}`,
                    `${node.x - width/2},${node.y + height/2}`
                ].join(' ');
                shapeElement.setAttribute('points', paraPoints);
                break;
            default: // rectangle
                shapeElement = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                shapeElement.setAttribute('x', node.x - width/2);
                shapeElement.setAttribute('y', node.y - height/2);
                shapeElement.setAttribute('width', width);
                shapeElement.setAttribute('height', height);
                shapeElement.setAttribute('rx', 5);
                break;
        }
        
        // Apply node styling
        shapeElement.setAttribute('class', `node-${node.type}`);
        shapeElement.setAttribute('fill', this.getNodeColor(node.type));
        shapeElement.setAttribute('stroke', this.getNodeStrokeColor(node.type));
        shapeElement.setAttribute('stroke-width', '2');
        
        nodeGroup.appendChild(shapeElement);
        
        // Add text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y);
        text.setAttribute('class', 'node-text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'central');
        text.textContent = this.truncateText(node.label, 20);
        
        // Add title for full text on hover
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = node.label;
        text.appendChild(title);
        
        nodeGroup.appendChild(text);
        
        // Add click handler
        nodeGroup.addEventListener('click', () => this.onNodeClick(node));
        
        this.mainGroup.appendChild(nodeGroup);
    }
    
    renderEdge(edge) {
        const fromNode = this.nodes.find(n => n.id === edge.from);
        const toNode = this.nodes.find(n => n.id === edge.to);
        
        if (!fromNode || !toNode) return;
        
        // Calculate connection points
        const { x1, y1, x2, y2 } = this.calculateConnectionPoints(fromNode, toNode);
        
        // Create path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = this.createEdgePath(x1, y1, x2, y2);
        
        path.setAttribute('d', pathData);
        path.setAttribute('class', 'flowchart-edge');
        path.setAttribute('stroke', '#34495e');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrowhead)');
        
        this.mainGroup.appendChild(path);
        
        // Add edge label if exists
        if (edge.label) {
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', midX);
            text.setAttribute('y', midY - 5);
            text.setAttribute('class', 'edge-label');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = edge.label;
            
            // Add background rectangle
            const bbox = text.getBBox();
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', bbox.x - 2);
            rect.setAttribute('y', bbox.y - 1);
            rect.setAttribute('width', bbox.width + 4);
            rect.setAttribute('height', bbox.height + 2);
            rect.setAttribute('fill', 'white');
            rect.setAttribute('stroke', '#dee2e6');
            rect.setAttribute('rx', 2);
            
            this.mainGroup.appendChild(rect);
            this.mainGroup.appendChild(text);
        }
    }
    
    getNodeGeometry(type) {
        const geometries = {
            start: { shape: 'ellipse', width: 100, height: 50 },
            end: { shape: 'ellipse', width: 100, height: 50 },
            process: { shape: 'rectangle', width: 120, height: 60 },
            decision: { shape: 'diamond', width: 120, height: 80 },
            input: { shape: 'parallelogram', width: 120, height: 60 },
            output: { shape: 'parallelogram', width: 120, height: 60 },
            loop: { shape: 'rectangle', width: 120, height: 60 },
            error: { shape: 'rectangle', width: 120, height: 60 }
        };
        
        return geometries[type] || geometries.process;
    }
    
    getNodeColor(type) {
        const colors = {
            start: '#e74c3c',
            end: '#e74c3c',
            process: '#3498db',
            decision: '#f39c12',
            input: '#9b59b6',
            output: '#2ecc71',
            loop: '#e67e22',
            error: '#e74c3c'
        };
        
        return colors[type] || colors.process;
    }
    
    getNodeStrokeColor(type) {
        const colors = {
            start: '#c0392b',
            end: '#c0392b',
            process: '#2980b9',
            decision: '#e67e22',
            input: '#8e44ad',
            output: '#27ae60',
            loop: '#d35400',
            error: '#c0392b'
        };
        
        return colors[type] || colors.process;
    }
    
    calculateConnectionPoints(fromNode, toNode) {
        // Simple straight line connection
        // In a more sophisticated implementation, you'd calculate
        // the actual edge points of the shapes
        return {
            x1: fromNode.x,
            y1: fromNode.y + 30, // Bottom of from node
            x2: toNode.x,
            y2: toNode.y - 30  // Top of to node
        };
    }
    
    createEdgePath(x1, y1, x2, y2) {
        // Create a curved path
        const midY = (y1 + y2) / 2;
        return `M ${x1} ${y1} Q ${x1} ${midY} ${(x1 + x2) / 2} ${midY} Q ${x2} ${midY} ${x2} ${y2}`;
    }
    
    addLegend() {
        const legend = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legend.setAttribute('class', 'flowchart-legend');
        legend.setAttribute('transform', 'translate(20, 20)');
        
        const legendItems = [
            { type: 'start', label: 'Start/End' },
            { type: 'process', label: 'Process' },
            { type: 'decision', label: 'Decision' },
            { type: 'input', label: 'Input' },
            { type: 'output', label: 'Output' }
        ];
        
        legendItems.forEach((item, index) => {
            const y = index * 25;
            
            // Color box
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', 0);
            rect.setAttribute('y', y);
            rect.setAttribute('width', 15);
            rect.setAttribute('height', 15);
            rect.setAttribute('fill', this.getNodeColor(item.type));
            rect.setAttribute('stroke', this.getNodeStrokeColor(item.type));
            
            // Label
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', 20);
            text.setAttribute('y', y + 12);
            text.setAttribute('font-size', '12');
            text.setAttribute('fill', '#2c3e50');
            text.textContent = item.label;
            
            legend.appendChild(rect);
            legend.appendChild(text);
        });
        
        this.mainGroup.appendChild(legend);
    }
    
    // Event handlers
    startPan(e) {
        this.isDragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        this.svg.style.cursor = 'grabbing';
    }
    
    pan(e) {
        if (!this.isDragging) return;
        
        const deltaX = e.clientX - this.lastX;
        const deltaY = e.clientY - this.lastY;
        
        this.panX += deltaX;
        this.panY += deltaY;
        
        this.updateTransform();
        
        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }
    
    endPan() {
        this.isDragging = false;
        this.svg.style.cursor = 'grab';
    }
    
    zoom(e) {
        e.preventDefault();
        
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.scale *= delta;
        this.scale = Math.max(0.1, Math.min(3, this.scale));
        
        this.updateTransform();
    }
    
    updateTransform() {
        if (this.mainGroup) {
            this.mainGroup.setAttribute('transform', 
                `translate(${this.panX}, ${this.panY}) scale(${this.scale})`);
        }
    }
    
    resetView() {
        this.scale = 1;
        this.panX = 0;
        this.panY = 0;
        this.updateTransform();
    }
    
    onNodeClick(node) {
        console.log('Node clicked:', node);
        // You can add custom behavior here
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    
    // Public methods
    zoomIn() {
        this.scale *= 1.2;
        this.scale = Math.min(3, this.scale);
        this.updateTransform();
    }
    
    zoomOut() {
        this.scale *= 0.8;
        this.scale = Math.max(0.1, this.scale);
        this.updateTransform();
    }
    
    resetZoom() {
        this.resetView();
    }
    
    exportSVG() {
        if (!this.svg) return null;
        
        const serializer = new XMLSerializer();
        return serializer.serializeToString(this.svg);
    }
}

// Global flowchart renderer instance
let flowchartRenderer = null;

// Initialize flowchart when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const flowchartContainer = document.getElementById('flowchart-container');
    if (flowchartContainer) {
        flowchartRenderer = new FlowchartRenderer('flowchart-container');
    }
});

// Helper functions for external use
function renderFlowchart(data) {
    if (flowchartRenderer) {
        flowchartRenderer.renderFlowchart(data);
    }
}

function clearFlowchart() {
    if (flowchartRenderer) {
        flowchartRenderer.renderFlowchart({ nodes: [], edges: [] });
    }
}
