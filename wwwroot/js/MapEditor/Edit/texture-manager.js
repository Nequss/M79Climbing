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

    updateControlsFromTriangle(triangle) {
        if (!triangle.texture) return;

        // Set UI controls based on stored transformation values
        this.positionXSlider.value = (triangle.texture.positionX || 0).toString();
        this.positionYSlider.value = (triangle.texture.positionY || 0).toString();
        this.rotationSlider.value = (triangle.texture.rotation || 0).toString();
        this.scaleSlider.value = (triangle.texture.scale || 1.0).toString();

        // Update display
        this.updateControlDisplayValues();
    }

    updateControlDisplayValues() {
        this.positionXValue.textContent = parseFloat(this.positionXSlider.value).toFixed(3);
        this.positionYValue.textContent = parseFloat(this.positionYSlider.value).toFixed(3);
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

        // Reset all transformation properties
        if (triangle.texture) {
            // Store original coordinates for reference
            triangle.texture.originalCoords = [
                { TU: 0, TV: 0 },
                { TU: 1, TV: 0 },
                { TU: 0.5, TV: 1 }
            ];

            triangle.texture.rotation = 0;
            triangle.texture.scale = 1.0;
            triangle.texture.positionX = 0;
            triangle.texture.positionY = 0;
        }
    }

    resetTextureControls() {
        this.positionXSlider.value = 0;
        this.positionYSlider.value = 0;
        this.rotationSlider.value = 0;
        this.scaleSlider.value = 1;
        this.updateControlDisplayValues();
    }

    updateTexturePosition(newX, newY) {
        if (!this.selectedTriangle || !this.selectedTriangle.texture) return;

        // Store previous position values
        const prevX = this.selectedTriangle.texture.positionX || 0;
        const prevY = this.selectedTriangle.texture.positionY || 0;

        // Calculate deltas (how much the position changed)
        const deltaX = newX !== null ? parseFloat(newX) - prevX : 0;
        const deltaY = newY !== null ? parseFloat(newY) - prevY : 0;

        // Update stored position values
        if (newX !== null) this.selectedTriangle.texture.positionX = parseFloat(newX);
        if (newY !== null) this.selectedTriangle.texture.positionY = parseFloat(newY);

        // Get current rotation in radians
        const angle = (this.selectedTriangle.texture.rotation || 0) * Math.PI / 180;

        // Calculate rotated deltas to account for texture rotation
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);

        // Apply rotation to the movement delta (in the opposite direction)
        const rotatedDeltaU = deltaX * cosAngle + deltaY * sinAngle;
        const rotatedDeltaV = -deltaX * sinAngle + deltaY * cosAngle;

        // Apply the rotated deltas to all vertices
        this.selectedTriangle.points.forEach(point => {
            point.TU -= rotatedDeltaU;
            point.TV -= rotatedDeltaV;
        });

        // Redraw
        drawAll();
    }


    updateTextureRotation(angle) {
        if (!this.selectedTriangle || !this.selectedTriangle.texture) return;

        // Store the rotation angle
        this.selectedTriangle.texture.rotation = angle;

        // Apply transformations from original coordinates
        this.applyAllTextureTransformations();

        // Redraw
        drawAll();
    }

    updateTextureScale(scale) {
        if (!this.selectedTriangle || !this.selectedTriangle.texture) return;

        // Store scale in texture object
        this.selectedTriangle.texture.scale = scale;

        // Apply transformations from original coordinates
        this.applyAllTextureTransformations();

        // Redraw
        drawAll();
    }

    // New function to apply all transformations consistently
    applyAllTextureTransformations() {
        const triangle = this.selectedTriangle;
        const texture = triangle.texture;

        // Get transformation values
        const posX = texture.positionX || 0;
        const posY = texture.positionY || 0;
        const rotation = (texture.rotation || 0) * Math.PI / 180;
        const scale = texture.scale || 1.0;

        // Get original coordinates
        const originalCoords = texture.originalCoords || [
            { TU: 0, TV: 0 },
            { TU: 1, TV: 0 },
            { TU: 0.5, TV: 1 }
        ];

        // Center point of the texture coordinates
        const centerTU = 0.5;
        const centerTV = 1 / 3;

        // Apply all transformations in order: scale → rotate → translate
        triangle.points.forEach((point, index) => {
            const origTU = originalCoords[index].TU;
            const origTV = originalCoords[index].TV;

            // Scale from center
            const scaledTU = centerTU + (origTU - centerTU) / scale;
            const scaledTV = centerTV + (origTV - centerTV) / scale;

            // Rotate around center
            const cosAngle = Math.cos(rotation);
            const sinAngle = Math.sin(rotation);

            const rotatedTU = centerTU + (scaledTU - centerTU) * cosAngle - (scaledTV - centerTV) * sinAngle;
            const rotatedTV = centerTV + (scaledTU - centerTU) * sinAngle + (scaledTV - centerTV) * cosAngle;

            // Translate
            point.TU = rotatedTU - posX;
            point.TV = rotatedTV - posY;

            // Apply scale to RHW
            point.RHW = scale;
        });
    }



    updateTextureScale(scale) {
        if (!this.selectedTriangle || !this.selectedTriangle.texture) return;

        // Update RHW for all vertices (used for scaling)
        this.selectedTriangle.points.forEach(point => {
            point.RHW = scale;
        });

        // Store scale in texture object
        this.selectedTriangle.texture.scale = scale;

        // Calculate texture center from the actual texture coordinates
        const textureCenterTU = (this.selectedTriangle.points[0].TU + this.selectedTriangle.points[1].TU + this.selectedTriangle.points[2].TU) / 3;
        const textureCenterTV = (this.selectedTriangle.points[0].TV + this.selectedTriangle.points[1].TV + this.selectedTriangle.points[2].TV) / 3;

        // Scale each point from the calculated texture center
        const oldScale = this.selectedTriangle.texture.oldScale || 1.0;
        const relativeScale = scale / oldScale;

        this.selectedTriangle.points.forEach(point => {
            // Scale coordinates relative to calculated texture center
            point.TU = textureCenterTU + ((point.TU - textureCenterTU) * relativeScale);
            point.TV = textureCenterTV + ((point.TV - textureCenterTV) * relativeScale);
        });

        // Remember current scale for next relative scale calculation
        this.selectedTriangle.texture.oldScale = scale;

        // Redraw
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

    applyAllTextureTransformations() {
        const triangle = this.selectedTriangle;
        const texture = triangle.texture;

        // Get transformation values
        const posX = texture.positionX || 0;
        const posY = texture.positionY || 0;
        const rotation = (texture.rotation || 0) * Math.PI / 180;
        const scale = texture.scale || 1.0;

        // Get original coordinates
        const originalCoords = texture.originalCoords || [
            { TU: 0, TV: 0 },
            { TU: 1, TV: 0 },
            { TU: 0.5, TV: 1 }
        ];

        // Center point of the texture coordinates
        const centerTU = 0.5;
        const centerTV = 1 / 3;

        // Apply all transformations in order: scale → rotate → translate
        triangle.points.forEach((point, index) => {
            const origTU = originalCoords[index].TU;
            const origTV = originalCoords[index].TV;

            // Scale from center
            const scaledTU = centerTU + (origTU - centerTU) / scale;
            const scaledTV = centerTV + (origTV - centerTV) / scale;

            // Rotate around center
            const cosAngle = Math.cos(rotation);
            const sinAngle = Math.sin(rotation);

            const rotatedTU = centerTU + (scaledTU - centerTU) * cosAngle - (scaledTV - centerTV) * sinAngle;
            const rotatedTV = centerTV + (scaledTU - centerTU) * sinAngle + (scaledTV - centerTV) * cosAngle;

            // Translate
            point.TU = rotatedTU - posX;
            point.TV = rotatedTV - posY;

            // Apply scale to RHW
            point.RHW = scale;
        });
    }

    setupEventListeners() {
        // Initialize textbox with the slider's max value
        this.scaleValue.value = parseFloat(this.scaleSlider.max).toFixed(1);

        // Position X text input
        this.positionXValue.addEventListener('change', (e) => {
            let newValue = parseFloat(e.target.value);
            if (isNaN(newValue)) {
                newValue = 0;
                this.positionXValue.value = "0.00";
            }

            // Clamp to allowed range
            newValue = Math.max(-1, Math.min(1, newValue));
            this.positionXValue.value = newValue.toFixed(2);

            // Update slider and apply change
            this.positionXSlider.value = newValue;
            this.updateTexturePosition(newValue, null);
        });

        // Position Y text input
        this.positionYValue.addEventListener('change', (e) => {
            let newValue = parseFloat(e.target.value);
            if (isNaN(newValue)) {
                newValue = 0;
                this.positionYValue.value = "0.00";
            }

            // Clamp to allowed range
            newValue = Math.max(-1, Math.min(1, newValue));
            this.positionYValue.value = newValue.toFixed(2);

            // Update slider and apply change
            this.positionYSlider.value = newValue;
            this.updateTexturePosition(null, newValue);
        });

        // Rotation text input
        this.rotationValue.addEventListener('change', (e) => {
            let newValue = parseFloat(e.target.value);
            if (isNaN(newValue)) {
                newValue = 0;
                this.rotationValue.value = "0";
            }

            // Clamp and normalize to 0-360 range
            newValue = newValue % 360;
            if (newValue < 0) newValue += 360;
            this.rotationValue.value = newValue.toFixed(0);

            // Update slider and apply change
            this.rotationSlider.value = newValue;
            this.updateTextureRotation(newValue);
        });

        this.scaleSlider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            this.scaleValue.textContent = newValue.toFixed(1);

            if (this.selectedTriangle && this.selectedTriangle.texture) {
                this.updateTextureScale(newValue);
            }
        });

        // Existing event listeners
        this.positionXSlider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            this.positionXValue.textContent = newValue.toFixed(3);

            if (this.selectedTriangle && this.selectedTriangle.texture) {
                this.updateTexturePosition(newValue, null);
            }
        });

        // Search functionality
        if (this.textureSearch) {
            this.textureSearch.addEventListener('input', () => {
                this.renderTextureGrid();
            });
        }

        // Slider controls
        this.positionXSlider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            this.positionXValue.textContent = newValue.toFixed(3);

            if (this.selectedTriangle && this.selectedTriangle.texture) {
                this.updateTexturePosition(newValue, null);
            }
        });

        this.positionYSlider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            this.positionYValue.textContent = newValue.toFixed(3);

            if (this.selectedTriangle && this.selectedTriangle.texture) {
                this.updateTexturePosition(null, newValue);
            }
        });

        this.rotationSlider.addEventListener('input', (e) => {
            const newValue = parseInt(e.target.value);
            this.rotationValue.textContent = `${newValue}°`;

            if (this.selectedTriangle && this.selectedTriangle.texture) {
                this.updateTextureRotation(newValue);
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

    let img;
    const texturePath = triangle.texture.path;

    if (textureCache[texturePath] && textureCache[texturePath].complete) {
        img = textureCache[texturePath];

        try {
            // Get triangle vertices in world coordinates
            const worldPoints = triangle.points;

            // Convert to screen coordinates for drawing
            const screenPoints = worldPoints.map(p => worldToScreen(p.x, p.y));

            // Draw base triangle with semi-transparent color
            ctx.beginPath();
            ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
            ctx.lineTo(screenPoints[1].x, screenPoints[1].y);
            ctx.lineTo(screenPoints[2].x, screenPoints[2].y);
            ctx.closePath();

            const isSelected = (triangleIndex === selectedTriangle);
            const baseColor = triangle.color || '#64c8ff';

            // Make the base color more transparent when textured
            const baseAlpha = 0.3;
            const rgbMatch = baseColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
            if (rgbMatch) {
                const r = parseInt(rgbMatch[1], 16);
                const g = parseInt(rgbMatch[2], 16);
                const b = parseInt(rgbMatch[3], 16);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${baseAlpha})`;
            } else {
                ctx.fillStyle = baseColor;
            }
            ctx.fill();

            // Now apply texture
            ctx.save();

            // Clip to the triangle shape
            ctx.beginPath();
            ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
            ctx.lineTo(screenPoints[1].x, screenPoints[1].y);
            ctx.lineTo(screenPoints[2].x, screenPoints[2].y);
            ctx.closePath();
            ctx.clip();

            // Get texture parameters
            const rotation = triangle.texture.rotation || 0;
            const scale = Math.max(triangle.points[0].RHW || 1.0, 0.1); // Prevent zero scale

            // Calculate center of triangle in world space
            const centerWorldX = (worldPoints[0].x + worldPoints[1].x + worldPoints[2].x) / 3;
            const centerWorldY = (worldPoints[0].y + worldPoints[1].y + worldPoints[2].y) / 3;

            // Convert to screen space
            const centerScreen = worldToScreen(centerWorldX, centerWorldY);

            // Calculate average texture coordinates
            const avgTU = ((worldPoints[0].TU || 0) + (worldPoints[1].TU || 0) + (worldPoints[2].TU || 0)) / 3;
            const avgTV = ((worldPoints[0].TV || 0) + (worldPoints[1].TV || 0) + (worldPoints[2].TV || 0)) / 3;

            // Apply transformations for texture rendering
            ctx.translate(centerScreen.x, centerScreen.y);
            ctx.rotate(rotation * Math.PI / 180);

            // Scale by zoom level to keep texture fixed in world space
            ctx.scale(scale * zoomLevel, scale * zoomLevel);

            // Position texture based on TU/TV coordinates
            const offsetX = -avgTU * img.width;
            const offsetY = -avgTV * img.height;

            // Draw the image
            ctx.globalAlpha = 0.9;
            ctx.drawImage(img, offsetX, offsetY);

            ctx.restore();

            // Draw triangle outline and vertices as normal
            ctx.strokeStyle = isSelected ? '#FFCC00' : baseColor;
            ctx.lineWidth = isSelected ? 3 : 2;
            ctx.beginPath();
            ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
            ctx.lineTo(screenPoints[1].x, screenPoints[1].y);
            ctx.lineTo(screenPoints[2].x, screenPoints[2].y);
            ctx.closePath();
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
    } else {
        // Create and cache the image if not loaded yet
        img = new Image();
        textureCache[texturePath] = img;
        img.src = texturePath;

        img.onload = () => {
            console.log("Texture loaded successfully:", texturePath);
            drawAll();
        };

        img.onerror = (e) => {
            console.error("Failed to load texture:", texturePath, e);
        };
    }

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


