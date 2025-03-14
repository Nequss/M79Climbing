// Canvas setup
const canvas = document.getElementById('canvas-editor');
const ctx = canvas.getContext('2d');
const infoPanel = document.getElementById('info-panel');
const polyPanel = document.getElementById('poly-panel');
const clearBtn = document.getElementById('clear-btn');
const undoBtn = document.getElementById('undo-btn');
const triangleTypeSelect = document.getElementById('triangle-type');
const triangleColorInput = document.getElementById('triangle-color');
const vertexCoordinates = document.getElementById('vertex-coordinates');
const spawnPointBtn = document.getElementById('spawnpoint-btn');
const redFlagBtn = document.getElementById('red-flag-btn');
const blueFlagBtn = document.getElementById('blue-flag-btn');

document.getElementById('red-flag-btn').addEventListener('click', () => {
    currentMode = "redFlag";
    canvas.style.cursor = "crosshair";
});

document.getElementById('blue-flag-btn').addEventListener('click', () => {
    currentMode = "blueFlag";
    canvas.style.cursor = "crosshair";
});

// Define polygon types based on the enum
const POLY_TYPES = [
    "ptNORMAL",
    "ptONLY_BULLETS_COLLIDE",
    "ptONLY_PLAYERS_COLLIDE",
    "ptNO_COLLIDE",
    "ptICE",
    "ptDEADLY",
    "ptBLOODY_DEADLY",
    "ptHURTS",
    "ptREGENERATES",
    "ptLAVA",
    "ptALPHABULLETS",
    "ptALPHAPLAYERS",
    "ptBRAVOBULLETS",
    "ptBRAVOPLAYERS",
    "ptCHARLIEBULLETS",
    "ptCHARLIEPLAYERS",
    "ptDELTABULLETS",
    "ptDELTAPLAYERS",
    "ptBOUNCY",
    "ptEXPLOSIVE",
    "ptHURTFLAGGERS",
    "ptFLAGGERCOLLIDES",
    "ptNONFLAGGERCOLLIDES",
    "ptFLAGCOLLIDES"
];

// State variables
let triangles = []; // Array of triangles, each with points, type, and color
let currentPoints = []; // Points of the triangle being drawn
let isDragging = false;
let lastMousePos = { x: 0, y: 0 };
let selectedVertex = null;
let selectedTriangleIndex = -1;
let selectedVertexIndex = -1;
let vertexDragThreshold = 10;
let vertexWasDragged = false;
let selectedTriangle = null;
let isMovingTriangle = false;
let spawnPoint = null;     // Single spawn point
let redFlag = null;        // Single red flag
let blueFlag = null;       // Single blue flag
let currentMode = "triangle"; // Default mode
const iconSize = 20;       // Size in pixels when drawn at zoom level 1
let isShiftPressed = false;
let isCtrlPressed = false; 
const gridSize = 50;

// View transformation
let offset = { x: 0, y: 0 }; // Pan offset
let zoomLevel = 1.0; // Zoom level
const MAX_ZOOM = 10;
const MIN_ZOOM = 0.1;


// Initialize the UI
function initializeUI() {
    // Populate the triangle type dropdown
    POLY_TYPES.forEach((type, index) => {
        const option = document.createElement('option');
        option.gridSize = 5;
        option.value = index;
        option.textContent = type;

        triangleTypeSelect.appendChild(option);
    });

    // Set up event listeners for property changes
    triangleTypeSelect.addEventListener('change', () => {
        if (selectedTriangle !== null) {
            triangles[selectedTriangle].type = POLY_TYPES[triangleTypeSelect.value];
            drawAll();
        }
    });

    triangleColorInput.addEventListener('input', () => {
        if (selectedTriangle !== null) {
            triangles[selectedTriangle].color = triangleColorInput.value;
            drawAll();
        }
    });
}

// Update poly panel with selected triangle properties
function updatePolyPanel() {
    if (selectedTriangle !== null) {
        polyPanel.style.display = 'block';
        polyPanel.style.borderColor = 'transparent';

        // Update type dropdown
        const typeIndex = POLY_TYPES.indexOf(triangles[selectedTriangle].type);
        triangleTypeSelect.value = typeIndex;

        // Update color input
        triangleColorInput.value = triangles[selectedTriangle].color;

        // Update vertex coordinates
        let coordsHTML = '';
        triangles[selectedTriangle].points.forEach((point, index) => {
            coordsHTML += `<div>Vertex ${index + 1}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})</div>`;
        });
        vertexCoordinates.innerHTML = coordsHTML;
    } else {
        polyPanel.style.display = 'none';
    }
}

