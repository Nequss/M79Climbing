// primitives-manager.js - Manages primitive shapes creation and placement

class PrimitivesManager {
    constructor() {
        // DOM elements
        this.canvas = document.getElementById('canvas-editor');
        this.ctx = this.canvas.getContext('2d');
        this.primitivesBtn = document.getElementById('primitives-btn');
        this.primitivesPanel = document.getElementById('primitives-panel');
        this.triangleColorInput = document.getElementById('triangle-color');

        // Primitive properties
        this.currentShape = null; // Changed from 'rectangle' to null (no default selection)
        this.shapeSize = 100;
        this.shapeColor = this.triangleColorInput ? this.triangleColorInput.value : '#64c8ff';
        this.shapeType = 'ptNORMAL';
        this.circleSegments = 12;
        this.circleStartAngle = 0;
        this.circleEndAngle = 360;
        this.rectangleSizeX = 1;
        this.rectangleSizeY = 1;
        this.starPoints = 5;
        this.crossWidth = 0.3;
        this.trapezoidTopWidth = 0.6;
        this.trapezoidHeight = 0.5;
        this.trapezoidSkew = 0;

        // New shape properties
        this.sinusoidAmplitude = 50;
        this.sinusoidWavelength = 100;
        this.sinusoidSegments = 3;

        // Modified squares properties
        this.squaresCount = 4;
        this.squaresSpacing = 10;
        this.squaresShowConnectors = false; // New property: whether to show connectors
        this.squaresSizeX = 1; // New property: X size multiplier
        this.squaresSizeY = 1; // New property: Y size multiplier

        this.tunnelLength = 150;
        this.tunnelHeight = 60;
        this.tunnelSegments = 3;
        this.tunnelSpacing = 40;
        this.tunnelBendType = 'none';
        this.tunnelBendPoint = 0.5;
        this.tunnelBendAmount = 0.3;
        this.tunnelSquareSize = 20;
        this.tunnelHasGaps = false;
        this.tunnelGapSize = 2;


        // State variables
        this.isActive = false;
        this.previewTriangles = [];
        this.previewPosition = { x: 0, y: 0 };
        this.lastMousePosition = { x: 0, y: 0 };

        // Initialize
        this.init();
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();

        // Initialize UI elements
        this.initializeUI();
    }

