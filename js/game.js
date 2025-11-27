/**
 * Dog Rescue Puzzle - Main Game Controller
 * Handles game flow, input, and level management
 */

// Game configuration constants
const GAME_CONFIG = {
    VIEWPORT_PADDING_X: 80,      // Horizontal padding for tile size calculation
    VIEWPORT_PADDING_Y: 250,     // Vertical padding for tile size calculation
    MAX_TILE_SIZE: 60,           // Maximum tile size in pixels
    MIN_TILE_SIZE: 40,           // Minimum tile size in pixels
    MAX_UNDO_STACK_SIZE: 50,     // Maximum number of undo states to store
    VICTORY_DELAY_MS: 500        // Delay before showing victory screen
};

// Level definitions embedded in the code
const LEVELS = [
    // Level 1 - Tutorial: Simple red dog rescue
    {
        name: "Level 1",
        width: 6,
        height: 6,
        blocks: [
            {
                id: "r1",
                color: "red",
                required: 1,
                shape: "I",
                coords: [[0, 0], [1, 0], [2, 0], [3, 0]],
                x: 1,
                y: 1,
                rotatable: true
            }
        ],
        dogs: [
            { color: "red", x: 4, y: 4 }
        ],
        walls: []
    },
    // Level 2 - Two colors
    {
        name: "Level 2",
        width: 7,
        height: 7,
        blocks: [
            {
                id: "r1",
                color: "red",
                required: 1,
                shape: "L",
                coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
                x: 1,
                y: 1,
                rotatable: true
            },
            {
                id: "b1",
                color: "blue",
                required: 1,
                shape: "I",
                coords: [[0, 0], [1, 0], [2, 0], [3, 0]],
                x: 2,
                y: 5,
                rotatable: true
            }
        ],
        dogs: [
            { color: "red", x: 5, y: 2 },
            { color: "blue", x: 3, y: 2 }
        ],
        walls: [
            { x: 3, y: 3 }, { x: 4, y: 3 }
        ]
    },
    // Level 3 - More dogs per block
    {
        name: "Level 3",
        width: 8,
        height: 8,
        blocks: [
            {
                id: "g1",
                color: "green",
                required: 2,
                shape: "T",
                coords: [[0, 0], [1, 0], [2, 0], [1, 1]],
                x: 1,
                y: 1,
                rotatable: true
            },
            {
                id: "r1",
                color: "red",
                required: 1,
                shape: "J",
                coords: [[1, 0], [1, 1], [1, 2], [0, 2]],
                x: 5,
                y: 1,
                rotatable: true
            }
        ],
        dogs: [
            { color: "green", x: 3, y: 5 },
            { color: "green", x: 6, y: 3 },
            { color: "red", x: 2, y: 6 }
        ],
        walls: [
            { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 5 }
        ]
    },
    // Level 4 - Tight spaces
    {
        name: "Level 4",
        width: 8,
        height: 8,
        blocks: [
            {
                id: "y1",
                color: "yellow",
                required: 2,
                shape: "L",
                coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
                x: 0,
                y: 0,
                rotatable: true
            },
            {
                id: "b1",
                color: "blue",
                required: 2,
                shape: "T",
                coords: [[0, 0], [1, 0], [2, 0], [1, 1]],
                x: 3,
                y: 0,
                rotatable: true
            }
        ],
        dogs: [
            { color: "yellow", x: 6, y: 1 },
            { color: "yellow", x: 1, y: 6 },
            { color: "blue", x: 6, y: 5 },
            { color: "blue", x: 2, y: 4 }
        ],
        walls: [
            { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
            { x: 3, y: 4 }, { x: 5, y: 4 }
        ]
    },
    // Level 5 - Three colors
    {
        name: "Level 5",
        width: 9,
        height: 9,
        blocks: [
            {
                id: "r1",
                color: "red",
                required: 1,
                shape: "I",
                coords: [[0, 0], [1, 0], [2, 0], [3, 0]],
                x: 0,
                y: 0,
                rotatable: true
            },
            {
                id: "g1",
                color: "green",
                required: 2,
                shape: "L",
                coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
                x: 5,
                y: 0,
                rotatable: true
            },
            {
                id: "b1",
                color: "blue",
                required: 2,
                shape: "J",
                coords: [[1, 0], [1, 1], [1, 2], [0, 2]],
                x: 0,
                y: 5,
                rotatable: true
            }
        ],
        dogs: [
            { color: "red", x: 7, y: 7 },
            { color: "green", x: 3, y: 4 },
            { color: "green", x: 7, y: 4 },
            { color: "blue", x: 4, y: 7 },
            { color: "blue", x: 6, y: 2 }
        ],
        walls: [
            { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 4, y: 5 }, { x: 5, y: 5 }
        ]
    },
    // Level 6 - Purple introduction
    {
        name: "Level 6",
        width: 9,
        height: 9,
        blocks: [
            {
                id: "p1",
                color: "purple",
                required: 2,
                shape: "T",
                coords: [[0, 0], [1, 0], [2, 0], [1, 1]],
                x: 0,
                y: 0,
                rotatable: true
            },
            {
                id: "r1",
                color: "red",
                required: 1,
                shape: "L",
                coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
                x: 6,
                y: 0,
                rotatable: true
            },
            {
                id: "y1",
                color: "yellow",
                required: 2,
                shape: "J",
                coords: [[1, 0], [1, 1], [1, 2], [0, 2]],
                x: 0,
                y: 6,
                rotatable: true
            }
        ],
        dogs: [
            { color: "purple", x: 4, y: 2 },
            { color: "purple", x: 7, y: 6 },
            { color: "red", x: 2, y: 4 },
            { color: "yellow", x: 5, y: 7 },
            { color: "yellow", x: 3, y: 6 }
        ],
        walls: [
            { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 5, y: 3 },
            { x: 3, y: 4 }, { x: 5, y: 4 },
            { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 }
        ]
    },
    // Level 7 - Orange blocks
    {
        name: "Level 7",
        width: 10,
        height: 10,
        blocks: [
            {
                id: "o1",
                color: "orange",
                required: 3,
                shape: "I",
                coords: [[0, 0], [1, 0], [2, 0], [3, 0]],
                x: 0,
                y: 0,
                rotatable: true
            },
            {
                id: "b1",
                color: "blue",
                required: 2,
                shape: "T",
                coords: [[0, 0], [1, 0], [2, 0], [1, 1]],
                x: 6,
                y: 0,
                rotatable: true
            },
            {
                id: "g1",
                color: "green",
                required: 1,
                shape: "L",
                coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
                x: 0,
                y: 6,
                rotatable: true
            }
        ],
        dogs: [
            { color: "orange", x: 5, y: 3 },
            { color: "orange", x: 8, y: 5 },
            { color: "orange", x: 3, y: 8 },
            { color: "blue", x: 2, y: 5 },
            { color: "blue", x: 7, y: 8 },
            { color: "green", x: 5, y: 6 }
        ],
        walls: [
            { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
            { x: 4, y: 5 }, { x: 6, y: 5 },
            { x: 4, y: 6 }, { x: 6, y: 6 }
        ]
    },
    // Level 8 - Strategic rotation required
    {
        name: "Level 8",
        width: 10,
        height: 10,
        blocks: [
            {
                id: "r1",
                color: "red",
                required: 2,
                shape: "L",
                coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
                x: 0,
                y: 0,
                rotatable: true
            },
            {
                id: "b1",
                color: "blue",
                required: 2,
                shape: "J",
                coords: [[1, 0], [1, 1], [1, 2], [0, 2]],
                x: 8,
                y: 0,
                rotatable: true
            },
            {
                id: "g1",
                color: "green",
                required: 2,
                shape: "T",
                coords: [[0, 0], [1, 0], [2, 0], [1, 1]],
                x: 3,
                y: 7,
                rotatable: true
            },
            {
                id: "y1",
                color: "yellow",
                required: 1,
                shape: "I",
                coords: [[0, 0], [1, 0], [2, 0], [3, 0]],
                x: 0,
                y: 8,
                rotatable: true
            }
        ],
        dogs: [
            { color: "red", x: 8, y: 7 },
            { color: "red", x: 3, y: 4 },
            { color: "blue", x: 1, y: 5 },
            { color: "blue", x: 6, y: 2 },
            { color: "green", x: 7, y: 5 },
            { color: "green", x: 2, y: 2 },
            { color: "yellow", x: 5, y: 8 }
        ],
        walls: [
            { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 },
            { x: 4, y: 4 }, { x: 6, y: 4 },
            { x: 4, y: 5 }, { x: 5, y: 5 }, { x: 6, y: 5 }
        ]
    },
    // Level 9 - Complex multi-block
    {
        name: "Level 9",
        width: 10,
        height: 10,
        blocks: [
            {
                id: "p1",
                color: "purple",
                required: 2,
                shape: "T",
                coords: [[0, 0], [1, 0], [2, 0], [1, 1]],
                x: 0,
                y: 0,
                rotatable: true
            },
            {
                id: "o1",
                color: "orange",
                required: 2,
                shape: "L",
                coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
                x: 7,
                y: 0,
                rotatable: true
            },
            {
                id: "r1",
                color: "red",
                required: 3,
                shape: "J",
                coords: [[1, 0], [1, 1], [1, 2], [0, 2]],
                x: 0,
                y: 7,
                rotatable: true
            },
            {
                id: "b1",
                color: "blue",
                required: 2,
                shape: "I",
                coords: [[0, 0], [1, 0], [2, 0], [3, 0]],
                x: 5,
                y: 8,
                rotatable: true
            }
        ],
        dogs: [
            { color: "purple", x: 3, y: 2 },
            { color: "purple", x: 8, y: 6 },
            { color: "orange", x: 2, y: 5 },
            { color: "orange", x: 6, y: 4 },
            { color: "red", x: 5, y: 1 },
            { color: "red", x: 8, y: 3 },
            { color: "red", x: 4, y: 6 },
            { color: "blue", x: 3, y: 8 },
            { color: "blue", x: 7, y: 2 }
        ],
        walls: [
            { x: 4, y: 4 }, { x: 5, y: 4 },
            { x: 4, y: 5 }, { x: 5, y: 5 },
            { x: 2, y: 2 }, { x: 7, y: 7 }
        ]
    },
    // Level 10 - Final challenge
    {
        name: "Level 10",
        width: 10,
        height: 10,
        blocks: [
            {
                id: "r1",
                color: "red",
                required: 2,
                shape: "L",
                coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
                x: 0,
                y: 0,
                rotatable: true
            },
            {
                id: "b1",
                color: "blue",
                required: 2,
                shape: "J",
                coords: [[1, 0], [1, 1], [1, 2], [0, 2]],
                x: 8,
                y: 0,
                rotatable: true
            },
            {
                id: "g1",
                color: "green",
                required: 2,
                shape: "T",
                coords: [[0, 0], [1, 0], [2, 0], [1, 1]],
                x: 3,
                y: 0,
                rotatable: true
            },
            {
                id: "y1",
                color: "yellow",
                required: 2,
                shape: "I",
                coords: [[0, 0], [1, 0], [2, 0], [3, 0]],
                x: 0,
                y: 5,
                rotatable: true
            },
            {
                id: "p1",
                color: "purple",
                required: 2,
                shape: "L",
                coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
                x: 6,
                y: 6,
                rotatable: true
            }
        ],
        dogs: [
            { color: "red", x: 8, y: 8 },
            { color: "red", x: 3, y: 5 },
            { color: "blue", x: 1, y: 8 },
            { color: "blue", x: 5, y: 3 },
            { color: "green", x: 7, y: 4 },
            { color: "green", x: 2, y: 7 },
            { color: "yellow", x: 6, y: 2 },
            { color: "yellow", x: 4, y: 8 },
            { color: "purple", x: 1, y: 3 },
            { color: "purple", x: 8, y: 5 }
        ],
        walls: [
            { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 6, y: 4 },
            { x: 4, y: 5 }, { x: 5, y: 5 },
            { x: 4, y: 6 }
        ]
    }
];

/**
 * Main Game Class
 */
class Game {
    constructor() {
        this.board = new Board();
        this.renderer = null;
        this.currentLevel = 0;
        this.undoStack = [];
        this.isDragging = false;
        this.dragX = 0;
        this.dragY = 0;
        this.lastValidGridX = 0;
        this.lastValidGridY = 0;
        this.animationFrame = null;
        
        // DOM Elements
        this.levelSelect = document.getElementById('level-select');
        this.gameScreen = document.getElementById('game-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.levelButtons = document.getElementById('level-buttons');
        this.levelTitle = document.getElementById('level-title');
        this.dogsRemaining = document.getElementById('dogs-remaining');
        this.canvas = document.getElementById('game-board');
    }

    /**
     * Initialize the game
     */
    async init() {
        // Preload all assets
        await ASSETS.preloadAssets();
        
        // Initialize renderer
        this.renderer = new Renderer(this.canvas);
        
        // Create level buttons
        this.createLevelButtons();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show level select
        this.showScreen('level-select');
        
        console.log('Game initialized');
    }

    /**
     * Create level selection buttons
     */
    createLevelButtons() {
        this.levelButtons.innerHTML = '';
        
        for (let i = 0; i < LEVELS.length; i++) {
            const btn = document.createElement('button');
            btn.className = 'level-btn';
            btn.textContent = (i + 1).toString();
            btn.addEventListener('click', () => this.startLevel(i));
            this.levelButtons.appendChild(btn);
        }
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Canvas events for drag and drop
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Double click/tap for rotation
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        
        // UI buttons
        document.getElementById('back-btn').addEventListener('click', () => this.showScreen('level-select'));
        document.getElementById('undo-btn').addEventListener('click', () => this.undo());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetLevel());
        document.getElementById('next-level-btn').addEventListener('click', () => this.nextLevel());
        document.getElementById('replay-btn').addEventListener('click', () => this.resetLevel());
        document.getElementById('levels-btn').addEventListener('click', () => {
            this.hideVictory();
            this.showScreen('level-select');
        });
    }

    /**
     * Show a specific screen
     */
    showScreen(screenId) {
        this.levelSelect.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        
        if (screenId === 'level-select') {
            this.levelSelect.classList.remove('hidden');
        } else if (screenId === 'game') {
            this.gameScreen.classList.remove('hidden');
        }
    }

    /**
     * Start a level
     */
    startLevel(levelIndex) {
        this.currentLevel = levelIndex;
        const levelData = LEVELS[levelIndex];
        
        // Load the level
        this.board.loadLevel(levelData);
        this.renderer.setBoard(this.board);
        
        // Adjust tile size based on board dimensions
        const maxSize = Math.min(
            Math.floor((window.innerWidth - GAME_CONFIG.VIEWPORT_PADDING_X) / this.board.width),
            Math.floor((window.innerHeight - GAME_CONFIG.VIEWPORT_PADDING_Y) / this.board.height),
            GAME_CONFIG.MAX_TILE_SIZE
        );
        this.renderer.setTileSize(Math.max(GAME_CONFIG.MIN_TILE_SIZE, maxSize));
        
        // Clear undo stack
        this.undoStack = [];
        
        // Update UI
        this.levelTitle.textContent = levelData.name;
        this.updateDogsRemaining();
        
        // Show game screen
        this.showScreen('game');
        this.hideVictory();
        
        // Start render loop
        this.startRenderLoop();
    }

    /**
     * Reset current level
     */
    resetLevel() {
        this.hideVictory();
        this.startLevel(this.currentLevel);
    }

    /**
     * Go to next level
     */
    nextLevel() {
        if (this.currentLevel < LEVELS.length - 1) {
            this.hideVictory();
            this.startLevel(this.currentLevel + 1);
        } else {
            this.hideVictory();
            this.showScreen('level-select');
        }
    }

    /**
     * Update dogs remaining display
     */
    updateDogsRemaining() {
        const remaining = this.board.dogManager.countRemaining();
        this.dogsRemaining.textContent = `Dogs remaining: ${remaining}`;
    }

    /**
     * Save state for undo
     */
    saveState() {
        this.undoStack.push(this.board.serialize());
        // Limit undo stack size
        if (this.undoStack.length > GAME_CONFIG.MAX_UNDO_STACK_SIZE) {
            this.undoStack.shift();
        }
    }

    /**
     * Undo last move
     */
    undo() {
        if (this.undoStack.length > 0) {
            const state = this.undoStack.pop();
            this.board.restore(state);
            this.updateDogsRemaining();
        }
    }

    /**
     * Get canvas coordinates from event
     */
    getCanvasCoords(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    /**
     * Handle mouse down
     */
    handleMouseDown(e) {
        const coords = this.getCanvasCoords(e);
        const block = this.renderer.selectBlockAt(coords.x, coords.y);
        
        if (block) {
            this.isDragging = true;
            this.dragX = coords.x;
            this.dragY = coords.y;
            // Track the last valid grid position (starts at block's current position)
            this.lastValidGridX = block.x;
            this.lastValidGridY = block.y;
        }
    }

    /**
     * Handle mouse move
     */
    handleMouseMove(e) {
        if (this.isDragging && this.renderer.getSelectedBlock()) {
            const coords = this.getCanvasCoords(e);
            const block = this.renderer.getSelectedBlock();
            
            // Calculate target grid position
            const targetGridPos = this.renderer.pixelToGrid(
                coords.x - this.renderer.dragOffset.x,
                coords.y - this.renderer.dragOffset.y
            );
            
            // Update the last valid position by following a valid path
            this.updateValidDragPosition(block, targetGridPos.x, targetGridPos.y);
            
            // Update dragX/dragY to render at the constrained position
            this.dragX = this.lastValidGridX * this.renderer.tileSize + this.renderer.dragOffset.x;
            this.dragY = this.lastValidGridY * this.renderer.tileSize + this.renderer.dragOffset.y;
        }
    }

    /**
     * Update the valid drag position by moving step-by-step toward the target
     * This prevents blocks from "jumping" over obstacles
     */
    updateValidDragPosition(block, targetX, targetY) {
        // Move step by step toward target, stopping when we can't move further
        const maxIterations = Math.abs(targetX - this.lastValidGridX) + Math.abs(targetY - this.lastValidGridY) + 1;
        
        for (let i = 0; i < maxIterations; i++) {
            const dx = targetX - this.lastValidGridX;
            const dy = targetY - this.lastValidGridY;
            
            // If we've reached the target, stop
            if (dx === 0 && dy === 0) break;
            
            // Try to move one step closer (prioritize larger delta)
            let nextX = this.lastValidGridX;
            let nextY = this.lastValidGridY;
            
            // Choose the direction to move (move in the direction with larger delta first)
            if (Math.abs(dx) >= Math.abs(dy) && dx !== 0) {
                nextX += (dx > 0 ? 1 : -1);
            } else if (dy !== 0) {
                nextY += (dy > 0 ? 1 : -1);
            }
            
            // Check if we can move to this position
            if (this.board.canBlockMoveTo(block, nextX, nextY)) {
                this.lastValidGridX = nextX;
                this.lastValidGridY = nextY;
            } else {
                // Try moving in the other direction if the first choice was blocked
                nextX = this.lastValidGridX;
                nextY = this.lastValidGridY;
                
                if (Math.abs(dx) >= Math.abs(dy) && dy !== 0) {
                    nextY += (dy > 0 ? 1 : -1);
                } else if (dx !== 0) {
                    nextX += (dx > 0 ? 1 : -1);
                }
                
                if (this.board.canBlockMoveTo(block, nextX, nextY)) {
                    this.lastValidGridX = nextX;
                    this.lastValidGridY = nextY;
                } else {
                    // Can't move in either direction, stop
                    break;
                }
            }
        }
    }

    /**
     * Handle mouse up
     */
    handleMouseUp(e) {
        if (this.isDragging && this.renderer.getSelectedBlock()) {
            this.tryMoveBlock();
        }
        this.isDragging = false;
        this.renderer.deselectBlock();
    }

    /**
     * Handle touch start
     */
    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const coords = this.getCanvasCoords(touch);
            const block = this.renderer.selectBlockAt(coords.x, coords.y);
            
            if (block) {
                this.isDragging = true;
                this.dragX = coords.x;
                this.dragY = coords.y;
                // Track the last valid grid position (starts at block's current position)
                this.lastValidGridX = block.x;
                this.lastValidGridY = block.y;
            }
        }
    }

    /**
     * Handle touch move
     */
    handleTouchMove(e) {
        e.preventDefault();
        if (this.isDragging && e.touches.length === 1 && this.renderer.getSelectedBlock()) {
            const touch = e.touches[0];
            const coords = this.getCanvasCoords(touch);
            const block = this.renderer.getSelectedBlock();
            
            // Calculate target grid position
            const targetGridPos = this.renderer.pixelToGrid(
                coords.x - this.renderer.dragOffset.x,
                coords.y - this.renderer.dragOffset.y
            );
            
            // Update the last valid position by following a valid path
            this.updateValidDragPosition(block, targetGridPos.x, targetGridPos.y);
            
            // Update dragX/dragY to render at the constrained position
            this.dragX = this.lastValidGridX * this.renderer.tileSize + this.renderer.dragOffset.x;
            this.dragY = this.lastValidGridY * this.renderer.tileSize + this.renderer.dragOffset.y;
        }
    }

    /**
     * Handle touch end
     */
    handleTouchEnd(e) {
        e.preventDefault();
        if (this.isDragging && this.renderer.getSelectedBlock()) {
            this.tryMoveBlock();
        }
        this.isDragging = false;
        this.renderer.deselectBlock();
    }

    /**
     * Handle double click (for rotation)
     */
    handleDoubleClick(e) {
        const coords = this.getCanvasCoords(e);
        const gridPos = this.renderer.pixelToGrid(coords.x, coords.y);
        const block = this.board.getBlockAt(gridPos.x, gridPos.y);
        
        if (block && this.board.canBlockRotate(block)) {
            this.saveState();
            const result = this.board.rotateBlock(block);
            
            if (result.success) {
                // Handle rescues from rotation
                for (const dog of result.rescuedDogs) {
                    this.renderer.addRescueAnimation(dog);
                }
                if (result.blockDisappeared) {
                    this.renderer.addBlockDisappearAnimation(block);
                }
                this.updateDogsRemaining();
                this.checkWinCondition();
            }
        }
    }

    /**
     * Try to move the selected block to drag position
     */
    tryMoveBlock() {
        const block = this.renderer.getSelectedBlock();
        if (!block) return;
        
        // Use the last valid grid position (constrained by path-finding during drag)
        const gridX = this.lastValidGridX;
        const gridY = this.lastValidGridY;
        
        // Only save state if position actually changes
        if (gridX !== block.x || gridY !== block.y) {
            if (this.board.canBlockMoveTo(block, gridX, gridY)) {
                this.saveState();
                const result = this.board.moveBlock(block, gridX, gridY);
                
                if (result.success) {
                    // Handle rescues
                    for (const dog of result.rescuedDogs) {
                        this.renderer.addRescueAnimation(dog);
                    }
                    if (result.blockDisappeared) {
                        this.renderer.addBlockDisappearAnimation(block);
                    }
                    this.updateDogsRemaining();
                    this.checkWinCondition();
                }
            }
        }
    }

    /**
     * Check win condition
     */
    checkWinCondition() {
        if (this.board.isWon()) {
            // Delay victory screen to let animations play
            setTimeout(() => {
                this.showVictory();
            }, GAME_CONFIG.VICTORY_DELAY_MS);
        }
    }

    /**
     * Show victory screen
     */
    showVictory() {
        this.victoryScreen.classList.remove('hidden');
        
        // Hide next level button if on last level
        const nextBtn = document.getElementById('next-level-btn');
        if (this.currentLevel >= LEVELS.length - 1) {
            nextBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'inline-block';
        }
    }

    /**
     * Hide victory screen
     */
    hideVictory() {
        this.victoryScreen.classList.add('hidden');
    }

    /**
     * Start the render loop
     */
    startRenderLoop() {
        const renderFrame = () => {
            if (this.isDragging) {
                this.renderer.render(this.dragX, this.dragY);
            } else {
                this.renderer.render();
            }
            this.animationFrame = requestAnimationFrame(renderFrame);
        };
        
        // Cancel any existing animation frame
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        renderFrame();
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
});
