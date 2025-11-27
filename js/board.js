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
            // Check for dogs that the block cannot rescue
            const dog = this.dogManager.getDogAt(x, y);
            if (dog && (!dog.canBeRescuedBy(block.color) || block.isComplete())) {
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
            // Check for dogs that the block cannot rescue
            const dog = this.dogManager.getDogAt(x, y);
            if (dog && (!dog.canBeRescuedBy(block.color) || block.isComplete())) return false;
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

    /**
     * Validate level solvability - checks if blocks can reach their target dogs
     * This validates that there's enough space for blocks to navigate around obstacles
     * @returns {object} Validation result with issues array
     */
    validateLevel() {
        const issues = [];
        
        // Check each block can potentially reach at least one dog of its color
        for (const block of this.blocks) {
            const dogsOfColor = this.dogManager.dogs.filter(d => d.color === block.color);
            
            if (dogsOfColor.length === 0) {
                issues.push({
                    type: 'no_matching_dogs',
                    blockId: block.id,
                    color: block.color,
                    message: `Block ${block.id} (${block.color}) has no matching dogs to rescue`
                });
                continue;
            }
            
            // Check if at least one dog is reachable by this block
            const reachableDogs = dogsOfColor.filter(dog => 
                this.canBlockReachPosition(block, dog.x, dog.y)
            );
            
            if (reachableDogs.length === 0) {
                issues.push({
                    type: 'unreachable_dogs',
                    blockId: block.id,
                    color: block.color,
                    message: `Block ${block.id} (${block.color}) cannot reach any ${block.color} dogs - obstacles may be blocking the path`
                });
            }
        }
        
        // Check if each dog has at least one block that can reach it
        for (const dog of this.dogManager.dogs) {
            const blocksOfColor = this.blocks.filter(b => b.color === dog.color);
            
            if (blocksOfColor.length === 0) {
                issues.push({
                    type: 'no_matching_block',
                    dogColor: dog.color,
                    dogPosition: { x: dog.x, y: dog.y },
                    message: `Dog at (${dog.x}, ${dog.y}) has no matching ${dog.color} block to rescue it`
                });
                continue;
            }
            
            const canBeReached = blocksOfColor.some(block => 
                this.canBlockReachPosition(block, dog.x, dog.y)
            );
            
            if (!canBeReached) {
                issues.push({
                    type: 'dog_unreachable',
                    dogColor: dog.color,
                    dogPosition: { x: dog.x, y: dog.y },
                    message: `Dog at (${dog.x}, ${dog.y}) cannot be reached by any ${dog.color} block - not enough space around obstacles`
                });
            }
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * Check if a block can potentially reach a target position
     * Uses BFS pathfinding considering only walls as obstacles (other blocks can be moved)
     * Also considers all possible rotations of the block
     * @param {Block} block - The block to check
     * @param {number} targetX - Target X coordinate
     * @param {number} targetY - Target Y coordinate
     * @returns {boolean} True if the block can reach the target
     */
    canBlockReachPosition(block, targetX, targetY) {
        // Use BFS to find if there's a valid path for the block
        // Treating walls as permanent obstacles, but ignoring other blocks (they can be moved)
        // Consider all rotations of the block
        
        const visited = new Set();
        
        // Get all possible rotations for this block shape
        const rotations = block.rotatable && BLOCK_SHAPES[block.shape] 
            ? BLOCK_SHAPES[block.shape].rotations 
            : [block.coords];
        
        // Queue contains position and rotation index
        const queue = [];
        
        // Start with all rotations at initial position
        for (let rotIdx = 0; rotIdx < rotations.length; rotIdx++) {
            const coords = rotations[rotIdx];
            if (this.canCoordsAtPosition(coords, block.x, block.y)) {
                const key = `${block.x},${block.y},${rotIdx}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ x: block.x, y: block.y, rotIdx, coords });
                }
            }
        }
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            // Check if any part of the block at this position overlaps with target
            const wouldReachTarget = current.coords.some(([dx, dy]) => 
                current.x + dx === targetX && current.y + dy === targetY
            );
            
            if (wouldReachTarget) {
                return true;
            }
            
            // Try all four directions with current rotation
            const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
            
            for (const [dx, dy] of directions) {
                const newX = current.x + dx;
                const newY = current.y + dy;
                const key = `${newX},${newY},${current.rotIdx}`;
                
                if (visited.has(key)) continue;
                
                if (this.canCoordsAtPosition(current.coords, newX, newY)) {
                    visited.add(key);
                    queue.push({ x: newX, y: newY, rotIdx: current.rotIdx, coords: current.coords });
                }
            }
            
            // Try all other rotations at current position
            for (let rotIdx = 0; rotIdx < rotations.length; rotIdx++) {
                if (rotIdx === current.rotIdx) continue;
                
                const key = `${current.x},${current.y},${rotIdx}`;
                if (visited.has(key)) continue;
                
                const coords = rotations[rotIdx];
                if (this.canCoordsAtPosition(coords, current.x, current.y)) {
                    visited.add(key);
                    queue.push({ x: current.x, y: current.y, rotIdx, coords });
                }
            }
        }
        
        return false;
    }

    /**
     * Check if block coords can fit at a position, ignoring other blocks
     * Only walls and bounds are considered as obstacles
     * @param {Array} coords - Block coordinates array
     * @param {number} posX - Position X
     * @param {number} posY - Position Y
     * @returns {boolean} True if the coords fit
     */
    canCoordsAtPosition(coords, posX, posY) {
        for (const [dx, dy] of coords) {
            const x = posX + dx;
            const y = posY + dy;
            
            // Check bounds
            if (!this.isInBounds(x, y)) {
                return false;
            }
            // Check walls only (other blocks can be moved out of the way)
            if (this.isWall(x, y)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get minimum corridor width needed for a block shape
     * Returns the minimum dimension of the block's bounding box
     * @param {Block} block - The block to measure
     * @returns {number} Minimum corridor width needed
     */
    getMinCorridorWidth(block) {
        const xs = block.coords.map(([dx]) => dx);
        const ys = block.coords.map(([, dy]) => dy);
        const width = Math.max(...xs) - Math.min(...xs) + 1;
        const height = Math.max(...ys) - Math.min(...ys) + 1;
        return Math.min(width, height);
    }

    /**
     * Calculate free space around obstacles to determine if blocks can navigate
     * @returns {object} Space analysis with corridor widths
     */
    analyzeNavigableSpace() {
        const analysis = {
            minCorridorWidth: Infinity,
            hasNarrowPassages: false,
            narrowPassages: []
        };
        
        // Scan for narrow passages between walls
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.isWall(x, y)) continue;
                
                // Check horizontal corridor width at this point
                let hWidth = 0;
                for (let checkY = y; checkY < this.height && !this.isWall(x, checkY); checkY++) {
                    hWidth++;
                }
                
                // Check vertical corridor width at this point
                let vWidth = 0;
                for (let checkX = x; checkX < this.width && !this.isWall(checkX, y); checkX++) {
                    vWidth++;
                }
                
                const localMin = Math.min(hWidth, vWidth);
                if (localMin < analysis.minCorridorWidth && localMin > 0) {
                    analysis.minCorridorWidth = localMin;
                }
            }
        }
        
        // Check if any blocks need more space than available
        for (const block of this.blocks) {
            const neededWidth = this.getMinCorridorWidth(block);
            if (neededWidth > analysis.minCorridorWidth) {
                analysis.hasNarrowPassages = true;
                analysis.narrowPassages.push({
                    blockId: block.id,
                    neededWidth: neededWidth,
                    availableWidth: analysis.minCorridorWidth
                });
            }
        }
        
        return analysis;
    }
}