    setupEventListeners() {
        // Toggle primitives panel when clicking the primitives button
        this.primitivesBtn.addEventListener('click', () => this.togglePanel());

        // Shape selection
        document.querySelectorAll('.primitive-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectPrimitiveShape(e.currentTarget.dataset.shape);
            });
        });

        // Property controls
        document.getElementById('primitive-color').addEventListener('input', (e) => {
            this.shapeColor = e.target.value;
            this.updatePreview();
        });

        document.getElementById('primitive-type').addEventListener('change', (e) => {
            this.shapeType = POLY_TYPES[e.target.value];
            this.updatePreview();
        });

        // Existing shape controls
        document.getElementById('circle-segments').addEventListener('input', (e) => {
            this.circleSegments = parseInt(e.target.value);
            document.getElementById('circle-segments-value').textContent = this.circleSegments;
            if (this.currentShape === 'circle') {
                this.updatePreview();
            }
        });

        document.getElementById('circle-start-angle').addEventListener('input', (e) => {
            this.circleStartAngle = parseInt(e.target.value);
            document.getElementById('circle-start-angle-value').textContent = this.circleStartAngle;
            if (this.currentShape === 'circle') {
                this.updatePreview();
            }
        });

        document.getElementById('circle-end-angle').addEventListener('input', (e) => {
            this.circleEndAngle = parseInt(e.target.value);
            document.getElementById('circle-end-angle-value').textContent = this.circleEndAngle;
            if (this.currentShape === 'circle') {
                this.updatePreview();
            }
        });

        document.getElementById('star-points').addEventListener('input', (e) => {
            this.starPoints = parseInt(e.target.value);
            document.getElementById('star-points-value').textContent = this.starPoints;
            if (this.currentShape === 'star') {
                this.updatePreview();
            }
        });

        document.getElementById('cross-width').addEventListener('input', (e) => {
            this.crossWidth = parseFloat(e.target.value);
            document.getElementById('cross-width-value').textContent = this.crossWidth.toFixed(2);
            if (this.currentShape === 'cross') {
                this.updatePreview();
            }
        });

        document.getElementById('rectangle-size-x').addEventListener('input', (e) => {
            this.rectangleSizeX = parseFloat(e.target.value);
            document.getElementById('rectangle-size-x-value').textContent = this.rectangleSizeX.toFixed(1);
            if (this.currentShape === 'rectangle') {
                this.updatePreview();
            }
        });

        document.getElementById('rectangle-size-y').addEventListener('input', (e) => {
            this.rectangleSizeY = parseFloat(e.target.value);
            document.getElementById('rectangle-size-y-value').textContent = this.rectangleSizeY.toFixed(1);
            if (this.currentShape === 'rectangle') {
                this.updatePreview();
            }
        });

        document.getElementById('trapezoid-top-width').addEventListener('input', (e) => {
            this.trapezoidTopWidth = parseFloat(e.target.value);
            document.getElementById('trapezoid-top-width-value').textContent = this.trapezoidTopWidth.toFixed(2);
            if (this.currentShape === 'trapezoid') {
                this.updatePreview();
            }
        });

        document.getElementById('trapezoid-height').addEventListener('input', (e) => {
            this.trapezoidHeight = parseFloat(e.target.value);
            document.getElementById('trapezoid-height-value').textContent = this.trapezoidHeight.toFixed(2);
            if (this.currentShape === 'trapezoid') {
                this.updatePreview();
            }
        });

        document.getElementById('trapezoid-skew').addEventListener('input', (e) => {
            this.trapezoidSkew = parseFloat(e.target.value);
            document.getElementById('trapezoid-skew-value').textContent = this.trapezoidSkew.toFixed(2);
            if (this.currentShape === 'trapezoid') {
                this.updatePreview();
            }
        });

        // Sinusoid controls
        document.getElementById('sinusoid-amplitude').addEventListener('input', (e) => {
            this.sinusoidAmplitude = parseInt(e.target.value);
            document.getElementById('sinusoid-amplitude-value').textContent = this.sinusoidAmplitude;
            if (this.currentShape === 'sinusoid') {
                this.updatePreview();
            }
        });

        document.getElementById('sinusoid-wavelength').addEventListener('input', (e) => {
            this.sinusoidWavelength = parseInt(e.target.value);
            document.getElementById('sinusoid-wavelength-value').textContent = this.sinusoidWavelength;
            if (this.currentShape === 'sinusoid') {
                this.updatePreview();
            }
        });

        document.getElementById('sinusoid-segments').addEventListener('input', (e) => {
            this.sinusoidSegments = parseInt(e.target.value);
            document.getElementById('sinusoid-segments-value').textContent = this.sinusoidSegments;
            if (this.currentShape === 'sinusoid') {
                this.updatePreview();
            }
        });


        // New squares controls
        document.getElementById('squares-count').addEventListener('input', (e) => {
            this.squaresCount = parseInt(e.target.value);
            document.getElementById('squares-count-value').textContent = this.squaresCount;
            if (this.currentShape === 'squares') {
                this.updatePreview();
            }
        });

        document.getElementById('squares-spacing').addEventListener('input', (e) => {
            this.squaresSpacing = parseInt(e.target.value);
            document.getElementById('squares-spacing-value').textContent = this.squaresSpacing;
            if (this.currentShape === 'squares') {
                this.updatePreview();
            }
        });

        // New event listeners for squares X and Y size
        document.getElementById('squares-size-x').addEventListener('input', (e) => {
            this.squaresSizeX = parseFloat(e.target.value);
            document.getElementById('squares-size-x-value').textContent = this.squaresSizeX.toFixed(1);
            if (this.currentShape === 'squares') {
                this.updatePreview();
            }
        });

        document.getElementById('squares-size-y').addEventListener('input', (e) => {
            this.squaresSizeY = parseFloat(e.target.value);
            document.getElementById('squares-size-y-value').textContent = this.squaresSizeY.toFixed(1);
            if (this.currentShape === 'squares') {
                this.updatePreview();
            }
        });

        // New event listener for squares connectors checkbox
        document.getElementById('squares-show-connectors').addEventListener('change', (e) => {
            this.squaresShowConnectors = e.target.checked;
            if (this.currentShape === 'squares') {
                this.updatePreview();
            }
        });


        // Tunnel controls
        document.getElementById('tunnel-length').addEventListener('input', (e) => {
            this.tunnelLength = parseInt(e.target.value);
            document.getElementById('tunnel-length-value').textContent = this.tunnelLength;
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        document.getElementById('tunnel-height').addEventListener('input', (e) => {
            this.tunnelHeight = parseInt(e.target.value);
            document.getElementById('tunnel-height-value').textContent = this.tunnelHeight;
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        document.getElementById('tunnel-segments').addEventListener('input', (e) => {
            this.tunnelSegments = parseInt(e.target.value);
            document.getElementById('tunnel-segments-value').textContent = this.tunnelSegments;
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        // Tunnel wall spacing control
        document.getElementById('tunnel-spacing').addEventListener('input', (e) => {
            this.tunnelSpacing = parseInt(e.target.value);
            document.getElementById('tunnel-spacing-value').textContent = this.tunnelSpacing;
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        // Tunnel bend type control
        document.getElementById('tunnel-bend-type').addEventListener('change', (e) => {
            this.tunnelBendType = e.target.value;
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        // Tunnel bend position control
        document.getElementById('tunnel-bend-point').addEventListener('input', (e) => {
            this.tunnelBendPoint = parseFloat(e.target.value);
            document.getElementById('tunnel-bend-point-value').textContent = this.tunnelBendPoint.toFixed(1);
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        // Tunnel bend amount control
        document.getElementById('tunnel-bend-amount').addEventListener('input', (e) => {
            this.tunnelBendAmount = parseFloat(e.target.value);
            document.getElementById('tunnel-bend-amount-value').textContent = this.tunnelBendAmount.toFixed(1);
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        // Tunnel square size control
        document.getElementById('tunnel-square-size').addEventListener('input', (e) => {
            this.tunnelSquareSize = parseInt(e.target.value);
            document.getElementById('tunnel-square-size-value').textContent = this.tunnelSquareSize;
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        // Tunnel gaps checkbox
        document.getElementById('tunnel-has-gaps').addEventListener('change', (e) => {
            this.tunnelHasGaps = e.target.checked;
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        // Tunnel gap size control
        document.getElementById('tunnel-gap-size').addEventListener('input', (e) => {
            this.tunnelGapSize = parseInt(e.target.value);
            document.getElementById('tunnel-gap-size-value').textContent = this.tunnelGapSize;
            if (this.currentShape === 'tunnel') {
                this.updatePreview();
            }
        });

        // Canvas mouse events
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isActive) {
                const worldPos = screenToWorld(e.clientX, e.clientY);
                this.previewPosition = worldPos;
                this.lastMousePosition = { x: e.clientX, y: e.clientY };
                this.updatePreview();
                drawAll();
            }
        });

        this.canvas.addEventListener('click', (e) => {
            if (this.isActive && !window.isDragging) {
                this.placePrimitive();
                // After placing, deactivate the panel completely
                this.isActive = false;
                this.canvas.style.cursor = 'default';
                // Hide the panel completely
                this.primitivesPanel.style.display = 'none';
                // Remove 'active' class from button
                this.primitivesBtn.classList.remove('active');
                e.stopPropagation();
            }
        });

        // Right-click handler to hide primitives panel and clear preview
        this.canvas.addEventListener('contextmenu', (e) => {
            if (this.isActive) {
                // Hide the panel
                this.primitivesPanel.classList.add('panel-slide-out');
                setTimeout(() => {
                    this.primitivesPanel.style.display = 'none';
                    this.primitivesPanel.classList.remove('panel-slide-out');
                }, 300);

                // Clear preview triangles
                this.previewTriangles = [];

                this.isActive = false;
                this.canvas.style.cursor = 'default';
                this.primitivesBtn.classList.remove('active');
                e.preventDefault();

                // Redraw to clear preview
                drawAll();
            }
        });

        // Key events for quick escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.togglePanel();
                // Clear preview triangles
                this.previewTriangles = [];
                drawAll();
            }
        });

        // Watch for triangle color changes
        if (this.triangleColorInput) {
            this.triangleColorInput.addEventListener('input', (e) => {
                // Update shape color to match triangle color
                this.shapeColor = e.target.value;
                document.getElementById('primitive-color').value = e.target.value;
                this.updatePreview();
            });
        }

        // Click handler for document to clear previews when clicking outside
        document.addEventListener('click', (e) => {
            // Only proceed if we're in active mode and not clicking inside the panel or on a primitive button
            if (this.isActive &&
                !e.target.closest('#primitives-panel') &&
                !e.target.closest('#primitives-btn') &&
                !e.target.closest('#canvas-editor')) {

                // Clear preview
                this.previewTriangles = [];

                // Hide panel
                this.primitivesPanel.style.display = 'none';
                this.isActive = false;
                this.canvas.style.cursor = 'default';
                this.primitivesBtn.classList.remove('active');

                // Redraw to clear preview
                drawAll();
            }
        });

        // Extend drawAll to include our preview
        const originalDrawAll = window.drawAll;
        const self = this;

        window.drawAll = function () {
            // Call original drawAll
            originalDrawAll();

            // Draw shape preview if active
            if (self.isActive && self.previewTriangles.length > 0) {
                self.drawPreview();
            }
        };
    }

    initializeUI() {
        // Populate the triangle type dropdown
        const primitiveTypeSelect = document.getElementById('primitive-type');

        POLY_TYPES.forEach((type, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = type;
            primitiveTypeSelect.appendChild(option);
        });

        // Set initial color to match triangle color
        if (this.triangleColorInput) {
            document.getElementById('primitive-color').value = this.triangleColorInput.value;
            this.shapeColor = this.triangleColorInput.value;
        }
    }

    togglePanel() {
        // Hide other panels first
        document.getElementById('poly-panel').style.display = 'none';
        document.getElementById('settings-panel').style.display = 'none';
        document.getElementById('help-panel').style.display = 'none';

        // Toggle primitives panel
        if (this.primitivesPanel.style.display === 'none') {
            this.primitivesPanel.style.display = 'block';
            this.isActive = true;
            this.canvas.style.cursor = 'crosshair';

            // Clear any existing selection
            this.currentShape = null;
            this.previewTriangles = [];

            // Clear any currently selected primitive items
            document.querySelectorAll('.primitive-item').forEach(item => {
                item.classList.remove('selected');
            });

            // Hide all shape-specific controls
            document.querySelectorAll('.primitive-option').forEach(option => {
                option.style.display = 'none';
            });

            // Add 'active' class to button
            this.primitivesBtn.classList.add('active');

            // Add entrance animation class
            this.primitivesPanel.classList.add('panel-slide-in');
            setTimeout(() => {
                this.primitivesPanel.classList.remove('panel-slide-in');
            }, 300);
        } else {
            // Add exit animation class
            this.primitivesPanel.classList.add('panel-slide-out');
            setTimeout(() => {
                this.primitivesPanel.style.display = 'none';
                this.primitivesPanel.classList.remove('panel-slide-out');
            }, 300);

            // Clear preview triangles
            this.previewTriangles = [];

            this.isActive = false;
            this.canvas.style.cursor = 'default';

            // Remove 'active' class from button
            this.primitivesBtn.classList.remove('active');

            // Redraw to clear preview
            drawAll();
        }
    }

    selectPrimitiveShape(shape) {
        // Update currentShape
        this.currentShape = shape;

        // Update UI
        document.querySelectorAll('.primitive-item').forEach(item => {
            if (item.dataset.shape === shape) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });

        // Show/hide shape-specific controls
        document.querySelectorAll('.primitive-option').forEach(option => {
            option.style.display = 'none';
        });

        if (shape === 'circle') {
            document.getElementById('primitive-circle-segments').style.display = 'block';
            document.getElementById('primitive-circle-angles').style.display = 'block';
        } else if (shape === 'rectangle') {
            document.getElementById('primitive-rectangle-size-x').style.display = 'block';
            document.getElementById('primitive-rectangle-size-y').style.display = 'block';
        } else if (shape === 'star') {
            document.getElementById('primitive-star-points').style.display = 'block';
        } else if (shape === 'cross') {
            document.getElementById('primitive-cross-width').style.display = 'block';
        } else if (shape === 'trapezoid') {
            document.getElementById('primitive-trapezoid-top-width').style.display = 'block';
            document.getElementById('primitive-trapezoid-height').style.display = 'block';
            document.getElementById('primitive-trapezoid-skew').style.display = 'block';
        } else if (shape === 'sinusoid') {
            document.getElementById('primitive-sinusoid-amplitude').style.display = 'block';
            document.getElementById('primitive-sinusoid-wavelength').style.display = 'block';
            document.getElementById('primitive-sinusoid-segments').style.display = 'block';
        } else if (shape === 'squares') {
            document.getElementById('primitive-squares-count').style.display = 'block';
            document.getElementById('primitive-squares-spacing').style.display = 'block';
            document.getElementById('primitive-squares-size-x').style.display = 'block';
            document.getElementById('primitive-squares-size-y').style.display = 'block';
            document.getElementById('primitive-squares-show-connectors').style.display = 'block';
        } else if (shape === 'tunnel') {
            document.getElementById('primitive-tunnel-length').style.display = 'block';
            document.getElementById('primitive-tunnel-segments').style.display = 'block';
            document.getElementById('primitive-tunnel-spacing').style.display = 'block';
            document.getElementById('primitive-tunnel-bend-type').style.display = 'block';
            document.getElementById('primitive-tunnel-bend-point').style.display = 'block';
            document.getElementById('primitive-tunnel-bend-amount').style.display = 'block';
            document.getElementById('primitive-tunnel-square-size').style.display = 'block';
            document.getElementById('primitive-tunnel-has-gaps').style.display = 'block';
            document.getElementById('primitive-tunnel-gap-size').style.display = 'block';
        }

        // Update preview
        this.updatePreview();
    }

    updatePreview() {
        // If no shape is selected, don't generate a preview
        if (!this.currentShape) {
            this.previewTriangles = [];
            return;
        }

        // Sync color with triangle color input if available
        if (this.triangleColorInput) {
            this.shapeColor = this.triangleColorInput.value;
        }

        // Generate triangle vertices based on current shape and position
        switch (this.currentShape) {
            case 'rectangle':
                this.generateRectangle();
                break;
            case 'circle':
                this.generateCircle();
                break;
            case 'star':
                this.generateStar();
                break;
            case 'cross':
                this.generateCross();
                break;
            case 'arrow':
                this.generateArrow();
                break;
            case 'trapezoid':
                this.generateTrapezoid();
                break;
            case 'sinusoid':
                this.generateSinusoid();
                break;
            case 'squares':
                this.generateSquares();
                break;
            case 'tunnel':
                this.generateTunnel();
                break;
        }
    }

    generateRectangle() {
        // Calculate dimensions using size and X/Y multipliers
        const halfWidth = (this.shapeSize / 2) * this.rectangleSizeX;
        const halfHeight = (this.shapeSize / 2) * this.rectangleSizeY;

        // Clear existing preview
        this.previewTriangles = [];

        // Define the four corners of the rectangle
        const topLeft = { x: this.previewPosition.x - halfWidth, y: this.previewPosition.y - halfHeight };
        const topRight = { x: this.previewPosition.x + halfWidth, y: this.previewPosition.y - halfHeight };
        const bottomLeft = { x: this.previewPosition.x - halfWidth, y: this.previewPosition.y + halfHeight };
        const bottomRight = { x: this.previewPosition.x + halfWidth, y: this.previewPosition.y + halfHeight };

        // Triangle 1 (top-left, top-right, bottom-left)
        const triangle1 = {
            points: [
                { ...topLeft },
                { ...topRight },
                { ...bottomLeft }
            ],
            color: this.shapeColor,
            type: this.shapeType
        };

        // Triangle 2 (bottom-left, top-right, bottom-right)
        const triangle2 = {
            points: [
                { ...bottomLeft },
                { ...topRight },
                { ...bottomRight }
            ],
            color: this.shapeColor,
            type: this.shapeType
        };

        this.previewTriangles = [triangle1, triangle2];
    }

    generateCircle() {
        // Clear existing preview
        this.previewTriangles = [];

        const radius = this.shapeSize / 2;
        const center = { ...this.previewPosition };

        // Convert degrees to radians
        const startAngleRad = (this.circleStartAngle * Math.PI) / 180;
        const endAngleRad = (this.circleEndAngle * Math.PI) / 180;

        // Calculate angle span and segments
        let angleSpan = endAngleRad - startAngleRad;
        if (angleSpan < 0) angleSpan += Math.PI * 2; // Handle wrap around

        // Adjust segments based on the arc angle
        const arcSegments = Math.max(1, Math.floor(this.circleSegments * (angleSpan / (Math.PI * 2))));

        // Create individual triangles with no shared vertices
        for (let i = 0; i < arcSegments; i++) {
            const angle1 = startAngleRad + (i / arcSegments) * angleSpan;
            const angle2 = startAngleRad + ((i + 1) / arcSegments) * angleSpan;

            // Create separate points for each triangle
            const centerPoint = { ...center };
            const p1 = {
                x: center.x + radius * Math.cos(angle1),
                y: center.y + radius * Math.sin(angle1)
            };
            const p2 = {
                x: center.x + radius * Math.cos(angle2),
                y: center.y + radius * Math.sin(angle2)
            };

            const triangle = {
                points: [centerPoint, p1, p2],
                color: this.shapeColor,
                type: this.shapeType
            };

            this.previewTriangles.push(triangle);
        }
    }

    generateStar() {
        // Clear existing preview
        this.previewTriangles = [];

        const outerRadius = this.shapeSize / 2;
        const innerRadius = outerRadius * 0.38; // Adjusted for better visual proportion
        const center = { ...this.previewPosition };

        // Generate star points with consistent angle distribution (starting from top)
        const points = [];
        for (let i = 0; i < this.starPoints * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI / this.starPoints) - (Math.PI / 2); // Start from top

            points.push({
                x: center.x + radius * Math.cos(angle),
                y: center.y + radius * Math.sin(angle)
            });
        }

        // First create the star points (the outer triangles)
        for (let i = 0; i < this.starPoints * 2; i += 2) {
            const outerPoint = { ...points[i] };
            const prevInnerPoint = { ...points[(i - 1 + this.starPoints * 2) % (this.starPoints * 2)] };
            const nextInnerPoint = { ...points[(i + 1) % (this.starPoints * 2)] };

            const triangle = {
                points: [outerPoint, prevInnerPoint, nextInnerPoint],
                color: this.shapeColor,
                type: this.shapeType
            };

            this.previewTriangles.push(triangle);
        }

        // Then create the inner polygon (the central part of the star)
        if (this.starPoints >= 3) {
            // For stars with ≥ 3 points, we divide the inner area into separate triangles
            // that don't all share a common center vertex
            for (let i = 0; i < this.starPoints - 2; i++) {
                const p1Index = 1; // First inner point
                const p2Index = 1 + (i + 1) * 2; // Skip to next inner point
                const p3Index = 1 + (i + 2) * 2; // Skip to next inner point

                // Make sure indices wrap around properly
                const fixedP2Index = p2Index % (this.starPoints * 2);
                const fixedP3Index = p3Index % (this.starPoints * 2);

                const triangle = {
                    points: [
                        { ...points[p1Index] },
                        { ...points[fixedP2Index] },
                        { ...points[fixedP3Index] }
                    ],
                    color: this.shapeColor,
                    type: this.shapeType
                };

                this.previewTriangles.push(triangle);
            }
        }
    }

    generateCross() {
        // Clear existing preview
        this.previewTriangles = [];

        const size = this.shapeSize;
        const halfSize = size / 2;
        const armWidth = size * this.crossWidth; // Width of the cross arms
        const halfWidth = armWidth / 2;
        const center = { ...this.previewPosition };

        // Define the 12 vertices of the cross
        const vertices = [
            // Top arm - clockwise from top-left
            { x: center.x - halfWidth, y: center.y - halfSize },
            { x: center.x + halfWidth, y: center.y - halfSize },
            { x: center.x + halfWidth, y: center.y - halfWidth },
            // Right arm - clockwise from top-left
            { x: center.x + halfSize, y: center.y - halfWidth },
            { x: center.x + halfSize, y: center.y + halfWidth },
            { x: center.x + halfWidth, y: center.y + halfWidth },
            // Bottom arm - clockwise from top-left
            { x: center.x + halfWidth, y: center.y + halfSize },
            { x: center.x - halfWidth, y: center.y + halfSize },
            { x: center.x - halfWidth, y: center.y + halfWidth },
            // Left arm - clockwise from top-left
            { x: center.x - halfSize, y: center.y + halfWidth },
            { x: center.x - halfSize, y: center.y - halfWidth },
            { x: center.x - halfWidth, y: center.y - halfWidth }
        ];

        // Create separate triangles with no shared vertices
        // Top arm
        this.previewTriangles.push({
            points: [
                { ...vertices[0] },
                { ...vertices[1] },
                { ...vertices[2] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        this.previewTriangles.push({
            points: [
                { ...vertices[0] },
                { ...vertices[2] },
                { ...vertices[11] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        // Right arm
        this.previewTriangles.push({
            points: [
                { ...vertices[2] },
                { ...vertices[3] },
                { ...vertices[4] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        this.previewTriangles.push({
            points: [
                { ...vertices[2] },
                { ...vertices[4] },
                { ...vertices[5] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        // Bottom arm
        this.previewTriangles.push({
            points: [
                { ...vertices[5] },
                { ...vertices[6] },
                { ...vertices[7] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        this.previewTriangles.push({
            points: [
                { ...vertices[5] },
                { ...vertices[7] },
                { ...vertices[8] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        // Left arm
        this.previewTriangles.push({
            points: [
                { ...vertices[8] },
                { ...vertices[9] },
                { ...vertices[10] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        this.previewTriangles.push({
            points: [
                { ...vertices[8] },
                { ...vertices[10] },
                { ...vertices[11] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        // Center square
        this.previewTriangles.push({
            points: [
                { ...vertices[2] },
                { ...vertices[5] },
                { ...vertices[8] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        this.previewTriangles.push({
            points: [
                { ...vertices[2] },
                { ...vertices[8] },
                { ...vertices[11] }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });
    }

    generateArrow() {
        // Clear existing preview
        this.previewTriangles = [];

        const size = this.shapeSize;
        const halfSize = size / 2;
        const arrowHeadSize = size * 0.4; // 40% of size for arrow head
        const arrowWidth = size * 0.3; // 30% of size for arrow shaft width
        const center = { ...this.previewPosition };

        // Calculate arrow points
        const tip = { x: center.x + halfSize, y: center.y };
        const leftCorner = { x: center.x + halfSize - arrowHeadSize, y: center.y - arrowHeadSize };
        const rightCorner = { x: center.x + halfSize - arrowHeadSize, y: center.y + arrowHeadSize };
        const topShaft = { x: center.x + halfSize - arrowHeadSize, y: center.y - arrowWidth / 2 };
        const bottomShaft = { x: center.x + halfSize - arrowHeadSize, y: center.y + arrowWidth / 2 };
        const tailTop = { x: center.x - halfSize, y: center.y - arrowWidth / 2 };
        const tailBottom = { x: center.x - halfSize, y: center.y + arrowWidth / 2 };

        // Arrow head - create a new triangle with separate vertices
        this.previewTriangles.push({
            points: [
                { ...tip },
                { ...leftCorner },
                { ...rightCorner }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        // Arrow shaft (2 triangles) - create with separate vertices
        this.previewTriangles.push({
            points: [
                { ...topShaft },
                { ...tailTop },
                { ...bottomShaft }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        this.previewTriangles.push({
            points: [
                { ...bottomShaft },
                { ...tailTop },
                { ...tailBottom }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });
    }

    generateTrapezoid() {
        // Clear existing preview
        this.previewTriangles = [];

        const size = this.shapeSize;
        const center = { ...this.previewPosition };
        const topWidth = size * this.trapezoidTopWidth; // Top width as proportion of size
        const height = size * this.trapezoidHeight; // Height as proportion of size
        const skew = size * this.trapezoidSkew; // Horizontal skew

        // Calculate trapezoid points
        const topLeft = {
            x: center.x - topWidth / 2 + skew,
            y: center.y - height / 2
        };
        const topRight = {
            x: center.x + topWidth / 2 + skew,
            y: center.y - height / 2
        };
        const bottomLeft = {
            x: center.x - size / 2,
            y: center.y + height / 2
        };
        const bottomRight = {
            x: center.x + size / 2,
            y: center.y + height / 2
        };

        // Create triangles with separate vertices
        this.previewTriangles.push({
            points: [
                { ...topLeft },
                { ...topRight },
                { ...bottomLeft }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });

        this.previewTriangles.push({
            points: [
                { ...bottomLeft },
                { ...topRight },
                { ...bottomRight }
            ],
            color: this.shapeColor,
            type: this.shapeType
        });
    }

    // New shape generation functions

    generateSinusoid() {
        // Clear existing preview
        this.previewTriangles = [];

        const amplitude = this.sinusoidAmplitude;
        const wavelength = this.sinusoidWavelength;
        const segments = this.sinusoidSegments;
        const center = { ...this.previewPosition };

        // Calculate the total wave width
        const totalWidth = wavelength * segments;
        const startX = center.x - totalWidth / 2;

        // Generate points along the sine wave
        const numPoints = segments * 10 + 1; // More points for smoother curve
        const points = [];

        for (let i = 0; i < numPoints; i++) {
            const x = startX + (i / (numPoints - 1)) * totalWidth;
            const phase = ((i / (numPoints - 1)) * segments * 2 * Math.PI);
            const y = center.y + amplitude * Math.sin(phase);

            points.push({ x, y });
        }

        // Create triangles from the sine wave points
        // We'll create a strip with some thickness
        const thickness = Math.min(amplitude * 0.3, 15); // Reasonable thickness based on amplitude

        for (let i = 0; i < points.length - 1; i++) {
            // Calculate normal vector to the curve at this point
            let dx = points[i + 1].x - points[i].x;
            let dy = points[i + 1].y - points[i].y;
            const len = Math.sqrt(dx * dx + dy * dy);
            dx = dx / len;
            dy = dy / len;

            // Calculate perpendicular vector (normal)
            const nx = -dy;
            const ny = dx;

            // Calculate the four corners of this segment
            const topLeft = {
                x: points[i].x + nx * thickness,
                y: points[i].y + ny * thickness
            };

            const bottomLeft = {
                x: points[i].x - nx * thickness,
                y: points[i].y - ny * thickness
            };

            const topRight = {
                x: points[i + 1].x + nx * thickness,
                y: points[i + 1].y + ny * thickness
            };

            const bottomRight = {
                x: points[i + 1].x - nx * thickness,
                y: points[i + 1].y - ny * thickness
            };

            // Create two triangles for this segment
            const triangle1 = {
                points: [
                    { ...topLeft },
                    { ...topRight },
                    { ...bottomLeft }
                ],
                color: this.shapeColor,
                type: this.shapeType
            };

            const triangle2 = {
                points: [
                    { ...bottomLeft },
                    { ...topRight },
                    { ...bottomRight }
                ],
                color: this.shapeColor,
                type: this.shapeType
            };

            this.previewTriangles.push(triangle1);
            this.previewTriangles.push(triangle2);
        }
    }

    generateSquares() {
        // Clear existing preview
        this.previewTriangles = [];

        const count = this.squaresCount;
        const spacing = this.squaresSpacing;
        const sizeX = this.shapeSize * this.squaresSizeX;
        const sizeY = this.shapeSize * this.squaresSizeY;
        const showConnectors = this.squaresShowConnectors;
        const center = { ...this.previewPosition };

        // Calculate grid dimensions
        const totalWidth = count * sizeX + (count - 1) * spacing;
        const totalHeight = count * sizeY + (count - 1) * spacing;

        // Starting position (top-left of grid)
        const startX = center.x - totalWidth / 2;
        const startY = center.y - totalHeight / 2;

        // Create the grid of squares
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                const squareCenter = {
                    x: startX + (sizeX / 2) + col * (sizeX + spacing),
                    y: startY + (sizeY / 2) + row * (sizeY + spacing)
                };

                const halfSizeX = sizeX / 2;
                const halfSizeY = sizeY / 2;

                // Define square corners
                const topLeft = {
                    x: squareCenter.x - halfSizeX,
                    y: squareCenter.y - halfSizeY
                };
                const topRight = {
                    x: squareCenter.x + halfSizeX,
                    y: squareCenter.y - halfSizeY
                };
                const bottomLeft = {
                    x: squareCenter.x - halfSizeX,
                    y: squareCenter.y + halfSizeY
                };
                const bottomRight = {
                    x: squareCenter.x + halfSizeX,
                    y: squareCenter.y + halfSizeY
                };

                // Create the two triangles that make up this square
                this.previewTriangles.push({
                    points: [{ ...topLeft }, { ...topRight }, { ...bottomLeft }],
                    color: this.shapeColor,
                    type: this.shapeType
                });

                this.previewTriangles.push({
                    points: [{ ...bottomLeft }, { ...topRight }, { ...bottomRight }],
                    color: this.shapeColor,
                    type: this.shapeType
                });

                // Add horizontal connectors if not the last column and connectors are enabled
                if (showConnectors && col < count - 1 && spacing > 0) {
                    const connectorLeft = {
                        x: squareCenter.x + halfSizeX,
                        y: squareCenter.y - halfSizeY / 2
                    };
                    const connectorRight = {
                        x: squareCenter.x + halfSizeX + spacing,
                        y: squareCenter.y - halfSizeY / 2
                    };
                    const connectorBottomLeft = {
                        x: squareCenter.x + halfSizeX,
                        y: squareCenter.y + halfSizeY / 2
                    };
                    const connectorBottomRight = {
                        x: squareCenter.x + halfSizeX + spacing,
                        y: squareCenter.y + halfSizeY / 2
                    };

                    this.previewTriangles.push({
                        points: [{ ...connectorLeft }, { ...connectorRight }, { ...connectorBottomLeft }],
                        color: this.shapeColor,
                        type: this.shapeType
                    });

                    this.previewTriangles.push({
                        points: [{ ...connectorBottomLeft }, { ...connectorRight }, { ...connectorBottomRight }],
                        color: this.shapeColor,
                        type: this.shapeType
                    });
                }

                // Add vertical connectors if not the last row and connectors are enabled
                if (showConnectors && row < count - 1 && spacing > 0) {
                    const connectorTop = {
                        x: squareCenter.x - halfSizeX / 2,
                        y: squareCenter.y + halfSizeY
                    };
                    const connectorBottom = {
                        x: squareCenter.x - halfSizeX / 2,
                        y: squareCenter.y + halfSizeY + spacing
                    };
                    const connectorTopRight = {
                        x: squareCenter.x + halfSizeX / 2,
                        y: squareCenter.y + halfSizeY
                    };
                    const connectorBottomRight = {
                        x: squareCenter.x + halfSizeX / 2,
                        y: squareCenter.y + halfSizeY + spacing
                    };

                    this.previewTriangles.push({
                        points: [{ ...connectorTop }, { ...connectorTopRight }, { ...connectorBottom }],
                        color: this.shapeColor,
                        type: this.shapeType
                    });

                    this.previewTriangles.push({
                        points: [{ ...connectorBottom }, { ...connectorTopRight }, { ...connectorBottomRight }],
                        color: this.shapeColor,
                        type: this.shapeType
                    });
                }
            }
        }
    }

    generateTunnel() {
        // Clear existing preview
        this.previewTriangles = [];

        const length = this.tunnelLength;
        const height = this.tunnelHeight;
        const spacing = this.tunnelSpacing;
        const segments = this.tunnelSegments;
        const center = { ...this.previewPosition };

        // Bend parameters
        const bendType = this.tunnelBendType || 'none'; // 'none', 'soft', 'custom'
        const bendPosition = this.tunnelBendPoint || 0.5; // Position along tunnel (0-1)
        const bendAmount = this.tunnelBendAmount || 0.3; // How much the tunnel bends

        // Wall parameters
        const squareSize = this.tunnelSquareSize;
        const hasGaps = this.tunnelHasGaps;
        const gapSize = this.tunnelGapSize;

        // Calculate wall thickness
        const wallThickness = squareSize;

        // Calculate dimensions
        const halfSpacing = spacing / 2;

        // Create an array of points along the tunnel path
        const pathPoints = [];

        // Determine number of points based on square size for appropriate detail
        const pointsPerSegment = Math.max(1, Math.floor(length / segments / squareSize));
        const totalPoints = segments * pointsPerSegment + 1;

        // Fixed horizontal orientation (since angle property was removed)
        const dirX = 1;  // cos(0) = 1
        const dirY = 0;  // sin(0) = 0
        const perpX = 0; // Perpendicular vector (up/down)
        const perpY = 1; // Vertical orientation

        // Generate all points along the tunnel path with bending applied
        for (let i = 0; i < totalPoints; i++) {
            const t = i / (totalPoints - 1); // Position along tunnel (0-1)

            // Calculate bend effects
            let bendOffset = 0;
            let bendAngle = 0;
            const distFromBend = Math.abs(t - bendPosition);

            if (bendType === 'soft') {
                // Smooth, curved bend
                const bendFactor = Math.max(0, 1 - (distFromBend / 0.3));

                if (t < bendPosition) {
                    // Before bend point: gradual increase
                    const normalizedPos = t / bendPosition;
                    const curve = Math.sin(normalizedPos * Math.PI / 2);
                    bendOffset = bendAmount * curve * bendFactor * height;
                    bendAngle = bendAmount * curve * bendFactor * 0.5;
                } else {
                    // After bend point: gradual decrease
                    const normalizedPos = (t - bendPosition) / (1 - bendPosition);
                    const curve = Math.cos(normalizedPos * Math.PI / 2);
                    bendOffset = bendAmount * curve * bendFactor * height;
                    bendAngle = bendAmount * curve * bendFactor * 0.5;
                }
            } else if (bendType === 'custom') {
                // Custom bend with falloff
                const falloff = 0.2;

                if (distFromBend < falloff) {
                    const customFactor = (1 - distFromBend / falloff);

                    if (t < bendPosition) {
                        bendOffset = bendAmount * customFactor * height;
                        bendAngle = bendAmount * customFactor * 0.5;
                    } else {
                        bendOffset = bendAmount * customFactor * height;
                        bendAngle = -bendAmount * customFactor * 0.5;
                    }
                }
            }

            // Apply bend offset in the vertical direction
            const offsetY = bendOffset; // Vertical offset for the bend

            // Calculate position along tunnel with bend offset
            const posX = center.x - (length / 2) + (t * length);
            const posY = center.y + offsetY;

            // Calculate direction at this point with bend angle
            const pointAngle = bendAngle; // Just use bend angle directly
            const pointDirX = Math.cos(pointAngle);
            const pointDirY = Math.sin(pointAngle);

            // Calculate perpendicular vector for wall direction
            const pointPerpX = -pointDirY;
            const pointPerpY = pointDirX;

            // Store point data
            pathPoints.push({
                x: posX,
                y: posY,
                dirX: pointDirX,
                dirY: pointDirY,
                perpX: pointPerpX,
                perpY: pointPerpY,
                angle: pointAngle
            });
        }

        // Create actual triangles for walls
        for (let i = 0; i < pathPoints.length - 1; i++) {
            // Skip segments for gaps if needed
            if (hasGaps && i % 2 === 1) continue;

            // Get current and next path points
            const p1 = pathPoints[i];
            const p2 = pathPoints[i + 1];

            // TOP WALL - Create triangles for the top wall
            // Calculate the four corners of a wall segment
            const topOuterP1 = {
                x: p1.x + p1.perpX * halfSpacing,
                y: p1.y + p1.perpY * halfSpacing
            };

            const topOuterP2 = {
                x: p2.x + p2.perpX * halfSpacing,
                y: p2.y + p2.perpY * halfSpacing
            };

            const topInnerP1 = {
                x: p1.x + p1.perpX * halfSpacing - p1.perpX * wallThickness,
                y: p1.y + p1.perpY * halfSpacing - p1.perpY * wallThickness
            };

            const topInnerP2 = {
                x: p2.x + p2.perpX * halfSpacing - p2.perpX * wallThickness,
                y: p2.y + p2.perpY * halfSpacing - p2.perpY * wallThickness
            };

            // Create two triangles to form the top wall segment
            this.previewTriangles.push({
                points: [
                    { ...topOuterP1 },
                    { ...topOuterP2 },
                    { ...topInnerP1 }
                ],
                color: this.shapeColor,
                type: this.shapeType
            });

            this.previewTriangles.push({
                points: [
                    { ...topInnerP1 },
                    { ...topOuterP2 },
                    { ...topInnerP2 }
                ],
                color: this.shapeColor,
                type: this.shapeType
            });

            // BOTTOM WALL - Create triangles for the bottom wall
            const bottomOuterP1 = {
                x: p1.x - p1.perpX * halfSpacing,
                y: p1.y - p1.perpY * halfSpacing
            };

            const bottomOuterP2 = {
                x: p2.x - p2.perpX * halfSpacing,
                y: p2.y - p2.perpY * halfSpacing
            };

            const bottomInnerP1 = {
                x: p1.x - p1.perpX * halfSpacing + p1.perpX * wallThickness,
                y: p1.y - p1.perpY * halfSpacing + p1.perpY * wallThickness
            };

            const bottomInnerP2 = {
                x: p2.x - p2.perpX * halfSpacing + p2.perpX * wallThickness,
                y: p2.y - p2.perpY * halfSpacing + p2.perpY * wallThickness
            };

            // Create two triangles to form the bottom wall segment
            this.previewTriangles.push({
                points: [
                    { ...bottomOuterP1 },
                    { ...bottomOuterP2 },
                    { ...bottomInnerP1 }
                ],
                color: this.shapeColor,
                type: this.shapeType
            });

            this.previewTriangles.push({
                points: [
                    { ...bottomInnerP1 },
                    { ...bottomOuterP2 },
                    { ...bottomInnerP2 }
                ],
                color: this.shapeColor,
                type: this.shapeType
            });
        }
    }


    drawPreview() {
        // Draw each triangle in the preview
        this.previewTriangles.forEach(triangle => {
            const screenPoints = triangle.points.map(p => worldToScreen(p.x, p.y));

            // Draw filled triangle with semi-transparency
            this.ctx.beginPath();
            this.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
            this.ctx.lineTo(screenPoints[1].x, screenPoints[1].y);
            this.ctx.lineTo(screenPoints[2].x, screenPoints[2].y);
            this.ctx.closePath();

            // Parse color and add transparency
            const colorMatch = triangle.color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            if (colorMatch) {
                const r = parseInt(colorMatch[1], 16);
                const g = parseInt(colorMatch[2], 16);
                const b = parseInt(colorMatch[3], 16);
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
            } else {
                this.ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
            }

            this.ctx.fill();

            // Draw stroking
            this.ctx.strokeStyle = triangle.color;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }

    placePrimitive() {
        if (this.previewTriangles.length === 0) return;

        // Calculate the centroid of all triangles to use as pivot point
        const allPoints = [];
        this.previewTriangles.forEach(triangle => {
            triangle.points.forEach(point => {
                allPoints.push(point);
            });
        });

        // Calculate centroid from all points
        const centroid = { x: 0, y: 0 };
        allPoints.forEach(point => {
            centroid.x += point.x;
            centroid.y += point.y;
        });
        centroid.x /= allPoints.length;
        centroid.y /= allPoints.length;

        // Add all preview triangles to the main triangle array
        const newTriangleIndices = [];
        this.previewTriangles.forEach(triangle => {
            triangles.push({ ...triangle });
            newTriangleIndices.push(triangles.length - 1);
        });

        // Select all placed triangles
        if (this.previewTriangles.length > 0) {
            // If multi-selection manager exists, make sure it captures all placed triangles
            if (window.multiSelectionManager) {
                window.multiSelectionManager.selectedTriangles = newTriangleIndices;
                // Set the pivot point to the calculated centroid
                window.multiSelectionManager.pivotPoint = centroid;
                // Update pivot point
                window.multiSelectionManager.updatePivotPoint();
            } else {
                // If there's no multi-selection, at least select the last triangle
                window.selectTriangle(triangles.length - 1);
            }
        }

        // Redraw with the new triangles
        drawAll();

        // Close the panel completely to fix the inactive but visible issue
        this.primitivesPanel.style.display = 'none';
        this.isActive = false;
        this.canvas.style.cursor = 'default';
        this.primitivesBtn.classList.remove('active');
    }
}

// Initialize the primitives manager when the page loads
document.addEventListener('DOMContentLoaded', function () {
    window.primitivesManager = new PrimitivesManager();
});
