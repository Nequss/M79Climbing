// texture-manager.js - Handles texture loading, selection, and manipulation
const textureCache = {};

class TextureManager {
    constructor() {
        this.textures = [];
        this.textureCache = {};
        this.selectedTexture = null;
        this.selectedTriangle = null;
        this.isDragging = false;
        this.lastMousePos = { x: 0, y: 0 };

        // DOM Elements
        this.textureContainer = document.getElementById('texture-container');
        this.textureList = document.getElementById('texture-list');
        this.textureSearch = document.getElementById('texture-search');
        this.textureControls = document.getElementById('texture-controls');

        // Control Elements
        this.positionXSlider = document.getElementById('texture-position-x');
        this.positionYSlider = document.getElementById('texture-position-y');
        this.rotationSlider = document.getElementById('texture-rotation');
        this.scaleSlider = document.getElementById('texture-scale');
        this.positionXValue = document.getElementById('texture-position-x-value');
        this.positionYValue = document.getElementById('texture-position-y-value');
        this.rotationValue = document.getElementById('texture-rotation-value');
        this.scaleValue = document.getElementById('texture-scale-value');
        this.resetTextureBtn = document.getElementById('reset-texture');
        this.removeTextureBtn = document.getElementById('remove-texture');

        this.init();
    }

    init() {
        // Load textures from server
        this.loadTextures();

        // Set up event listeners
        this.setupEventListeners();
    }

