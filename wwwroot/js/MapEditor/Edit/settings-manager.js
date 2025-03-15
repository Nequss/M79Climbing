// settings-manager.js - Handles map settings and properties
class SettingsManager {
    constructor() {
        // Settings properties with random background colors
        this.mapSettings = {
            name: "New Map",
            bgColorTop: {
                red: Math.floor(Math.random() * 256),
                green: Math.floor(Math.random() * 256),
                blue: Math.floor(Math.random() * 256),
                alpha: 255
            },
            bgColorBottom: {
                red: Math.floor(Math.random() * 256),
                green: Math.floor(Math.random() * 256),
                blue: Math.floor(Math.random() * 256),
                alpha: 255
            },
            weatherType: 0, // wtNONE
            stepsType: 0    // stHARD_GROUND
        };

        // Set up DOM elements
        this.setupDOM();
        this.setupEventListeners();
        this.updateUIFromSettings();

        // Draw background immediately
        this.applyBackgroundGradient();
    }

    setupDOM() {
        // Get DOM elements from the existing HTML structure
        this.settingsPanel = document.getElementById('settings-panel');
        this.mapNameInput = document.getElementById('map-name');
        this.bgColorTopPicker = document.getElementById('bg-color-top');
        this.bgTopRed = document.getElementById('bg-top-red');
        this.bgTopGreen = document.getElementById('bg-top-green');
        this.bgTopBlue = document.getElementById('bg-top-blue');
        this.bgTopAlpha = document.getElementById('bg-top-alpha');
        this.bgColorBottomPicker = document.getElementById('bg-color-bottom');
        this.bgBottomRed = document.getElementById('bg-bottom-red');
        this.bgBottomGreen = document.getElementById('bg-bottom-green');
        this.bgBottomBlue = document.getElementById('bg-bottom-blue');
        this.bgBottomAlpha = document.getElementById('bg-bottom-alpha');
        this.weatherTypeSelect = document.getElementById('weather-type');
        this.stepsTypeSelect = document.getElementById('steps-type');
        this.applyButton = document.getElementById('apply-settings');

        // Hide the apply button as we'll apply changes immediately
        if (this.applyButton) {
            this.applyButton.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Connect settings button
        const controlsBtn = document.getElementById('controls-btn');
        if (controlsBtn) {
            controlsBtn.addEventListener('click', () => this.toggleSettingsPanel());
        }

        // Color pickers with immediate apply
        this.bgColorTopPicker.addEventListener('input', (e) => {
            this.updateColorInputsFromPicker(e.target.value, 'top');
            this.applySettings(); // Apply immediately
        });

        this.bgColorBottomPicker.addEventListener('input', (e) => {
            this.updateColorInputsFromPicker(e.target.value, 'bottom');
            this.applySettings(); // Apply immediately
        });

        // RGB inputs with immediate apply
        [this.bgTopRed, this.bgTopGreen, this.bgTopBlue, this.bgTopAlpha].forEach(input => {
            input.addEventListener('input', () => {
                this.updateColorPickerFromInputs('top');
                this.applySettings(); // Apply immediately
            });
        });

        [this.bgBottomRed, this.bgBottomGreen, this.bgBottomBlue, this.bgBottomAlpha].forEach(input => {
            input.addEventListener('input', () => {
                this.updateColorPickerFromInputs('bottom');
                this.applySettings(); // Apply immediately
            });
        });

        // Weather and steps type with immediate apply
        this.weatherTypeSelect.addEventListener('change', () => {
            this.applySettings(); // Apply immediately
        });

        this.stepsTypeSelect.addEventListener('change', () => {
            this.applySettings(); // Apply immediately
        });

        // Map name with immediate apply
        this.mapNameInput.addEventListener('input', () => {
            this.applySettings(); // Apply immediately
        });

        // Close panel when clicking on canvas (empty space)
        const canvas = document.getElementById('canvas-editor');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                // Check if clicking on empty area (not a triangle)
                if (typeof findTriangleUnderCursor === 'function') {
                    const triangleResult = findTriangleUnderCursor(e.clientX, e.clientY);
                    if (!triangleResult.found) {
                        this.closeSettingsPanel();
                        this.deselectAllObjects();
                    }
                }
            });

