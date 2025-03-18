// clipboard-manager.js - Handles copying and pasting triangles with all properties

class ClipboardManager {
    constructor() {
        // Store copied triangles
        this.copiedTriangles = [];
        this.clipboardPivot = { x: 0, y: 0 };
        this.lastKnownMousePos = null; // Track last known mouse position

        // Initialize
        this.init();
    }

    init() {
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Track mouse position on the canvas
        this.trackMousePosition();

        console.log("Triangle Clipboard Manager initialized");
    }

    // Track mouse position for paste operations
    trackMousePosition() {
        const canvas = document.getElementById('canvas-editor');
        if (!canvas) return;

        canvas.addEventListener('mousemove', (e) => {
            // Store mouse position in world coordinates
            this.lastKnownMousePos = screenToWorld(e.clientX, e.clientY);
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Copy - Ctrl+C or Cmd+C
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                this.copySelectedTriangles();
                e.preventDefault();
            }

            // Paste - Ctrl+V or Cmd+V
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                this.pasteTrianglesAtMousePosition();
                e.preventDefault();
            }

            // Duplicate - Ctrl+D or Cmd+D (alternative shortcut)
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                this.copySelectedTriangles();
                this.pasteTrianglesAtMousePosition();
                e.preventDefault();
            }
        });
    }

    copySelectedTriangles() {
        // Clear previous clipboard
        this.copiedTriangles = [];

        if (!window.multiSelectionManager) {
            console.error("MultiSelectionManager not found");
            return;
        }

        // Get selected triangles from the multi-selection manager
        const selectedIndices = window.multiSelectionManager.selectedTriangles;

        if (selectedIndices.length === 0) {
            console.log("Nothing selected to copy");
            return;
        }

        // Calculate pivot point (center) of the selection
        this.calculateSelectionPivot(selectedIndices);

        // Deep copy each selected triangle
        selectedIndices.forEach(index => {
            const originalTriangle = triangles[index];
            const triangleCopy = this.deepCopyTriangle(originalTriangle);
            this.copiedTriangles.push(triangleCopy);
        });

        console.log(`Copied ${this.copiedTriangles.length} triangles to clipboard`);

        // Show a visual indicator that copy was successful
        this.showCopyFeedback();
    }

    deepCopyTriangle(triangle) {
        // Create a new triangle object
        const copy = {
            points: [],
            type: triangle.type,
            color: triangle.color
        };

        // Deep copy all points with their properties
        triangle.points.forEach(point => {
            const pointCopy = {
                x: point.x,
                y: point.y
            };

            // Copy texture coordinates if they exist
            if (point.TU !== undefined) pointCopy.TU = point.TU;
            if (point.TV !== undefined) pointCopy.TV = point.TV;
            if (point.RHW !== undefined) pointCopy.RHW = point.RHW;

            copy.points.push(pointCopy);
        });

        // Deep copy texture properties if they exist
        if (triangle.texture) {
            copy.texture = { ...triangle.texture };

            // If texture has originalCoords, copy that too
            if (triangle.texture.originalCoords) {
                copy.texture.originalCoords = triangle.texture.originalCoords.map(coord => ({ ...coord }));
            }
        }

        return copy;
    }

    calculateSelectionPivot(selectedIndices) {
        let sumX = 0;
        let sumY = 0;
        let pointCount = 0;

        // Calculate the average position of all vertices in the selection
        selectedIndices.forEach(index => {
            const triangle = triangles[index];
            triangle.points.forEach(point => {
                sumX += point.x;
                sumY += point.y;
                pointCount++;
            });
        });

        if (pointCount > 0) {
            this.clipboardPivot = {
                x: sumX / pointCount,
                y: sumY / pointCount
            };
        }
    }

    pasteTrianglesAtMousePosition() {
        if (this.copiedTriangles.length === 0) {
            console.log("Nothing to paste");
            return;
        }

        // Get mouse position - use our tracked position or fallback to alternatives
        const mousePos = this.getMouseWorldPosition();
        if (!mousePos) return;

        // Calculate offset from original pivot to new position
        const offsetX = mousePos.x - this.clipboardPivot.x;
        const offsetY = mousePos.y - this.clipboardPivot.y;

        // Add new triangles to the triangles array
        const newTriangles = [];
        const newIndices = [];

        this.copiedTriangles.forEach(copiedTriangle => {
            // Create a deep copy of the triangle to paste
            const pastedTriangle = this.deepCopyTriangle(copiedTriangle);

            // Offset all points
            pastedTriangle.points.forEach(point => {
                point.x += offsetX;
                point.y += offsetY;
            });

            // Add to triangles array and track index
            const newIndex = triangles.length;
            triangles.push(pastedTriangle);
            newTriangles.push(pastedTriangle);
            newIndices.push(newIndex);
        });

        console.log(`Pasted ${newTriangles.length} triangles`);

        // Select the newly pasted triangles
        this.selectPastedTriangles(newIndices);

        // Redraw
        drawAll();
    }

    selectPastedTriangles(newIndices) {
        // Clear current selection
        if (window.multiSelectionManager) {
            // Set new selection to the pasted triangles
            window.multiSelectionManager.selectedTriangles = [...newIndices];

            // Update pivot point
            window.multiSelectionManager.updatePivotPoint();

            // Update UI
            window.multiSelectionManager.updatePolyPanelVisibility();

            // Set the first triangle as the active one
            if (newIndices.length > 0) {
                selectedTriangle = newIndices[0];

                // If we have a texture manager and the triangle has a texture, select it
                if (window.textureManager && triangles[newIndices[0]].texture) {
                    window.textureManager.setSelectedTriangle(triangles[newIndices[0]]);
                }
            }
        } else {
            // Fallback if multiSelectionManager is not available
            if (newIndices.length > 0) {
                selectTriangle(newIndices[0]);
            }
        }
    }

    getMouseWorldPosition() {
        // First try our tracked mouse position
        if (this.lastKnownMousePos) {
            return this.lastKnownMousePos;
        }

        // Then try the global lastMousePos if available
        if (window.lastMousePos) {
            return screenToWorld(window.lastMousePos.x, window.lastMousePos.y);
        }

        // Finally fall back to the center of the visible canvas area
        const canvas = document.getElementById('canvas-editor');
        if (canvas) {
            // Get the center of the canvas in screen coordinates
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            // Convert to world coordinates
            return screenToWorld(centerX, centerY);
        }

        console.error("Cannot determine paste position - no canvas found");
        return null;
    }

    showCopyFeedback() {
        // Create a temporary overlay that shows copy was successful
        const overlay = document.createElement('div');
        overlay.textContent = `Copied ${this.copiedTriangles.length} triangles`;
        overlay.style.position = 'fixed';
        overlay.style.top = '20px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        overlay.style.color = 'white';
        overlay.style.padding = '10px 20px';
        overlay.style.borderRadius = '5px';
        overlay.style.zIndex = '1000';
        overlay.style.transition = 'opacity 0.5s';

        document.body.appendChild(overlay);

        // Fade out and remove after 2 seconds
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(overlay);
            }, 350);
        }, 900);
    }
}

// Initialize clipboard manager
document.addEventListener('DOMContentLoaded', function () {
    window.clipboardManager = new ClipboardManager();
});
