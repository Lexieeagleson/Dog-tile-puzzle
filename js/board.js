/**
 * Dog Rescue Puzzle - Game Board
 * Manages the game board grid and collision detection
 */

class Board {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.walls = [];
        this.blocks = [];
        this.dogManager = new DogManager();
    }

    /**
     * Load board from level data
     */
    loadLevel(levelData) {
        this.width = levelData.width;
        this.height = levelData.height;
        this.walls = levelData.walls ? [...levelData.walls] : [];
        
        // Load blocks
        this.blocks = levelData.blocks.map(b => new Block(b));
        
        // Load dogs
        this.dogManager.loadFromLevel(levelData.dogs);
    }

    /**
     * Check if a position is a wall
     */
    isWall(x, y) {
        return this.walls.some(w => w.x === x && w.y === y);
    }

    /**
     * Check if position is within bounds
     */
    isInBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * Check if a position is occupied by any block (excluding a specific block)
     */
    isOccupiedByBlock(x, y, excludeBlockId = null) {
        return this.blocks.some(b => 
            b.id !== excludeBlockId && 
            !b.isComplete() && 
            b.occupiesTile(x, y)
        );
    }

    /**
     * Check if a block can move to a new position
     */
    canBlockMoveTo(block, newX, newY) {
        // Calculate new absolute positions
        const newCoords = block.coords.map(([dx, dy]) => [newX + dx, newY + dy]);
        
        // Check each tile
        for (const [x, y] of newCoords) {
            // Check bounds
            if (!this.isInBounds(x, y)) {
                return false;
            }
            // Check walls
            if (this.isWall(x, y)) {
                return false;
            }
            // Check other blocks
            if (this.isOccupiedByBlock(x, y, block.id)) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * Check if a block can rotate at its current position
     */
    canBlockRotate(block) {
        if (!block.rotatable) return false;
        
        // Get next rotation
        const rotations = BLOCK_SHAPES[block.shape].rotations;
        const nextRotationIndex = (block.rotationIndex + 1) % rotations.length;
        const nextCoords = rotations[nextRotationIndex];
        
        // Check each tile of rotated position
        for (const [dx, dy] of nextCoords) {
            const x = block.x + dx;
            const y = block.y + dy;
            
            if (!this.isInBounds(x, y)) return false;
            if (this.isWall(x, y)) return false;
            if (this.isOccupiedByBlock(x, y, block.id)) return false;
        }
        
        return true;
    }

    /**
     * Move a block and check for dog rescues
     * @returns {object} Result with rescued dogs and disappeared block info
     */
    moveBlock(block, newX, newY) {
        if (!this.canBlockMoveTo(block, newX, newY)) {
            return { success: false };
        }
        
        const result = {
            success: true,
            rescuedDogs: [],
            blockDisappeared: false
        };
        
        // Move the block
        block.moveTo(newX, newY);
        
        // Check for dog rescues
        const blockCoords = block.getAbsoluteCoords();
        for (const [x, y] of blockCoords) {
            const dog = this.dogManager.getDogAt(x, y);
            if (dog && dog.canBeRescuedBy(block.color)) {
                dog.rescue();
                result.rescuedDogs.push(dog);
                
                // Update block's rescue counter
                const shouldDisappear = block.rescueDog();
                if (shouldDisappear) {
                    result.blockDisappeared = true;
                    break;  // Block is gone, no more rescues
                }
            }
        }
        
        return result;
    }

    /**
     * Rotate a block and check for dog rescues
     */
    rotateBlock(block) {
        if (!this.canBlockRotate(block)) {
            return { success: false };
        }
        
        const result = {
            success: true,
            rescuedDogs: [],
            blockDisappeared: false
        };
        
        // Rotate the block
        block.rotate();
        
        // Check for dog rescues after rotation
        const blockCoords = block.getAbsoluteCoords();
        for (const [x, y] of blockCoords) {
            const dog = this.dogManager.getDogAt(x, y);
            if (dog && dog.canBeRescuedBy(block.color)) {
                dog.rescue();
                result.rescuedDogs.push(dog);
                
                const shouldDisappear = block.rescueDog();
                if (shouldDisappear) {
                    result.blockDisappeared = true;
                    break;
                }
            }
        }
        
        return result;
    }

    /**
     * Get all active (non-complete) blocks
     */
    getActiveBlocks() {
        return this.blocks.filter(b => !b.isComplete());
    }

    /**
     * Get block at a specific position
     */
    getBlockAt(x, y) {
        return this.blocks.find(b => !b.isComplete() && b.occupiesTile(x, y));
    }

    /**
     * Check win condition
     */
    isWon() {
        return this.dogManager.allRescued();
    }

    /**
     * Serialize board state for undo
     */
    serialize() {
        return {
            blocks: this.blocks.map(b => b.serialize()),
            dogs: this.dogManager.serialize()
        };
    }

    /**
     * Restore board state from serialized data
     */
    restore(data) {
        data.blocks.forEach((blockData, i) => {
            if (this.blocks[i]) {
                this.blocks[i].restore(blockData);
            }
        });
        this.dogManager.restore(data.dogs);
    }
}