// Transform from screen coordinates to world coordinates
function screenToWorld(screenX, screenY) {
    return {
        x: (screenX - offset.x) / zoomLevel,
        y: (screenY - offset.y) / zoomLevel
    };
}

// Transform from world coordinates to screen coordinates
function worldToScreen(worldX, worldY) {
    return {
        x: worldX * zoomLevel + offset.x,
        y: worldY * zoomLevel + offset.y
    };
}

// Draw grid for reference
function drawGrid() {
    const gridColor = '#444444';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;

    // Calculate visible grid bounds
    const worldTopLeft = screenToWorld(0, 0);
    const worldBottomRight = screenToWorld(canvas.width, canvas.height);

    const startX = Math.floor(worldTopLeft.x / gridSize) * gridSize;
    const startY = Math.floor(worldTopLeft.y / gridSize) * gridSize;
    const endX = Math.ceil(worldBottomRight.x / gridSize) * gridSize;
    const endY = Math.ceil(worldBottomRight.y / gridSize) * gridSize;

    // Draw vertical lines
    for (let x = startX; x <= endX; x += gridSize) {
        const screenPos = worldToScreen(x, 0);
        ctx.beginPath();
        ctx.moveTo(screenPos.x, 0);
        ctx.lineTo(screenPos.x, canvas.height);
        ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = startY; y <= endY; y += gridSize) {
        const screenPos = worldToScreen(0, y);
        ctx.beginPath();
        ctx.moveTo(0, screenPos.y);
        ctx.lineTo(canvas.width, screenPos.y);
        ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;

    // X-axis
    const originY = worldToScreen(0, 0).y;
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(canvas.width, originY);
    ctx.stroke();

    // Y-axis
    const originX = worldToScreen(0, 0).x;
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, canvas.height);
    ctx.stroke();
}

