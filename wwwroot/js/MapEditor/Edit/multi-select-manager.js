// multi-selection.js - Handles multi-selection and group manipulation of triangles

class MultiSelectionManager {
    constructor() {
        // Variables for multi-selection
        this.selectedTriangles = []; // Array of indices of selected triangles
        this.pivotPoint = { x: 0, y: 0 }; // Pivot point for rotation
        this.isShiftKeyPressed = false; // Flag to track Shift key for additive selection
        this.dragStartPos = null; // Starting position for drag operations
        this.wasTriangleDragged = false; // Track if triangles were dragged vs just clicked

        // Get canvas and context
        this.canvas = document.getElementById('canvas-editor');
        this.ctx = this.canvas.getContext('2d');

        // Initialize
        this.init();
    }

    init() {
        // Extend the drawAll function to include our custom drawing
        this.extendDrawAll();

        // Override triangle selection and movement functions
        this.overrideTriangleFunctions();

        // Setup event listeners for shift key
        this.setupEventListeners();
    }

    // Extend the drawAll function to include custom drawing
    extendDrawAll() {
        const originalDrawAll = window.drawAll;
        const self = this;

        window.drawAll = function () {
            // Call the original drawAll function
            originalDrawAll();

            // Draw highlighted triangles
            self.highlightSelectedTriangles();

            // Draw the pivot point with modern styling
            self.drawPivotPoint();
        };
    }

