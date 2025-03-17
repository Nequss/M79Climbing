// help-manager.js - Manages the help panel with information about editor features

class HelpManager {
    constructor() {
        this.helpPanel = document.getElementById('help-panel');
        this.helpButton = document.getElementById('help-btn');

        this.init();
    }

    init() {
        if (!this.helpPanel || !this.helpButton) {
            console.error("Help panel or button not found");
            return;
        }

        // Set up event listeners for the help button
        this.helpButton.addEventListener('click', () => this.toggleHelpPanel());

        // Close help panel when clicking on canvas
        const canvas = document.getElementById('canvas-editor');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                // Check if clicking on empty area
                if (typeof findTriangleUnderCursor === 'function') {
                    const triangleResult = findTriangleUnderCursor(e.clientX, e.clientY);
                    if (!triangleResult.found) {
                        this.closeHelpPanel();
                    }
                }
            });

            // Close panel when right-clicking anywhere
            canvas.addEventListener('contextmenu', (e) => {
                this.closeHelpPanel();
            });
        }

        // Escape key to close the panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.helpPanel.style.display === 'block') {
                this.closeHelpPanel();
                e.preventDefault();
            }
        });

        console.log("Help Manager initialized");
    }

    toggleHelpPanel() {
        // Toggle help panel visibility
        if (this.helpPanel.style.display === 'none' || !this.helpPanel.style.display) {
            this.helpPanel.style.display = 'block';

            // Close other open panels when help is opened
            const settingsPanel = document.getElementById('settings-panel');
            if (settingsPanel) {
                settingsPanel.style.display = 'none';
            }

            const polyPanel = document.getElementById('poly-panel');
            if (polyPanel) {
                polyPanel.dataset.prevDisplay = polyPanel.style.display;
                polyPanel.style.display = 'none';
            }
        } else {
            this.closeHelpPanel();
        }
    }

    closeHelpPanel() {
        if (this.helpPanel) {
            this.helpPanel.style.display = 'none';

            // Restore poly panel if it was previously shown
            const polyPanel = document.getElementById('poly-panel');
            if (polyPanel && polyPanel.dataset.prevDisplay === 'block') {
                polyPanel.style.display = 'block';
                delete polyPanel.dataset.prevDisplay;
            }
        }
    }
}

// Initialize help manager when the page loads
document.addEventListener('DOMContentLoaded', function () {
    window.helpManager = new HelpManager();
});