// Draw a single triangle
function drawTriangle(triangle, triangleIndex) {
    if (triangle.points.length < 3) return;

    const screenPoints = triangle.points.map(p => worldToScreen(p.x, p.y));

    ctx.beginPath();
    ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
    ctx.lineTo(screenPoints[1].x, screenPoints[1].y);
    ctx.lineTo(screenPoints[2].x, screenPoints[2].y);
    ctx.closePath();

    // Fill with triangle color, with additional highlighting if selected
    const isSelected = (triangleIndex === selectedTriangle);

    // Apply 50% opacity for fill
    const baseColor = triangle.color || '#64c8ff';
    const rgbMatch = baseColor.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);

    if (rgbMatch) {
        const r = parseInt(rgbMatch[1], 16);
        const g = parseInt(rgbMatch[2], 16);
        const b = parseInt(rgbMatch[3], 16);

        ctx.fillStyle = isSelected
            ? `rgba(${r}, ${g}, ${b}, 0.7)` // More opaque when selected
            : `rgba(${r}, ${g}, ${b}, 0.5)`; // Normal opacity
    } else {
        ctx.fillStyle = isSelected ? 'rgba(100, 200, 255, 0.7)' : 'rgba(100, 200, 255, 0.5)';
    }

    ctx.fill();

    // Highlight the selected triangle with a different border
    if (isSelected) {
        ctx.strokeStyle = '#FFCC00'; // Bright yellow for selected
        ctx.lineWidth = 3;
    } else {
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 2;
    }
    ctx.stroke();

    // Draw vertices
    screenPoints.forEach((p, i) => {
        // Vertex colors based on selection status
        const isVertexSelected = (triangleIndex === selectedTriangleIndex && i === selectedVertexIndex);

        ctx.fillStyle = isVertexSelected ? 'yellow' :
            (i === 0 ? 'red' : (i === 1 ? 'green' : 'blue'));

        ctx.beginPath();
        ctx.arc(p.x, p.y, isVertexSelected ? 6 : 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw current points (incomplete triangle)
function drawCurrentPoints() {
    if (currentPoints.length === 0) return;

    const screenPoints = currentPoints.map(p => worldToScreen(p.x, p.y));

    // Draw lines between existing points
    if (currentPoints.length > 1) {
        ctx.beginPath();
        ctx.moveTo(screenPoints[0].x, screenPoints[0].y);

        for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
        }

        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    // Draw vertices
    screenPoints.forEach((p, i) => {
        ctx.fillStyle = i === 0 ? 'red' : (i === 1 ? 'green' : 'blue');
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Draw everything
function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Check if we have a custom background drawer - removed alpha check
    if (window.settingsManager &&
        typeof window.settingsManager.drawBackground === 'function') {
        // Always draw the background using the settings manager
        window.settingsManager.drawBackground();
    } else {
        // Draw default background if no custom background
        ctx.fillStyle = '#222222';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw grid
    drawGrid();

    // Draw completed triangles
    triangles.forEach((triangle, index) => drawTriangle(triangle, index));

    // Draw current in-progress triangle
    drawCurrentPoints();

    // Draw single special objects
    drawSpawnPoint();
    if (redFlag) drawFlag(redFlag, "#dc3545");
    if (blueFlag) drawFlag(blueFlag, "#0d6efd");

    // Update poly panel if a triangle is selected
    updatePolyPanel();
}

// Check if a point is inside a triangle
function isPointInTriangle(px, py, triangle) {
    const p1 = triangle.points[0];
    const p2 = triangle.points[1];
    const p3 = triangle.points[2];

    // Calculate area of the full triangle
    const areaOrig = Math.abs((p2.x - p1.x) * (p3.y - p1.y) - (p3.x - p1.x) * (p2.y - p1.y)) / 2;

    // Calculate areas of three triangles made between the point and each side
    const area1 = Math.abs((p1.x - px) * (p2.y - py) - (p2.x - px) * (p1.y - py)) / 2;
    const area2 = Math.abs((p2.x - px) * (p3.y - py) - (p3.x - px) * (p2.y - py)) / 2;
    const area3 = Math.abs((p3.x - px) * (p1.y - py) - (p1.x - px) * (p3.y - py)) / 2;

    // Check if sum of the three areas equals the original triangle area
    const epsilon = 0.00001; // Small value to account for floating point precision
    return Math.abs(area1 + area2 + area3 - areaOrig) < epsilon;
}

// Find triangle under cursor
function findTriangleUnderCursor(mouseX, mouseY) {
    const worldPos = screenToWorld(mouseX, mouseY);

    // Check completed triangles (from top to bottom in z-order)
    for (let i = triangles.length - 1; i >= 0; i--) {
        if (isPointInTriangle(worldPos.x, worldPos.y, triangles[i])) {
            return {
                found: true,
                triangleIndex: i
            };
        }
    }

    return { found: false };
}

// Find closest vertex
function findClosestVertex(mouseX, mouseY) {
    const worldPos = screenToWorld(mouseX, mouseY);
    let closestDist = vertexDragThreshold / zoomLevel;
    let result = { found: false };

    // Check completed triangles
    for (let i = 0; i < triangles.length; i++) {
        for (let j = 0; j < 3; j++) {
            const vertex = triangles[i].points[j];
            const dx = vertex.x - worldPos.x;
            const dy = vertex.y - worldPos.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist) {
                closestDist = dist;
                result = {
                    found: true,
                    triangleIndex: i,
                    vertexIndex: j,
                    vertex: vertex
                };
            }
        }
    }

    // Check current points
    for (let j = 0; j < currentPoints.length; j++) {
        const vertex = currentPoints[j];
        const dx = vertex.x - worldPos.x;
        const dy = vertex.y - worldPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < closestDist) {
            closestDist = dist;
            result = {
                found: true,
                triangleIndex: -1,
                vertexIndex: j,
                vertex: vertex
            };
        }
    }

    return result;
}

// Update info panel with cursor position and zoom level
function updateInfoPanel(mouseX, mouseY) {
    const worldPos = screenToWorld(mouseX, mouseY);
    infoPanel.innerHTML = `Cursor: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)})<br>Zoom: ${zoomLevel.toFixed(2)}x`;
}

// Resize canvas to full window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawAll();
}

// Select a triangle
function selectTriangle(index) {
    selectedTriangle = index;
    updatePolyPanel();
    drawAll();
}

// Deselect current triangle
function deselectTriangle() {
    selectedTriangle = null;
    updatePolyPanel();
    drawAll();
}

// Fixed spawn point drawing function
function drawSpawnPoint() {
    if (!spawnPoint) return;

    const screenPos = worldToScreen(spawnPoint.x, spawnPoint.y);
    const radius = 15 * zoomLevel;

    // Draw outer circle
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(40, 167, 69, 0.6)';
    ctx.fill();
    ctx.strokeStyle = '#28a745';
    ctx.lineWidth = zoomLevel;
    ctx.stroke();

    // Draw inner circle
    ctx.beginPath();
    ctx.arc(screenPos.x, screenPos.y, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = '#28a745';
    ctx.fill();
}

function drawFlag(point, color) {
    if (!point) return;

    const screenPos = worldToScreen(point.x, point.y);
    const size = iconSize * zoomLevel;

    // Flag pole
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2 * zoomLevel;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y - size);
    ctx.lineTo(screenPos.x, screenPos.y + size / 2);
    ctx.stroke();

    // Flag
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(screenPos.x, screenPos.y - size);
    ctx.lineTo(screenPos.x + size, screenPos.y - size / 2);
    ctx.lineTo(screenPos.x, screenPos.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Function to snap vertices to the closest edges of other triangles
function snapToClosestEdge() {
    if (selectedTriangle === null) return;

    // If we're dragging a vertex, snap that vertex
    if (selectedVertex && selectedTriangleIndex === selectedTriangle && selectedVertexIndex !== -1) {
        snapVertexToClosestEdge(selectedTriangle, selectedVertexIndex);
    }
    // If we're moving the whole triangle, try to snap each vertex
    else if (isMovingTriangle) {
        // Try to snap each vertex of the selected triangle
        for (let i = 0; i < 3; i++) {
            snapVertexToClosestEdge(selectedTriangle, i);
        }
    }

    drawAll(); // Redraw to show snapped positions
}

// Function to snap vertices to the closest edges of other triangles
function snapToClosestEdge() {
    if (selectedTriangle === null) return;

    // If we're dragging a vertex, snap that vertex
    if (selectedVertex && selectedTriangleIndex === selectedTriangle && selectedVertexIndex !== -1) {
        snapVertexToClosestEdge(selectedTriangle, selectedVertexIndex);
    }
    // If we're moving the whole triangle, try to snap each vertex
    else if (isMovingTriangle) {
        // Try to snap each vertex of the selected triangle
        for (let i = 0; i < 3; i++) {
            snapVertexToClosestEdge(selectedTriangle, i);
        }
    }

    drawAll(); // Redraw to show snapped positions
}

// Function to snap a specific vertex to the closest edge
function snapVertexToClosestEdge(triangleIndex, vertexIndex) {
    const vertex = triangles[triangleIndex].points[vertexIndex];
    const snapThreshold = 15 / zoomLevel; // Adjust this value for snap sensitivity

    let closestDist = snapThreshold;
    let snapPoint = null;

    // Check each triangle except the selected one
    for (let i = 0; i < triangles.length; i++) {
        if (i === triangleIndex) continue;

        const triangle = triangles[i];

        // Check each edge of the triangle
        for (let j = 0; j < 3; j++) {
            const pointA = triangle.points[j];
            const pointB = triangle.points[(j + 1) % 3];

            // Find the closest point on this edge to our vertex
            const closest = closestPointOnLineSegment(pointA, pointB, vertex);
            const dx = closest.x - vertex.x;
            const dy = closest.y - vertex.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < closestDist) {
                closestDist = dist;
                snapPoint = closest;
            }
        }
    }

    // If we found a point to snap to, update the vertex position
    if (snapPoint) {
        vertex.x = snapPoint.x;
        vertex.y = snapPoint.y;
    }
}

// Helper function to find the closest point on a line segment to a given point
function closestPointOnLineSegment(a, b, p) {
    const ax_bx = b.x - a.x;
    const ay_by = b.y - a.y;

    // If segment is just a point, return that point
    if (ax_bx === 0 && ay_by === 0) return { x: a.x, y: a.y };

    // Calculate projection of point p onto line segment
    const t = ((p.x - a.x) * ax_bx + (p.y - a.y) * ay_by) / (ax_bx * ax_bx + ay_by * ay_by);

    // Constrain to segment
    const t_clamped = Math.max(0, Math.min(1, t));

    return {
        x: a.x + t_clamped * ax_bx,
        y: a.y + t_clamped * ay_by
    };
}

// Function to snap a point to the grid
function snapPointToGrid(point) {
    if (!point) return point;

    point.x = Math.round(point.x / gridSize) * gridSize;  // Use lowercase gridSize
    point.y = Math.round(point.y / gridSize) * gridSize;  // Use lowercase gridSize
    return point;
}


// Function to snap selected vertex or triangle to grid
function snapToGrid() {
    // Only apply grid snapping when a vertex is selected
    if (!selectedVertex) return;

    if (selectedTriangleIndex === -1) {
        // Current point being placed
        snapPointToGrid(currentPoints[selectedVertexIndex]);
    } else {
        // Vertex of existing triangle
        snapPointToGrid(triangles[selectedTriangleIndex].points[selectedVertexIndex]);
    }

    drawAll();
}

// Function to calculate the center of a triangle
function getTriangleCenter(triangle) {
    const x = (triangle.points[0].x + triangle.points[1].x + triangle.points[2].x) / 3;
    const y = (triangle.points[0].y + triangle.points[1].y + triangle.points[2].y) / 3;
    return { x, y };
}

// Function to rotate a point around a center point
function rotatePointAroundCenter(point, center, angle) {
    // Translate point to origin
    const translatedX = point.x - center.x;
    const translatedY = point.y - center.y;

    // Rotate point
    const rotatedX = translatedX * Math.cos(angle) - translatedY * Math.sin(angle);
    const rotatedY = translatedX * Math.sin(angle) + translatedY * Math.cos(angle);

    // Translate back
    return {
        x: rotatedX + center.x,
        y: rotatedY + center.y
    };
}

// Function to rotate a triangle
// Make sure this method updates the rotation value in the texture object
function rotateTriangle(triangleIndex, angle) {
    const triangle = triangles[triangleIndex];
    if (!triangle) return;

    const center = getTriangleCenter(triangle);

    // Rotate each vertex
    for (let i = 0; i < 3; i++) {
        const rotated = rotatePointAroundCenter(triangle.points[i], center, angle);
        triangle.points[i].x = rotated.x;
        triangle.points[i].y = rotated.y;
    }

    // If the triangle has texture, update its rotation value too
    if (triangle.texture) {
        // Update the stored rotation value (convert radians to degrees)
        triangle.texture.rotation = (triangle.texture.rotation || 0) + (angle * 180 / Math.PI);

        // Calculate center of texture coordinates
        const textureCenterU = (triangle.points[0].TU + triangle.points[1].TU + triangle.points[2].TU) / 3;
        const textureCenterV = (triangle.points[0].TV + triangle.points[1].TV + triangle.points[2].TV) / 3;
        const textureCenter = { x: textureCenterU, y: textureCenterV };

        // Rotate texture coordinates
        for (let i = 0; i < 3; i++) {
            if (triangle.points[i].TU !== undefined && triangle.points[i].TV !== undefined) {
                const texturePoint = { x: triangle.points[i].TU, y: triangle.points[i].TV };
                const rotatedTexture = rotatePointAroundCenter(texturePoint, textureCenter, angle);
                triangle.points[i].TU = rotatedTexture.x;
                triangle.points[i].TV = rotatedTexture.y;
            }
        }

        // If textureManager is available, update its controls
        if (window.textureManager && triangle === window.textureManager.selectedTriangle) {
            window.textureManager.updateControlsFromTriangle(triangle);
        }
    }

    drawAll();
}


// Event handlers
canvas.addEventListener('click', (e) => {
    // Don't add a new point if we were just dragging
    if (vertexWasDragged) {
        vertexWasDragged = false;
        return;
    }

    // Don't add point if we're in the middle of panning
    if (isDragging) return;

    const worldPos = screenToWorld(e.clientX, e.clientY);

    // Handle special placement modes
    if (currentMode === "spawn") {
        spawnPoint = worldPos;  // Replace existing spawn point
        currentMode = "triangle";
        canvas.style.cursor = "default";
        drawAll();
        return;
    } else if (currentMode === "redFlag") {
        redFlag = worldPos;  // Replace existing red flag
        currentMode = "triangle";
        canvas.style.cursor = "default";
        drawAll();
        return;
    } else if (currentMode === "blueFlag") {
        blueFlag = worldPos;  // Replace existing blue flag
        currentMode = "triangle";
        canvas.style.cursor = "default";
        drawAll();
        return;
    }

    // Check if we clicked on an existing triangle
    const triangleResult = findTriangleUnderCursor(e.clientX, e.clientY);
    if (triangleResult.found) {
        selectTriangle(triangleResult.triangleIndex);
        return;
    }

    // Add point for a new triangle
    currentPoints.push(worldPos);

    if (currentPoints.length === 3) {
        // Create new triangle with default properties
        triangles.push({
            points: [...currentPoints],
            type: POLY_TYPES[0], // Default to ptNORMAL
            color: triangleColorInput.value // Use current color
        });
        currentPoints = [];
    }

    drawAll();
});

canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2) { // Middle or right button
        isDragging = true;
        lastMousePos = { x: e.clientX, y: e.clientY };
        return;
    }

    // Left button - check for vertex selection first, then triangle
    if (e.button === 0) {
        const vertexResult = findClosestVertex(e.clientX, e.clientY);

        if (vertexResult.found) {
            // Handle vertex selection
            selectedVertex = vertexResult.vertex;
            selectedTriangleIndex = vertexResult.triangleIndex;
            selectedVertexIndex = vertexResult.vertexIndex;

            // If this is part of a triangle, select that triangle too
            if (selectedTriangleIndex >= 0) {
                selectTriangle(selectedTriangleIndex);
            }

            isDragging = true;
            vertexWasDragged = false;
            lastMousePos = { x: e.clientX, y: e.clientY };
            e.preventDefault();
            return;
        }

        // If no vertex was selected, check for triangle selection
        const triangleResult = findTriangleUnderCursor(e.clientX, e.clientY);
        if (triangleResult.found) {
            selectTriangle(triangleResult.triangleIndex);
            isMovingTriangle = true;
            isDragging = true;
            vertexWasDragged = false;
            lastMousePos = { x: e.clientX, y: e.clientY };
            e.preventDefault();
            return;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    updateInfoPanel(e.clientX, e.clientY);

    if (isDragging) {
        if (selectedVertex) {
            // We're dragging a vertex
            const worldPos = screenToWorld(e.clientX, e.clientY);

            // Apply snapping if Ctrl is pressed
            if (isCtrlPressed) {
                // Create a temporary point that we'll snap to grid
                const snappedPos = { x: worldPos.x, y: worldPos.y };
                snapPointToGrid(snappedPos);

                if (selectedTriangleIndex === -1) {
                    currentPoints[selectedVertexIndex].x = snappedPos.x;
                    currentPoints[selectedVertexIndex].y = snappedPos.y;
                } else {
                    triangles[selectedTriangleIndex].points[selectedVertexIndex].x = snappedPos.x;
                    triangles[selectedTriangleIndex].points[selectedVertexIndex].y = snappedPos.y;
                }
            } else {
                // Normal behavior without snapping
                if (selectedTriangleIndex === -1) {
                    currentPoints[selectedVertexIndex].x = worldPos.x;
                    currentPoints[selectedVertexIndex].y = worldPos.y;
                } else {
                    triangles[selectedTriangleIndex].points[selectedVertexIndex].x = worldPos.x;
                    triangles[selectedTriangleIndex].points[selectedVertexIndex].y = worldPos.y;

                    // Apply edge snapping if Shift is pressed
                    if (isShiftPressed) {
                        snapVertexToClosestEdge(selectedTriangleIndex, selectedVertexIndex);
                    }
                }
            }

            vertexWasDragged = true;
        } else if (isMovingTriangle && selectedTriangle !== null) {
            // We're moving an entire triangle
            const dx = (e.clientX - lastMousePos.x) / zoomLevel;
            const dy = (e.clientY - lastMousePos.y) / zoomLevel;

            // Move all three vertices of the triangle
            const triangle = triangles[selectedTriangle];

            // Store original texture coordinates if the triangle has a texture
            const originalTU = triangle.points.map(p => p.TU);
            const originalTV = triangle.points.map(p => p.TV);

            for (let i = 0; i < 3; i++) {
                triangle.points[i].x += dx;
                triangle.points[i].y += dy;

                // Restore original texture coordinates if they exist
                if (triangle.texture && originalTU[i] !== undefined) {
                    triangle.points[i].TU = originalTU[i];
                    triangle.points[i].TV = originalTV[i];
                }
            }

            // Apply snapping - prioritize shift (edge) over ctrl (grid)
            if (isShiftPressed) {
                snapToClosestEdge();
            }

            vertexWasDragged = true;
        } else {
            // Regular panning
            offset.x += e.clientX - lastMousePos.x;
            offset.y += e.clientY - lastMousePos.y;
        }

        drawAll();
    }

    lastMousePos = { x: e.clientX, y: e.clientY };
});


canvas.addEventListener('mouseup', () => {
    isDragging = false;
    selectedVertex = null;
    selectedTriangleIndex = -1;
    selectedVertexIndex = -1;
    isMovingTriangle = false;
    // Keep vertexWasDragged - we'll reset it after the click event
});

canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();

    const worldPos = screenToWorld(e.clientX, e.clientY);
    const deleteRadius = 20 / zoomLevel;

    // Check for special objects to delete
    if (spawnPoint) {
        const dx = spawnPoint.x - worldPos.x;
        const dy = spawnPoint.y - worldPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < deleteRadius) {
            spawnPoint = null;
            drawAll();
            return;
        }
    }

    // Find which triangle was clicked
    const triangleResult = findTriangleUnderCursor(e.clientX, e.clientY);

    if (triangleResult.found) {
        // Remove the triangle from the array
        triangles.splice(triangleResult.triangleIndex, 1);

        // If we deleted the selected triangle, deselect it
        if (selectedTriangle === triangleResult.triangleIndex) {
            deselectTriangle();
        } else if (selectedTriangle > triangleResult.triangleIndex) {
            // Adjust selection index for the removed triangle
            selectedTriangle--;
        }

        // Redraw the canvas
        drawAll();
    } else {
        // Right click on empty space - deselect current triangle
        deselectTriangle();
    }
});