    // Override triangle selection and movement functions
    overrideTriangleFunctions() {
        // Override selectTriangle
        const originalSelectTriangle = window.selectTriangle;
        const originalUpdatePolyPanel = window.updatePolyPanel;
        const self = this;

        window.updatePolyPanel = function () {
            // First check if we have multiple triangles selected
            if (self.selectedTriangles.length > 1) {
                // Multiple triangles selected, force hide the panel
                document.getElementById('poly-panel').style.display = 'none';
                return;
            }

            // If we have 0 or 1 triangle selected, call the original function
            originalUpdatePolyPanel();
        };

        window.selectTriangle = function (index) {
            // Only clear selection when not shift-clicking and not dragging
            if (!self.isShiftKeyPressed && !self.wasTriangleDragged) {
                // Clear all selected triangles if Shift is not pressed
                self.selectedTriangles = [];
            }

            // Add this triangle to our selection if not already included
            if (self.selectedTriangles.indexOf(index) === -1) {
                self.selectedTriangles.push(index);
            }

            // Call the original function
            originalSelectTriangle(index);

            // Update the pivot point
            self.updatePivotPoint();

            // Update poly panel visibility
            self.updatePolyPanelVisibility();
        };

        // Override deselectTriangle
        const originalDeselectTriangle = window.deselectTriangle;

        window.deselectTriangle = function () {
            // Clear our selection
            self.selectedTriangles = [];

            // Call the original function
            originalDeselectTriangle();
        };

        // Override mousedown for triangle dragging - improved behavior
        this.canvas.addEventListener('mousedown', function (e) {
            // Only handle left mouse button
            if (e.button !== 0) return;

            // Store shift state
            self.isShiftKeyPressed = e.shiftKey;
            self.wasTriangleDragged = false; // Reset drag flag on mouse down

            // If a vertex is already selected, let the original handler handle it
            if (selectedVertex) return;

            // Check if clicked on a triangle
            const triangleResult = findTriangleUnderCursor(e.clientX, e.clientY);

            if (triangleResult.found) {
                const clickedIndex = triangleResult.triangleIndex;
                const inMultiSelection = self.selectedTriangles.indexOf(clickedIndex) !== -1;

                // If we clicked on a selected triangle and we have multiple triangles selected
                if (inMultiSelection && self.selectedTriangles.length > 1) {
                    // Start multi-dragging, but don't move triangles yet
                    window.isMovingTriangle = true;
                    window.isDragging = true;
                    window.lastMousePos = { x: e.clientX, y: e.clientY };
                    self.dragStartPos = { x: e.clientX, y: e.clientY };
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        }, true);

        // Override mousemove for multiple triangle movement - improved behavior
        this.canvas.addEventListener('mousemove', function (e) {
            // Only handle if we're in multi-drag mode
            if (window.isDragging && window.isMovingTriangle && self.selectedTriangles.length > 1) {
                self.wasTriangleDragged = true; // Set drag flag when actually moving

                const dx = (e.clientX - window.lastMousePos.x) / zoomLevel;
                const dy = (e.clientY - window.lastMousePos.y) / zoomLevel;

                // Only move if the mouse actually moved
                if (dx !== 0 || dy !== 0) {
                    // Move all selected triangles by the delta amount
                    self.moveSelectedTriangles(dx, dy);
                    window.lastMousePos = { x: e.clientX, y: e.clientY };
                    drawAll();
                }

                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // Override mouseup to end dragging
        this.canvas.addEventListener('mouseup', function (e) {
            if (window.isMovingTriangle) {
                window.isMovingTriangle = false;
                window.isDragging = false;
                self.dragStartPos = null;
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);

        // Override original click handler to handle multi-selection properly
        const originalCanvasClick = this.canvas.onclick;

        this.canvas.addEventListener('click', function (e) {
            // Skip this if triangles were just dragged
            if (self.wasTriangleDragged) {
                e.stopPropagation();
                return;
            }

            // Check if we clicked on a triangle
            const triangleResult = findTriangleUnderCursor(e.clientX, e.clientY);

            if (triangleResult.found) {
                // Single click on a triangle - should deselect other triangles if shift is not pressed
                if (!self.isShiftKeyPressed) {
                    self.selectedTriangles = [triangleResult.triangleIndex];
                    selectTriangle(triangleResult.triangleIndex);
                } else {
                    // Shift+click - add or remove from selection
                    const index = self.selectedTriangles.indexOf(triangleResult.triangleIndex);
                    if (index === -1) {
                        self.selectedTriangles.push(triangleResult.triangleIndex);
                    } else if (self.selectedTriangles.length > 1) {
                        // Only remove if there's more than one selected
                        self.selectedTriangles.splice(index, 1);
                    }
                    selectTriangle(triangleResult.triangleIndex);
                }

                e.stopPropagation();
            } else if (!self.isShiftKeyPressed) {
                // Clicked on empty space without shift - deselect all
                self.selectedTriangles = [];
                deselectTriangle();
            }
        }, true);

        // Override wheel for rotation and scaling
        this.canvas.addEventListener('wheel', function (e) {
            // Rotate selected triangles if Alt key is pressed
            if (e.altKey && self.selectedTriangles.length > 0) {
                e.preventDefault();
                e.stopPropagation();

                // Calculate rotation amount based on wheel delta
                const rotationAmount = e.deltaY > 0 ? -0.05 : 0.05; // radians

                self.rotateSelectedTriangles(rotationAmount);
                drawAll();
            }
            // Scale selected triangles if Ctrl key is pressed
            else if ((e.ctrlKey || e.metaKey) && self.selectedTriangles.length > 0) {
                e.preventDefault();
                e.stopPropagation();

                // Calculate scale factor based on wheel delta
                const scaleFactor = e.deltaY > 0 ? 0.95 : 1.05; // 5% increase or decrease

                self.scaleSelectedTriangles(scaleFactor);
                drawAll();
            }
        }, true);
    }

    // Highlight selected triangles
    highlightSelectedTriangles() {
        // Don't highlight if only one triangle is selected, as it's already highlighted
        if (this.selectedTriangles.length <= 1) return;

        this.selectedTriangles.forEach(index => {
            if (index !== selectedTriangle) { // Don't double-highlight the actively selected triangle
                const triangle = triangles[index];
                if (!triangle || triangle.points.length < 3) return;

                const screenPoints = triangle.points.map(p => worldToScreen(p.x, p.y));

                this.ctx.save();

                this.ctx.beginPath();
                this.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
                this.ctx.lineTo(screenPoints[1].x, screenPoints[1].y);
                this.ctx.lineTo(screenPoints[2].x, screenPoints[2].y);
                this.ctx.closePath();

                // Draw highlight
                this.ctx.strokeStyle = '#FFCC00';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();

                this.ctx.restore();
            }
        });
    }

    // Update poly panel visibility based on selection count
    updatePolyPanelVisibility() {
        const polyPanel = document.getElementById('poly-panel');

        if (this.selectedTriangles.length === 1) {
            // Single triangle selected, show poly panel
            polyPanel.style.display = 'block';
        } else if (this.selectedTriangles.length > 1) {
            // Multiple triangles selected, hide poly panel
            polyPanel.style.display = 'none';
        }
    }

    // Setup event listeners for shift key
    setupEventListeners() {
        const self = this;

        // Key events for Shift key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Shift') {
                self.isShiftKeyPressed = true;
            }

            // Add Ctrl+A handler
            if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault(); // Prevent default browser "Select All" behavior
                self.selectAllTriangles();
            }

            // Add DELETE key handler
            if (e.key === 'Delete') {
                e.preventDefault();
                self.deleteSelectedTriangles();
            }
        });

        document.addEventListener('keyup', function (e) {
            if (e.key === 'Shift') {
                self.isShiftKeyPressed = false;
            }
        });
    }

    // Update the pivot point for rotation
    updatePivotPoint() {
        if (this.selectedTriangles.length === 0) return;

        let sumX = 0;
        let sumY = 0;
        let count = 0;

        // Calculate the average of all vertices of selected triangles
        this.selectedTriangles.forEach(index => {
            const triangle = triangles[index];
            triangle.points.forEach(point => {
                sumX += point.x;
                sumY += point.y;
                count++;
            });
        });

        this.pivotPoint.x = sumX / count;
        this.pivotPoint.y = sumY / count;
    }

    // Move all selected triangles
    moveSelectedTriangles(dx, dy) {
        this.selectedTriangles.forEach(index => {
            const triangle = triangles[index];

            // Store original texture coordinates if the triangle has a texture
            const originalTU = triangle.points.map(p => p.TU);
            const originalTV = triangle.points.map(p => p.TV);

            // Move all vertices
            triangle.points.forEach((point, i) => {
                point.x += dx;
                point.y += dy;

                // Restore original texture coordinates if they exist
                if (triangle.texture && originalTU[i] !== undefined) {
                    point.TU = originalTU[i];
                    point.TV = originalTV[i];
                }
            });
        });

        // Update pivot point
        this.pivotPoint.x += dx;
        this.pivotPoint.y += dy;
    }

    // Scale all selected triangles around the pivot point
    scaleSelectedTriangles(scaleFactor) {
        // Skip if no triangles are selected
        if (this.selectedTriangles.length === 0) return;

        this.selectedTriangles.forEach(index => {
            const triangle = triangles[index];

            // Scale each vertex relative to the pivot point
            triangle.points.forEach(point => {
                // Calculate vector from pivot to point
                const dx = point.x - this.pivotPoint.x;
                const dy = point.y - this.pivotPoint.y;

                // Scale vector
                const scaledDx = dx * scaleFactor;
                const scaledDy = dy * scaleFactor;

                // Update point coordinates
                point.x = this.pivotPoint.x + scaledDx;
                point.y = this.pivotPoint.y + scaledDy;
            });

            // If the triangle has texture, update its scale value
            if (triangle.texture) {
                // Update the stored scale value
                triangle.texture.scale = (triangle.texture.scale || 1.0) * scaleFactor;

                // Update texture coordinates if needed
                if (window.textureManager && triangle === window.textureManager.selectedTriangle) {
                    window.textureManager.updateControlsFromTriangle(triangle);
                }
            }
        });
    }


    selectAllTriangles() {
        // Clear current selection first
        this.selectedTriangles = [];

        // Add all triangles to selection
        for (let i = 0; i < triangles.length; i++) {
            this.selectedTriangles.push(i);
        }

        // Skip calling selectTriangle and instead set the active triangle directly
        if (triangles.length > 0) {
            // Set the global variable directly without triggering selection logic
            selectedTriangle = 0;

            // Flag this as a drag operation to prevent deselection on next click
            this.wasTriangleDragged = true;
        }

        // Update the pivot point for rotation
        this.updatePivotPoint();

        // Update poly panel visibility
        this.updatePolyPanelVisibility();

        // Redraw to show all selections
        drawAll();
    }


    // Rotate all selected triangles around the pivot point
    rotateSelectedTriangles(angle) {
        this.selectedTriangles.forEach(index => {
            const triangle = triangles[index];

            // Rotate each vertex around the pivot point
            triangle.points.forEach(point => {
                const rotated = rotatePointAroundCenter(point, this.pivotPoint, angle);
                point.x = rotated.x;
                point.y = rotated.y;
            });

            // If the triangle has texture, update its rotation value
            if (triangle.texture) {
                // Update the stored rotation value (convert radians to degrees)
                triangle.texture.rotation = (triangle.texture.rotation || 0) + (angle * 180 / Math.PI);

                // Update texture coordinates if needed
                if (window.textureManager && triangle === window.textureManager.selectedTriangle) {
                    window.textureManager.updateControlsFromTriangle(triangle);
                }
            }
        });
    }

    deleteSelectedTriangles() {
        if (this.selectedTriangles.length === 0) return;

        // Sort indices in descending order to avoid index shifting problems
        // when removing elements from the array
        const sortedIndices = [...this.selectedTriangles].sort((a, b) => b - a);

        // Remove triangles from highest index to lowest
        sortedIndices.forEach(index => {
            triangles.splice(index, 1);
        });

        // Clear selection
        this.selectedTriangles = [];
        selectedTriangle = null;

        // Update poly panel visibility
        const polyPanel = document.getElementById('poly-panel');
        polyPanel.style.display = 'none';

        // Redraw
        drawAll();
    }

    drawPivotPoint() {
        // Only draw pivot when multiple triangles are selected
        if (this.selectedTriangles.length <= 1) return;

        const screenPivot = worldToScreen(this.pivotPoint.x, this.pivotPoint.y);

        this.ctx.save();

        // Add shadow effect
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Draw a simple white circle
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(screenPivot.x, screenPivot.y, 5, 0, Math.PI * 2);
        this.ctx.fill();

        // Turn off shadow for the crosshair
        this.ctx.shadowColor = 'transparent';

        // Draw a simple crosshair
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(screenPivot.x - 8, screenPivot.y);
        this.ctx.lineTo(screenPivot.x + 8, screenPivot.y);
        this.ctx.moveTo(screenPivot.x, screenPivot.y - 8);
        this.ctx.lineTo(screenPivot.x, screenPivot.y + 8);
        this.ctx.stroke();

        this.ctx.restore();
    }
}

// Initialize the multi-selection manager when the page loads
document.addEventListener('DOMContentLoaded', function () {
    window.multiSelectionManager = new MultiSelectionManager();
});
