/**
 * Dog Rescue Puzzle - Rendering Engine
 * Handles drawing the game board and all entities
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.tileSize = 50;
        this.board = null;
        this.selectedBlock = null;
        this.dragOffset = { x: 0, y: 0 };
        this.animations = [];
    }

    /**
     * Set the board to render
     */
    setBoard(board) {
        this.board = board;
        this.resizeCanvas();
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
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw floor tiles
        this.drawFloor();
        
        // Draw walls
        this.drawWalls();
        
        // Draw dogs (before blocks so blocks appear on top)
        this.drawDogs();
        
        // Draw blocks (non-selected first, then selected on top)
        this.drawBlocks(dragX, dragY);
        
        // Draw drop preview if dragging
        if (this.selectedBlock && dragX !== null && dragY !== null) {
            this.drawDropPreview(dragX, dragY);
        }
        
        // Draw animations
        this.drawAnimations();
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
     * Draw wall tiles
     */
    drawWalls() {
        const wallImg = ASSETS.getImage('wall');
        
        for (const wall of this.board.walls) {
            const px = wall.x * this.tileSize;
            const py = wall.y * this.tileSize;
            
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
                this.ctx.fillText('🐕', px + this.tileSize / 2, py + this.tileSize / 2);
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
                this.drawBlock(block, block.x, block.y);
            }
        }
        
        // Draw selected block on top (possibly at drag position)
        if (this.selectedBlock && !this.selectedBlock.isComplete()) {
            if (dragX !== null && dragY !== null) {
                // Convert drag pixel position to grid
                const gridPos = this.pixelToGrid(
                    dragX - this.dragOffset.x,
                    dragY - this.dragOffset.y
                );
                this.drawBlock(this.selectedBlock, gridPos.x, gridPos.y, 0.8);
            } else {
                this.drawBlock(this.selectedBlock, this.selectedBlock.x, this.selectedBlock.y, 1, true);
            }
        }
    }

    /**
     * Draw a single block
     */
    drawBlock(block, gridX, gridY, alpha = 1, selected = false) {
        const remaining = block.getRemainingDogs();
        const blockImg = ASSETS.getImage(`block_${block.color}_${remaining}`);
        
        this.ctx.globalAlpha = alpha;
        
        for (const [dx, dy] of block.coords) {
            const px = (gridX + dx) * this.tileSize;
            const py = (gridY + dy) * this.tileSize;
            
            if (blockImg) {
                this.ctx.drawImage(blockImg, px, py, this.tileSize, this.tileSize);
            } else {
                // Fallback
                const colors = ASSETS.colors[block.color] || { main: '#888', dark: '#555' };
                this.ctx.fillStyle = colors.main;
                this.ctx.fillRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
                this.ctx.strokeStyle = colors.dark;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(px + 2, py + 2, this.tileSize - 4, this.tileSize - 4);
            }
        }
        
        // Draw number indicator on first tile of block
        if (block.coords.length > 0) {
            const [dx, dy] = block.coords[0];
            const px = (gridX + dx) * this.tileSize;
            const py = (gridY + dy) * this.tileSize;
            
            // The number is already in the image, but let's add a backup
            if (!blockImg) {
                this.ctx.fillStyle = 'white';
                this.ctx.font = 'bold 22px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.strokeStyle = '#333';
                this.ctx.lineWidth = 3;
                this.ctx.strokeText(remaining.toString(), px + this.tileSize / 2, py + this.tileSize / 2);
                this.ctx.fillText(remaining.toString(), px + this.tileSize / 2, py + this.tileSize / 2);
            }
        }
        
        // Draw selection highlight
        if (selected) {
            this.ctx.strokeStyle = '#ffeb3b';
            this.ctx.lineWidth = 3;
            for (const [dx, dy] of block.coords) {
                const px = (gridX + dx) * this.tileSize;
                const py = (gridY + dy) * this.tileSize;
                this.ctx.strokeRect(px + 1, py + 1, this.tileSize - 2, this.tileSize - 2);
            }
        }
        
        this.ctx.globalAlpha = 1;
    }

    /**
     * Draw drop preview (valid/invalid position indicator)
     */
    drawDropPreview(dragX, dragY) {
        const gridPos = this.pixelToGrid(
            dragX - this.dragOffset.x,
            dragY - this.dragOffset.y
        );
        
        const canMove = this.board.canBlockMoveTo(this.selectedBlock, gridPos.x, gridPos.y);
        
        this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = canMove ? '#4CAF50' : '#f44336';
        
        for (const [dx, dy] of this.selectedBlock.coords) {
            const px = (gridPos.x + dx) * this.tileSize;
            const py = (gridPos.y + dy) * this.tileSize;
            this.ctx.fillRect(px, py, this.tileSize, this.tileSize);
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
                // Draw sparkle effect
                const progress = anim.frame / anim.maxFrames;
                const radius = 10 + progress * 25;
                const alpha = 1 - progress;
                
                this.ctx.globalAlpha = alpha;
                this.ctx.strokeStyle = '#ffd700';
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.arc(anim.x, anim.y, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Draw stars
                const starCount = 5;
                for (let j = 0; j < starCount; j++) {
                    const angle = (j / starCount) * Math.PI * 2 + progress * Math.PI;
                    const starX = anim.x + Math.cos(angle) * radius;
                    const starY = anim.y + Math.sin(angle) * radius;
                    this.ctx.fillStyle = '#ffeb3b';
                    this.ctx.font = '12px Arial';
                    this.ctx.fillText('✦', starX - 4, starY + 4);
                }
                
                this.ctx.globalAlpha = 1;
            } else if (anim.type === 'disappear') {
                // Draw poof effect
                const progress = anim.frame / anim.maxFrames;
                const colors = ASSETS.colors[anim.color] || { light: '#ccc' };
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
     * Deselect current block
     */
    deselectBlock() {
        this.selectedBlock = null;
    }

    /**
     * Get current selected block
     */
    getSelectedBlock() {
        return this.selectedBlock;
    }
}