canvas.addEventListener('wheel', (e) => {
    e.preventDefault();

    // If Alt key is pressed and a triangle is selected, ONLY rotate (no zooming)
    if (e.altKey && selectedTriangle !== null) {
        // Calculate rotation amount based on wheel delta
        const rotationAmount = e.deltaY > 0 ? -0.05 : 0.05; // radians
        rotateTriangle(selectedTriangle, rotationAmount);
        return; // Important: exit early to prevent zooming when rotating
    }

    // Only perform zooming when Alt is NOT pressed
    const worldPosBeforeZoom = screenToWorld(e.clientX, e.clientY);
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    zoomLevel = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoomLevel * zoomFactor));
    const screenPosAfterZoom = worldToScreen(worldPosBeforeZoom.x, worldPosBeforeZoom.y);
    offset.x += e.clientX - screenPosAfterZoom.x;
    offset.y += e.clientY - screenPosAfterZoom.y;
    updateInfoPanel(e.clientX, e.clientY);
    drawAll();
});



// Clear button
clearBtn.addEventListener('click', () => {
    triangles = [];
    currentPoints = [];
    spawnPoint = null;
    redFlag = null;
    blueFlag = null;
    deselectTriangle();
    drawAll();
});

// Undo button
undoBtn.addEventListener('click', () => {
    if (currentPoints.length > 0) {
        currentPoints.pop();
    } else if (blueFlag) {
        blueFlag = null;
    } else if (redFlag) {
        redFlag = null;
    } else if (spawnPoint) {
        spawnPoint = null;
    } else if (triangles.length > 0) {
        triangles.pop();
        if (selectedTriangle === triangles.length) {
            deselectTriangle();
        }
    }
    drawAll();
});

// Shift event listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        isShiftPressed = true;
        if (selectedTriangle !== null) {
            snapToClosestEdge();
        }
    }

    if (e.key === 'Control') {
        isCtrlPressed = true;
        if (selectedVertex) {  // Only snap if a vertex is selected
            snapToGrid();
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift') {
        isShiftPressed = false;
    }

    if (e.key === 'Control') {
        isCtrlPressed = false;
    }
});

spawnPointBtn.addEventListener('click', () => {
    currentMode = "spawn";
});

redFlagBtn.addEventListener('click', () => {
    currentMode = "redFlag";
});

blueFlagBtn.addEventListener('click', () => {
    currentMode = "blueFlag";
});

// Initialize the application
function init() {
    initializeUI();
    resizeCanvas();

    // Center
    offset.x = canvas.width / 2;
    offset.y = canvas.height / 2;

    window.addEventListener('resize', resizeCanvas);
    drawAll();
}

// Initialize the drawing
init();