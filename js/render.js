/**
 * Dog Rescue Puzzle - Rendering Engine
 * Handles drawing the game board and all entities
 */

// Rendering configuration constants
const RENDER_CONFIG = {
    ANIMATION_SPEED: 0.15,  // Animation progress per frame (higher = faster animation)
    BLOCK_PADDING: 3,       // Padding from tile edges for block shapes
    HIGHLIGHT_OPACITY: 0.5  // Opacity for inner highlight effects
};

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 50;
        this.board = null;
        this.selectedBlock = null;
        this.selectedObstacle = null;
        this.dragOffset = { x: 0, y: 0 };
        this.animations = [];
        // Animation state for smooth movement
        this.animatingBlocks = new Map(); // blockId -> {fromX, fromY, toX, toY, progress}
        this.animatingObstacles = new Map(); // obstacleId -> {fromX, fromY, toX, toY, progress}
    }

    /**
     * Set the board to render
     */
    setBoard(board) {
        this.board = board;
        this.resizeCanvas();
        // Clear any animations when loading new board
        this.animatingBlocks.clear();
        this.animatingObstacles.clear();
    }

    /**
     * Resize canvas to fit the board
     */
    resizeCanvas() {
        if (!this.board) return;
        this.canvas.width = this.board.width * this.tileSize;
        this.canvas.height = this.board.height * this.tileSize;
    }

    /**
     * Set tile size and resize
     */
    setTileSize(size) {
        this.tileSize = size;
        this.resizeCanvas();
    }

    /**
     * Convert pixel coordinates to grid coordinates
     */
    pixelToGrid(px, py) {
        return {
            x: Math.floor(px / this.tileSize),
            y: Math.floor(py / this.tileSize)
        };
    }

    /**
     * Convert grid coordinates to pixel coordinates (top-left of tile)
     */
    gridToPixel(gx, gy) {
        return {
            x: gx * this.tileSize,
            y: gy * this.tileSize
        };
    }

    /**
     * Draw the entire game
     */
    render(dragX = null, dragY = null) {
        if (!this.board) return;
        
        // Update smooth movement animations
        this.updateMovementAnimations();
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw floor tiles
        this.drawFloor();
        
        // Draw walls (obstacles)
        this.drawWalls(dragX, dragY);
        
        // Draw dogs (before blocks so blocks appear on top)
        this.drawDogs();
        
        // Draw blocks (non-selected first, then selected on top)
        this.drawBlocks(dragX, dragY);
        
        // Draw animations
        this.drawAnimations();
    }

    /**
     * Update smooth movement animations (progress from 0 to 1)
     */
    updateMovementAnimations() {
        // Update block animations
        for (const [blockId, anim] of this.animatingBlocks) {
            anim.progress += RENDER_CONFIG.ANIMATION_SPEED;
            if (anim.progress >= 1) {
                this.animatingBlocks.delete(blockId);
            }
        }
        
        // Update obstacle animations
        for (const [obstacleId, anim] of this.animatingObstacles) {
            anim.progress += RENDER_CONFIG.ANIMATION_SPEED;
            if (anim.progress >= 1) {
                this.animatingObstacles.delete(obstacleId);
            }
        }
    }

    /**
     * Smooth easing function for animations
     */
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }

    /**
     * Draw floor tiles
     */
    drawFloor() {
        const floorImg = ASSETS.getImage('floor');
        
        for (let y = 0; y < this.board.height; y++) {
            for (let x = 0; x < this.board.width; x++) {
                const px = x * this.tileSize;
                const py = y * this.tileSize;
                
                if (floorImg) {
                    this.ctx.drawImage(floorImg, px, py, this.tileSize, this.tileSize);
                } else {
                    // Fallback
                    this.ctx.fillStyle = '#f5f5f5';
                    this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
                    this.ctx.strokeStyle = '#e0e0e0';
                    this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);
                }
            }
        }
    }

    /**
     * Draw wall tiles (obstacles)
     * Now handles multi-cell obstacles - draws all tiles of each obstacle
     */
    drawWalls(dragX, dragY) {
        const wallImg = ASSETS.getImage('wall');
        
        // Draw non-selected obstacles first
        for (const obstacle of this.board.obstacles) {
            if (obstacle === this.selectedObstacle) continue;
            
            // Check for smooth movement animation
            const anim = this.animatingObstacles.get(obstacle.id);
            let baseX, baseY;
            
            if (anim) {
                const easedProgress = this.easeOutCubic(anim.progress);
                baseX = anim.fromX + (anim.toX - anim.fromX) * easedProgress;
                baseY = anim.fromY + (anim.toY - anim.fromY) * easedProgress;
            } else {
                baseX = obstacle.x;
                baseY = obstacle.y;
            }
            
            // Draw all tiles of the obstacle
            for (const [dx, dy] of obstacle.coords) {
                const px = (baseX + dx) * this.tileSize;
                const py = (baseY + dy) * this.tileSize;
                this.drawObstacleTile(px, py, wallImg);
            }
        }
        
        // Draw selected obstacle on top (possibly at drag position)
        if (this.selectedObstacle) {
            let baseX, baseY;
            if (dragX !== null && dragY !== null) {
                // Convert drag pixel position to fractional grid for smooth dragging
                baseX = (dragX - this.dragOffset.x) / this.tileSize;
                baseY = (dragY - this.dragOffset.y) / this.tileSize;
                this.ctx.globalAlpha = 0.8;
            } else {
                baseX = this.selectedObstacle.x;
                baseY = this.selectedObstacle.y;
            }
            
            // Draw all tiles of the selected obstacle
            for (const [dx, dy] of this.selectedObstacle.coords) {
                const px = (baseX + dx) * this.tileSize;
                const py = (baseY + dy) * this.tileSize;
                this.drawObstacleTile(px, py, wallImg, true);
            }
            
            if (dragX !== null && dragY !== null) {
                this.ctx.globalAlpha = 1;
            }
        }
    }

    /**
     * Draw a single obstacle tile
     */
    drawObstacleTile(px, py, wallImg, selected = false) {
        if (wallImg) {
            this.ctx.drawImage(wallImg, px, py, this.tileSize, this.tileSize);
        } else {
            // Fallback
            this.ctx.fillStyle = '#757575';
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
            this.ctx.strokeStyle = '#424242';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(px, py, this.tileSize, this.tileSize);
        }
        
        // Draw selection highlight
        if (selected) {
            this.ctx.strokeStyle = '#06B6D4'; // Modern cyan accent color
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(px + 1, py + 1, this.tileSize - 2, this.tileSize - 2);
        }
    }

    /**
     * Draw all dogs
     */
    drawDogs() {
        const activeDogs = this.board.dogManager.getActiveDogs();
        
        for (const dog of activeDogs) {
            const dogImg = ASSETS.getImage(`dog_${dog.color}`);
            const px = dog.x * this.tileSize;
            const py = dog.y * this.tileSize;
            
            if (dogImg) {
                this.ctx.drawImage(dogImg, px, py, this.tileSize, this.tileSize);
            } else {
                // Fallback - draw colored circle with 'D'
                const colors = ASSETS.colors[dog.color] || { main: '#888' };
                this.ctx.fillStyle = colors.main;
                this.ctx.beginPath();
                this.ctx.arc(
                    px + this.tileSize / 2, 
                    py + this.tileSize / 2, 
                    this.tileSize / 2 - 5, 
                    0, 
                    Math.PI * 2
                );
                this.ctx.fill();
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                // Use 'D' as a reliable cross-platform fallback for dog
                this.ctx.fillText('D', px + this.tileSize / 2, py + this.tileSize / 2);
            }
        }
    }

    /**
     * Draw all blocks
     */
    drawBlocks(dragX, dragY) {
        const activeBlocks = this.board.getActiveBlocks();
        
        // Draw non-selected blocks first
        for (const block of activeBlocks) {
            if (block !== this.selectedBlock) {
                // Check for smooth movement animation
                const anim = this.animatingBlocks.get(block.id);
                if (anim) {
                    const easedProgress = this.easeOutCubic(anim.progress);
                    const animX = anim.fromX + (anim.toX - anim.fromX) * easedProgress;
                    const animY = anim.fromY + (anim.toY - anim.fromY) * easedProgress;
                    this.drawBlock(block, animX, animY);
                } else {
                    this.drawBlock(block, block.x, block.y);
                }
            }
        }
        
        // Draw selected block on top (possibly at drag position)
        if (this.selectedBlock && !this.selectedBlock.isComplete()) {
            if (dragX !== null && dragY !== null) {
                // Convert drag pixel position to fractional grid for smooth dragging
                const gridX = (dragX - this.dragOffset.x) / this.tileSize;
                const gridY = (dragY - this.dragOffset.y) / this.tileSize;
                this.drawBlock(this.selectedBlock, gridX, gridY, 0.8);
            } else {
                this.drawBlock(this.selectedBlock, this.selectedBlock.x, this.selectedBlock.y, 1, true);
            }
        }
    }

    /**
     * Draw a single block as a unified smooth shape (gridX and gridY can be fractional for smooth animation)
     */
    drawBlock(block, gridX, gridY, alpha = 1, selected = false) {
        const remaining = block.getRemainingDogs();
        const colors = ASSETS.colors[block.color] || { main: '#888', dark: '#555', light: '#aaa' };
        const padding = RENDER_CONFIG.BLOCK_PADDING;
        
        this.ctx.globalAlpha = alpha;
        
        // Create a set of coordinates for quick lookup
        const coordSet = new Set(block.coords.map(([dx, dy]) => `${dx},${dy}`));
        
        // Calculate the bounding box center for the number display
        const xs = block.coords.map(([dx]) => dx);
        const ys = block.coords.map(([, dy]) => dy);
        const centerX = (Math.min(...xs) + Math.max(...xs) + 1) / 2;
        const centerY = (Math.min(...ys) + Math.max(...ys) + 1) / 2;
        
        // Calculate bounds for gradient
        const minPy = (gridY + Math.min(...ys)) * this.tileSize;
        const maxPy = (gridY + Math.max(...ys) + 1) * this.tileSize;
        
        // Create gradient for the unified block
        const gradient = this.ctx.createLinearGradient(0, minPy, 0, maxPy);
        gradient.addColorStop(0, colors.light);
        gradient.addColorStop(0.5, colors.main);
        gradient.addColorStop(1, colors.dark);
        
        // Draw shadow layer first (offset filled rectangles)
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        for (const [dx, dy] of block.coords) {
            const px = (gridX + dx) * this.tileSize + padding + 1;
            const py = (gridY + dy) * this.tileSize + padding + 2;
            this.ctx.fillRect(px, py, this.tileSize - padding * 2, this.tileSize - padding * 2);
        }
        
        // Draw filled tiles (unified color with gradient)
        this.ctx.fillStyle = gradient;
        for (const [dx, dy] of block.coords) {
            const px = (gridX + dx) * this.tileSize + padding;
            const py = (gridY + dy) * this.tileSize + padding;
            this.ctx.fillRect(px, py, this.tileSize - padding * 2, this.tileSize - padding * 2);
        }
        
        // Draw glossy highlight on top portion of each tile
        const glossGradient = this.ctx.createLinearGradient(0, minPy, 0, minPy + (maxPy - minPy) * 0.5);
        glossGradient.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
        glossGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
        glossGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = glossGradient;
        for (const [dx, dy] of block.coords) {
            const px = (gridX + dx) * this.tileSize + padding;
            const py = (gridY + dy) * this.tileSize + padding;
            this.ctx.fillRect(px, py, this.tileSize - padding * 2, (this.tileSize - padding * 2) * 0.5);
        }
        
        // Draw only the outer border edges (not between adjacent tiles) - combined into single path
        this.ctx.strokeStyle = colors.dark;
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        
        for (const [dx, dy] of block.coords) {
            const px = (gridX + dx) * this.tileSize + padding;
            const py = (gridY + dy) * this.tileSize + padding;
            const size = this.tileSize - padding * 2;
            
            // Check which neighbors exist
            const hasTop = coordSet.has(`${dx},${dy - 1}`);
            const hasBottom = coordSet.has(`${dx},${dy + 1}`);
            const hasLeft = coordSet.has(`${dx - 1},${dy}`);
            const hasRight = coordSet.has(`${dx + 1},${dy}`);
            
            // Draw only edges that are on the boundary
            if (!hasTop) {
                this.ctx.moveTo(px, py);
                this.ctx.lineTo(px + size, py);
            }
            if (!hasRight) {
                this.ctx.moveTo(px + size, py);
                this.ctx.lineTo(px + size, py + size);
            }
            if (!hasBottom) {
                this.ctx.moveTo(px + size, py + size);
                this.ctx.lineTo(px, py + size);
            }
            if (!hasLeft) {
                this.ctx.moveTo(px, py + size);
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.stroke();
        
        // Draw inner highlight on outer edges only - combined into single path
        this.ctx.strokeStyle = colors.light;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = alpha * RENDER_CONFIG.HIGHLIGHT_OPACITY;
        this.ctx.beginPath();
        
        for (const [dx, dy] of block.coords) {
            const px = (gridX + dx) * this.tileSize + padding + 2;
            const py = (gridY + dy) * this.tileSize + padding + 2;
            const size = this.tileSize - padding * 2 - 4;
            
            const hasTop = coordSet.has(`${dx},${dy - 1}`);
            const hasLeft = coordSet.has(`${dx - 1},${dy}`);
            
            // Draw highlight on top and left edges only (light source from top-left)
            if (!hasTop) {
                this.ctx.moveTo(px, py);
                this.ctx.lineTo(px + size, py);
            }
            if (!hasLeft) {
                this.ctx.moveTo(px, py);
                this.ctx.lineTo(px, py + size);
            }
        }
        this.ctx.stroke();
        
        this.ctx.globalAlpha = alpha;
        
        // Draw number indicator in the center of the block
        const numberX = (gridX + centerX) * this.tileSize;
        const numberY = (gridY + centerY) * this.tileSize;
        
        // Draw number background circle
        this.ctx.beginPath();
        this.ctx.arc(numberX, numberY, 16, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        this.ctx.fill();
        
        // Draw number text
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(remaining.toString(), numberX, numberY + 1);
        
        // Draw selection highlight on outer edges only - combined into single path
        if (selected) {
            this.ctx.strokeStyle = '#06B6D4'; // Modern cyan accent color
            this.ctx.lineWidth = 3;
            this.ctx.globalAlpha = alpha;
            this.ctx.beginPath();
            
            for (const [dx, dy] of block.coords) {
                const px = (gridX + dx) * this.tileSize + padding - 1;
                const py = (gridY + dy) * this.tileSize + padding - 1;
                const size = this.tileSize - padding * 2 + 2;
                
                const hasTop = coordSet.has(`${dx},${dy - 1}`);
                const hasBottom = coordSet.has(`${dx},${dy + 1}`);
                const hasLeft = coordSet.has(`${dx - 1},${dy}`);
                const hasRight = coordSet.has(`${dx + 1},${dy}`);
                
                if (!hasTop) {
                    this.ctx.moveTo(px, py);
                    this.ctx.lineTo(px + size, py);
                }
                if (!hasRight) {
                    this.ctx.moveTo(px + size, py);
                    this.ctx.lineTo(px + size, py + size);
                }
                if (!hasBottom) {
                    this.ctx.moveTo(px + size, py + size);
                    this.ctx.lineTo(px, py + size);
                }
                if (!hasLeft) {
                    this.ctx.moveTo(px, py + size);
                    this.ctx.lineTo(px, py);
                }
            }
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Add a rescue animation
     */
    addRescueAnimation(dog) {
        this.animations.push({
            type: 'rescue',
            x: dog.x * this.tileSize + this.tileSize / 2,
            y: dog.y * this.tileSize + this.tileSize / 2,
            frame: 0,
            maxFrames: 20
        });
    }

    /**
     * Add a block disappear animation
     */
    addBlockDisappearAnimation(block) {
        for (const [dx, dy] of block.coords) {
            this.animations.push({
                type: 'disappear',
                x: (block.x + dx) * this.tileSize + this.tileSize / 2,
                y: (block.y + dy) * this.tileSize + this.tileSize / 2,
                color: block.color,
                frame: 0,
                maxFrames: 15
            });
        }
    }

    /**
     * Draw all active animations
     */
    drawAnimations() {
        const toRemove = [];
        
        for (let i = 0; i < this.animations.length; i++) {
            const anim = this.animations[i];
            
            if (anim.type === 'rescue') {
                // Draw sparkle effect with modern colors
                const progress = anim.frame / anim.maxFrames;
                const radius = 10 + progress * 25;
                const alpha = 1 - progress;
                
                this.ctx.globalAlpha = alpha;
                this.ctx.strokeStyle = '#10B981'; // Emerald success color
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Draw sparkles using canvas drawing
                const starCount = 5;
                for (let j = 0; j < starCount; j++) {
                    const angle = (j / starCount) * Math.PI * 2 + progress * Math.PI;
                    const starX = anim.x + Math.cos(angle) * radius;
                    const starY = anim.y + Math.sin(angle) * radius;
                    this.ctx.fillStyle = '#34D399'; // Light emerald
                    // Draw a simple circle sparkle
                    this.ctx.beginPath();
                    this.ctx.arc(starX, starY, 4, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                
                this.ctx.globalAlpha = 1;
            } else if (anim.type === 'disappear') {
                // Draw poof effect
                const progress = anim.frame / anim.maxFrames;
                const colors = ASSETS.colors[anim.color] || { light: '#D4D4D8' };
                const alpha = 1 - progress;
                const radius = progress * 30;
                
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = colors.light;
                this.ctx.beginPath();
                this.ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
            
            anim.frame++;
            if (anim.frame >= anim.maxFrames) {
                toRemove.push(i);
            }
        }
        
        // Remove completed animations
        for (let i = toRemove.length - 1; i >= 0; i--) {
            this.animations.splice(toRemove[i], 1);
        }
    }

    /**
     * Check if any animations are running
     */
    hasAnimations() {
        return this.animations.length > 0;
    }

    /**
     * Select a block at position
     */
    selectBlockAt(x, y) {
        const gridPos = this.pixelToGrid(x, y);
        const block = this.board.getBlockAt(gridPos.x, gridPos.y);
        
        if (block) {
            this.selectedBlock = block;
            // Calculate offset from block origin to click position
            this.dragOffset.x = x - block.x * this.tileSize;
            this.dragOffset.y = y - block.y * this.tileSize;
        }
        
        return block;
    }

    /**
     * Select an obstacle at position
     */
    selectObstacleAt(x, y) {
        const gridPos = this.pixelToGrid(x, y);
        const obstacle = this.board.getObstacleAt(gridPos.x, gridPos.y);
        
        if (obstacle) {
            this.selectedObstacle = obstacle;
            // Calculate offset from obstacle origin to click position
            this.dragOffset.x = x - obstacle.x * this.tileSize;
            this.dragOffset.y = y - obstacle.y * this.tileSize;
        }
        
        return obstacle;
    }

    /**
     * Select either block or obstacle at position (block takes priority if overlapping)
     */
    selectEntityAt(x, y) {
        // First try to select a block
        const block = this.selectBlockAt(x, y);
        if (block) {
            this.selectedObstacle = null;
            return { type: 'block', entity: block };
        }
        
        // If no block, try to select an obstacle
        const obstacle = this.selectObstacleAt(x, y);
        if (obstacle) {
            this.selectedBlock = null;
            return { type: 'obstacle', entity: obstacle };
        }
        
        return null;
    }

    /**
     * Deselect current block
     */
    deselectBlock() {
        this.selectedBlock = null;
    }

    /**
     * Deselect current obstacle
     */
    deselectObstacle() {
        this.selectedObstacle = null;
    }

    /**
     * Deselect all entities
     */
    deselectAll() {
        this.selectedBlock = null;
        this.selectedObstacle = null;
    }

    /**
     * Get current selected block
     */
    getSelectedBlock() {
        return this.selectedBlock;
    }

    /**
     * Get current selected obstacle
     */
    getSelectedObstacle() {
        return this.selectedObstacle;
    }

    /**
     * Start a smooth movement animation for a block
     */
    startBlockMoveAnimation(block, fromX, fromY, toX, toY) {
        this.animatingBlocks.set(block.id, {
            fromX: fromX,
            fromY: fromY,
            toX: toX,
            toY: toY,
            progress: 0
        });
    }

    /**
     * Start a smooth movement animation for an obstacle
     */
    startObstacleMoveAnimation(obstacle, fromX, fromY, toX, toY) {
        this.animatingObstacles.set(obstacle.id, {
            fromX: fromX,
            fromY: fromY,
            toX: toX,
            toY: toY,
            progress: 0
        });
    }

    /**
     * Check if any movement animations are active
     */
    hasMovementAnimations() {
        return this.animatingBlocks.size > 0 || this.animatingObstacles.size > 0;
    }
}