            // Close panel when right-clicking anywhere
            canvas.addEventListener('contextmenu', (e) => {
                this.closeSettingsPanel();
                e.preventDefault(); // Prevent default context menu
            });
        }
    }

    // Rest of the methods remain the same, but we won't need to use applyButton anymore
    toggleSettingsPanel() {
        this.settingsPanel.style.display = this.settingsPanel.style.display === 'none' ? 'block' : 'none';
    }

    closeSettingsPanel() {
        if (this.settingsPanel) {
            this.settingsPanel.style.display = 'none';
        }
    }

    deselectAllObjects() {
        // Deselect triangles and other objects
        if (typeof deselectTriangle === 'function') {
            deselectTriangle();
        }
    }

    applySettings() {
        // Update settings from UI
        this.mapSettings.name = this.mapNameInput.value;

        // Colors
        this.mapSettings.bgColorTop = {
            red: parseInt(this.bgTopRed.value) || 0,
            green: parseInt(this.bgTopGreen.value) || 0,
            blue: parseInt(this.bgTopBlue.value) || 0,
            alpha: parseInt(this.bgTopAlpha.value) || 255
        };

        this.mapSettings.bgColorBottom = {
            red: parseInt(this.bgBottomRed.value) || 0,
            green: parseInt(this.bgBottomGreen.value) || 0,
            blue: parseInt(this.bgBottomBlue.value) || 0,
            alpha: parseInt(this.bgBottomAlpha.value) || 255
        };

        // Types
        this.mapSettings.weatherType = parseInt(this.weatherTypeSelect.value);
        this.mapSettings.stepsType = parseInt(this.stepsTypeSelect.value);

        // Apply background gradient immediately
        this.applyBackgroundGradient();
    }

    updateUIFromSettings() {
        this.mapNameInput.value = this.mapSettings.name;

        // Set color values
        this.bgTopRed.value = this.mapSettings.bgColorTop.red;
        this.bgTopGreen.value = this.mapSettings.bgColorTop.green;
        this.bgTopBlue.value = this.mapSettings.bgColorTop.blue;
        this.bgTopAlpha.value = this.mapSettings.bgColorTop.alpha;

        this.bgBottomRed.value = this.mapSettings.bgColorBottom.red;
        this.bgBottomGreen.value = this.mapSettings.bgColorBottom.green;
        this.bgBottomBlue.value = this.mapSettings.bgColorBottom.blue;
        this.bgBottomAlpha.value = this.mapSettings.bgColorBottom.alpha;

        // Update color pickers
        this.updateColorPickerFromInputs('top');
        this.updateColorPickerFromInputs('bottom');

        // Set dropdown values
        this.weatherTypeSelect.value = this.mapSettings.weatherType;
        this.stepsTypeSelect.value = this.mapSettings.stepsType;
    }

    updateColorInputsFromPicker(hexColor, position) {
        // Convert hex to RGB
        const r = parseInt(hexColor.substr(1, 2), 16);
        const g = parseInt(hexColor.substr(3, 2), 16);
        const b = parseInt(hexColor.substr(5, 2), 16);

        if (position === 'top') {
            this.bgTopRed.value = r;
            this.bgTopGreen.value = g;
            this.bgTopBlue.value = b;
        } else {
            this.bgBottomRed.value = r;
            this.bgBottomGreen.value = g;
            this.bgBottomBlue.value = b;
        }
    }

    updateColorPickerFromInputs(position) {
        // Convert RGB to hex
        const rgbToHex = (r, g, b) => '#' + [r, g, b]
            .map(x => {
                const hex = Math.max(0, Math.min(255, parseInt(x) || 0)).toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            })
            .join('');

        if (position === 'top') {
            this.bgColorTopPicker.value = rgbToHex(
                this.bgTopRed.value,
                this.bgTopGreen.value,
                this.bgTopBlue.value
            );
        } else {
            this.bgColorBottomPicker.value = rgbToHex(
                this.bgBottomRed.value,
                this.bgBottomGreen.value,
                this.bgBottomBlue.value
            );
        }
    }

    applyBackgroundGradient() {
        const canvas = document.getElementById('canvas-editor');
        if (!canvas) return;

        // Store original draw function if needed
        if (!window.originalDrawAll && typeof drawAll === 'function') {
            window.originalDrawAll = drawAll;

            // Override drawAll to include background
            window.drawAll = () => {
                this.drawBackground();
                window.originalDrawAll();
            };
        }

        // Force redraw
        if (typeof drawAll === 'function') {
            drawAll();
        }
    }

    drawBackground() {
        const canvas = document.getElementById('canvas-editor');
        const ctx = canvas.getContext('2d');

        // Define world bounds
        const worldBounds = {
            topLeft: { x: -640, y: -640 },
            bottomRight: { x: 640, y: 640 }
        };

        // Convert to screen coordinates
        const screenBounds = {
            topLeft: worldToScreen(worldBounds.topLeft.x, worldBounds.topLeft.y),
            bottomRight: worldToScreen(worldBounds.bottomRight.x, worldBounds.bottomRight.y)
        };

        // Fill the entire canvas with the default background color first
        ctx.fillStyle = '#222222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Create VERTICAL gradient (top to bottom)
        // Use center X coordinate to make it vertical
        const centerX = (screenBounds.topLeft.x + screenBounds.bottomRight.x) / 2;

        const gradient = ctx.createLinearGradient(
            centerX, screenBounds.topLeft.y,
            centerX, screenBounds.bottomRight.y
        );

        // Add color stops with proper alpha conversion
        const topColor = `rgba(${this.mapSettings.bgColorTop.red}, ${this.mapSettings.bgColorTop.green}, ${this.mapSettings.bgColorTop.blue}, ${this.mapSettings.bgColorTop.alpha / 255})`;
        const bottomColor = `rgba(${this.mapSettings.bgColorBottom.red}, ${this.mapSettings.bgColorBottom.green}, ${this.mapSettings.bgColorBottom.blue}, ${this.mapSettings.bgColorBottom.alpha / 255})`;

        gradient.addColorStop(0, topColor);
        gradient.addColorStop(1, bottomColor);

        // Calculate width and height in screen coordinates
        const width = screenBounds.bottomRight.x - screenBounds.topLeft.x;
        const height = screenBounds.bottomRight.y - screenBounds.topLeft.y;

        // Only fill the bounded rectangle with the gradient
        ctx.fillStyle = gradient;
        ctx.fillRect(screenBounds.topLeft.x, screenBounds.topLeft.y, width, height);
    }



    getSettingsData() {
        return {
            name: this.mapSettings.name,
            bgColorTop: { ...this.mapSettings.bgColorTop },
            bgColorBottom: { ...this.mapSettings.bgColorBottom },
            weatherType: this.mapSettings.weatherType,
            stepsType: this.mapSettings.stepsType
        };
    }

    loadSettingsData(data) {
        if (!data) return;

        this.mapSettings.name = data.name || "New Map";

        if (data.bgColorTop) {
            this.mapSettings.bgColorTop = { ...data.bgColorTop };
        }

        if (data.bgColorBottom) {
            this.mapSettings.bgColorBottom = { ...data.bgColorBottom };
        }

        this.mapSettings.weatherType = data.weatherType || 0;
        this.mapSettings.stepsType = data.stepsType || 0;

        this.updateUIFromSettings();
        this.applyBackgroundGradient();
    }
}

// Initialize the settings manager when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();

    // Force a redraw to ensure gradient appears
    if (typeof drawAll === 'function') {
        drawAll();
    }
});