    loadTextures() {
        // Fetch textures from ASP.NET Core API endpoint
        fetch('/api/textures')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load textures: ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                this.textures = data;
                this.renderTextureGrid();
            })
            .catch(error => {
                console.error('Error loading textures:', error);
                // Display error in texture grid
                this.textureList.innerHTML = `<div class="texture-error">Failed to load textures. ${error.message}</div>`;
            });
    }

    renderTextureGrid() {
        this.textureList.innerHTML = '';

        const searchTerm = this.textureSearch ? this.textureSearch.value.toLowerCase() : '';
        const filteredTextures = searchTerm
            ? this.textures.filter(t => t.name.toLowerCase().includes(searchTerm))
            : this.textures;

        if (filteredTextures.length === 0) {
            this.textureList.innerHTML = '<div class="no-textures">No textures found</div>';
            return;
        }

        filteredTextures.forEach(texture => {
            const textureItem = document.createElement('div');
            textureItem.className = 'texture-item';
            textureItem.dataset.textureId = texture.id;

            const textureImg = document.createElement('img');
            textureImg.src = texture.path;
            textureImg.alt = texture.name;
            textureImg.title = texture.name;

            textureItem.appendChild(textureImg);
            this.textureList.appendChild(textureItem);

            textureItem.addEventListener('click', () => {
                this.selectTexture(texture);
            });
        });
    }

    selectTexture(texture) {
        this.selectedTexture = texture;

        // Update UI to show selected texture
        document.querySelectorAll('.texture-item').forEach(item => {
            item.classList.remove('selected');
        });

        const selectedItem = document.querySelector(`.texture-item[data-texture-id="${texture.id}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        // If a triangle is selected, apply the texture
        if (this.selectedTriangle !== null) {
            this.applyTextureToTriangle(this.selectedTriangle);
            this.textureControls.style.display = 'block';
            this.resetTextureControls();
        }
    }

    setSelectedTriangle(triangle) {
        this.selectedTriangle = triangle;

        if (triangle === null) {
            this.textureControls.style.display = 'none';
            return;
        }

        // Check if the triangle has texture properties
        if (triangle.texture) {
            // Find and select the texture in the grid
            const textureToSelect = this.textures.find(t => t.id === triangle.texture.id);
            if (textureToSelect) {
                this.selectTexture(textureToSelect);
            }

            // Update the control values based on the triangle's texture properties
            this.updateControlsFromTriangle(triangle);
        } else {
            this.textureControls.style.display = 'none';
        }
    }

    // In texture-manager.js, enhance updateControlsFromTriangle method:
    updateControlsFromTriangle(triangle) {
        if (!triangle.texture) return;

        console.log("Updating controls from triangle:", triangle);

        // Get the average of the three vertices for each property
        const avgTU = (triangle.points[0].TU + triangle.points[1].TU + triangle.points[2].TU) / 3;
        const avgTV = (triangle.points[0].TV + triangle.points[1].TV + triangle.points[2].TV) / 3;
        const avgRHW = triangle.points[0].RHW || 1.0; // Use RHW from first point or default to 1.0

        console.log("Average values:", { TU: avgTU, TV: avgTV, RHW: avgRHW });

        // Explicitly set values to the sliders
        this.positionXSlider.value = avgTU.toString();
        this.positionYSlider.value = avgTV.toString();
        this.rotationSlider.value = (triangle.texture.rotation || 0).toString();
        this.scaleSlider.value = avgRHW.toString();

        // Explicitly update displayed values
        this.updateControlDisplayValues();
    }



    updateControlDisplayValues() {
        this.positionXValue.textContent = parseFloat(this.positionXSlider.value).toFixed(2);
        this.positionYValue.textContent = parseFloat(this.positionYSlider.value).toFixed(2);
        this.rotationValue.textContent = `${this.rotationSlider.value}°`;
        this.scaleValue.textContent = parseFloat(this.scaleSlider.value).toFixed(1);
    }

    // Add this to the triangle texture object when applying a texture
    applyTextureToTriangle(triangle) {
        if (!triangle || !this.selectedTexture) return;

        // Initialize texture properties if needed
        if (!triangle.texture) {
            triangle.texture = {
                id: this.selectedTexture.id,
                path: this.selectedTexture.path,
                rotation: 0,
                // Add these properties for fixed world position
                worldPositionX: 0,
                worldPositionY: 0,
                worldScale: 1.0
            };

            // Initialize default texture coordinates
            this.resetTextureCoordinates(triangle);
        } else {
            // Update texture ID and path only
            triangle.texture.id = this.selectedTexture.id;
            triangle.texture.path = this.selectedTexture.path;
            // Don't reset existing position/scale/rotation
        }

        // Make sure texture controls are visible
        this.textureControls.style.display = 'block';

        // Update controls to match the triangle's texture properties
        this.updateControlsFromTriangle(triangle);

        // Trigger redraw
        if (typeof drawAll === 'function') {
            drawAll();
        }
    }


    resetTextureCoordinates(triangle) {
        // Set default texture coordinates for each vertex
        triangle.points.forEach((point, index) => {
            if (index === 0) {
                point.TU = 0;
                point.TV = 0;
            } else if (index === 1) {
                point.TU = 1;
                point.TV = 0;
            } else if (index === 2) {
                point.TU = 0.5;
                point.TV = 1;
            }

            // Default RHW value (scaling)
            point.RHW = 1.0;
        });
    }

    resetTextureControls() {
        this.positionXSlider.value = 0;
        this.positionYSlider.value = 0;
        this.rotationSlider.value = 0;
        this.scaleSlider.value = 1;
        this.updateControlDisplayValues();
    }

    // In texture-manager.js
    // Enhance the updateTexturePosition method

    updateTexturePosition(dx, dy) {
        if (!this.selectedTriangle || !this.selectedTriangle.texture) return;

        // Directly set absolute position instead of adding delta
        const avgTU = parseFloat(this.positionXSlider.value);
        const avgTV = parseFloat(this.positionYSlider.value);

        // Calculate current average
        const currentAvgTU = (this.selectedTriangle.points[0].TU +
            this.selectedTriangle.points[1].TU +
            this.selectedTriangle.points[2].TU) / 3;
        const currentAvgTV = (this.selectedTriangle.points[0].TV +
            this.selectedTriangle.points[1].TV +
            this.selectedTriangle.points[2].TV) / 3;

        // Apply the difference to each point
        this.selectedTriangle.points.forEach(point => {
            point.TU += (avgTU - currentAvgTU);
            point.TV += (avgTV - currentAvgTV);
        });

        // Redraw
        drawAll();
    }


    updateTextureRotation(angle) {
        if (!this.selectedTriangle || !this.selectedTriangle.texture) return;

        // Store the rotation angle
        this.selectedTriangle.texture.rotation = angle;

        // Calculate the center of the triangle in texture space
        const centerTU = (this.selectedTriangle.points[0].TU +
            this.selectedTriangle.points[1].TU +
            this.selectedTriangle.points[2].TU) / 3;
        const centerTV = (this.selectedTriangle.points[0].TV +
            this.selectedTriangle.points[1].TV +
            this.selectedTriangle.points[2].TV) / 3;

        // Convert angle to radians
        const radians = angle * Math.PI / 180;

        // Rotate each point around the center
        this.selectedTriangle.points.forEach(point => {
            // Translate to origin
            const tu = point.TU - centerTU;
            const tv = point.TV - centerTV;

            // Rotate
            point.TU = centerTU + (tu * Math.cos(radians) - tv * Math.sin(radians));
            point.TV = centerTV + (tu * Math.sin(radians) + tv * Math.cos(radians));
        });

        // Redraw the triangle
        drawAll();
    }

    updateTextureScale(scale) {
        if (!this.selectedTriangle || !this.selectedTriangle.texture) return;

        // Update RHW for all vertices (used for scaling)
        this.selectedTriangle.points.forEach(point => {
            point.RHW = scale;
        });

        // Calculate the center of the triangle in texture space
        const centerTU = (this.selectedTriangle.points[0].TU +
            this.selectedTriangle.points[1].TU +
            this.selectedTriangle.points[2].TU) / 3;
        const centerTV = (this.selectedTriangle.points[0].TV +
            this.selectedTriangle.points[1].TV +
            this.selectedTriangle.points[2].TV) / 3;

        // Scale each point from the center
        this.selectedTriangle.points.forEach(point => {
            // Translate to origin
            const tu = point.TU - centerTU;
            const tv = point.TV - centerTV;

            // Scale relative to current scale
            const currentScale = point.RHW || 1.0;
            const scaleFactor = scale / currentScale;
            point.TU = centerTU + tu * scaleFactor;
            point.TV = centerTV + tv * scaleFactor;
        });

        // Redraw the triangle
        drawAll();
    }

    removeTextureFromTriangle() {
        if (!this.selectedTriangle) return;

        // Remove texture properties
        delete this.selectedTriangle.texture;

        // Reset texture coordinates
        this.selectedTriangle.points.forEach(point => {
            point.TU = 0;
            point.TV = 0;
            point.RHW = 1.0;
        });

        // Hide texture controls
        this.textureControls.style.display = 'none';

        // Redraw
        drawAll();
    }

    setupEventListeners() {
        // Search functionality
        if (this.textureSearch) {
            this.textureSearch.addEventListener('input', () => {
                this.renderTextureGrid();
            });
        }

        // Slider controls
        this.positionXSlider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            this.positionXValue.textContent = newValue.toFixed(2);

            if (this.selectedTriangle && this.selectedTriangle.texture) {
                const currentAvg = (this.selectedTriangle.points[0].TU +
                    this.selectedTriangle.points[1].TU +
                    this.selectedTriangle.points[2].TU) / 3;
                this.updateTexturePosition(newValue - currentAvg, 0);
            }
        });

        this.positionYSlider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            this.positionYValue.textContent = newValue.toFixed(2);

            if (this.selectedTriangle && this.selectedTriangle.texture) {
                const currentAvg = (this.selectedTriangle.points[0].TV +
                    this.selectedTriangle.points[1].TV +
                    this.selectedTriangle.points[2].TV) / 3;
                this.updateTexturePosition(0, newValue - currentAvg);
            }
        });

        this.rotationSlider.addEventListener('input', (e) => {
            const newValue = parseInt(e.target.value);
            this.rotationValue.textContent = `${newValue}°`;

            if (this.selectedTriangle && this.selectedTriangle.texture) {
                this.updateTextureRotation(newValue);
            }
        });

        this.scaleSlider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            this.scaleValue.textContent = newValue.toFixed(1);

            if (this.selectedTriangle && this.selectedTriangle.texture) {
                this.updateTextureScale(newValue);
            }
        });

        // Reset and remove buttons
        this.resetTextureBtn.addEventListener('click', () => {
            if (this.selectedTriangle && this.selectedTriangle.texture) {
                this.resetTextureCoordinates(this.selectedTriangle);
                this.resetTextureControls();
                drawAll();
            }
        });

        this.removeTextureBtn.addEventListener('click', () => {
            this.removeTextureFromTriangle();
        });

        // Setup canvas event listeners for texture manipulation
        this.setupCanvasListeners();
    }

    setupCanvasListeners() {
        const canvas = document.getElementById('canvas-editor');

        canvas.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;

            // Only handle triangle selection, not texture manipulation
            const triangleResult = findTriangleUnderCursor(e.clientX, e.clientY);
            if (triangleResult.found && triangles[triangleResult.triangleIndex].texture) {
                this.setSelectedTriangle(triangles[triangleResult.triangleIndex]);
            }
        });

        canvas.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }
}

function drawTexturedTriangle(triangle, triangleIndex) {
    if (!triangle.texture || !triangle.texture.path || triangle.points.length < 3) {
        return false;
    }

    const screenPoints = triangle.points.map(p => worldToScreen(p.x, p.y));

    // Get or create the texture image
    let img;
    const texturePath = triangle.texture.path;

    if (textureCache[texturePath]) {
        img = textureCache[texturePath];

        // If image is loaded, draw with texture
        if (img.complete) {
            try {
                // Draw triangle outline
                ctx.beginPath();
                ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
                ctx.lineTo(screenPoints[1].x, screenPoints[1].y);
                ctx.lineTo(screenPoints[2].x, screenPoints[2].y);
                ctx.closePath();

                // Fill with colored background first
                const isSelected = (triangleIndex === selectedTriangle);
                ctx.fillStyle = triangle.color || '#64c8ff';
                ctx.fill();

                // Then try to add texture
                ctx.save();
                ctx.clip(); // Clip to the triangle shape

                // Simple pattern approach first
                try {
                    const pattern = ctx.createPattern(img, 'repeat');
                    ctx.fillStyle = pattern;
                    ctx.globalAlpha = 0.8; // Make texture slightly transparent
                    ctx.fill();
                } catch (e) {
                    console.error("Pattern creation failed:", e);
                }

                ctx.restore();

                // Draw the outline
                ctx.strokeStyle = isSelected ? '#FFCC00' : triangle.color || '#64c8ff';
                ctx.lineWidth = isSelected ? 3 : 2;
                ctx.stroke();

                // Draw vertices
                screenPoints.forEach((p, i) => {
                    const isVertexSelected = (triangleIndex === selectedTriangleIndex && i === selectedVertexIndex);
                    ctx.fillStyle = isVertexSelected ? 'yellow' :
                        (i === 0 ? 'red' : (i === 1 ? 'green' : 'blue'));
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, isVertexSelected ? 6 : 4, 0, Math.PI * 2);
                    ctx.fill();
                });

                return true;
            } catch (e) {
                console.error("Error drawing textured triangle:", e);
                return false;
            }
        }
    } else {
        // Create and cache the image
        img = new Image();
        textureCache[texturePath] = img;
        img.src = texturePath;

        img.onload = () => {
            console.log("Texture loaded successfully:", texturePath);
            drawAll(); // Redraw when texture loads
        };

        img.onerror = (e) => {
            console.error("Failed to load texture:", texturePath, e);
        };
    }

    // If we can't draw with texture yet, return false to let regular triangle drawing happen
    return false;
}


// Replace the existing function override with this
const originalDrawTriangle = drawTriangle;
window.drawTriangle = function (triangle, triangleIndex) {
    // First try to draw as textured triangle
    if (triangle.texture && drawTexturedTriangle(triangle, triangleIndex)) {
        // Successfully drew with texture, nothing more to do
        return;
    }

    // Fall back to original triangle drawing
    originalDrawTriangle(triangle, triangleIndex);
};


// Initialize the texture manager when the page loads
let textureManager;

document.addEventListener('DOMContentLoaded', () => {
    window.textureManager = new TextureManager();

    // Override functions - use window.textureManager!
    const originalSelectTriangle = selectTriangle;
    window.selectTriangle = function (index) {
        originalSelectTriangle(index);
        window.textureManager.setSelectedTriangle(triangles[index]); // Fixed!
    };

    const originalDeselectTriangle = deselectTriangle;
    window.deselectTriangle = function () {
        originalDeselectTriangle();
        window.textureManager.setSelectedTriangle(null); // Fixed!
    };
});


