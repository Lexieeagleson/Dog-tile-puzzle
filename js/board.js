/**
 * Dog Rescue Puzzle - Game Board
 * Manages the game board grid and collision detection
 */

// Counter for generating unique obstacle IDs
let obstacleIdCounter = 0;

/**
 * Obstacle class - Represents a movable obstacle (wall) on the board
 * Obstacles consist of multiple connected cells that move together as one piece.
 * Minimum size is 2 cells.
 */
class Obstacle {
    constructor(config) {
        // Base position (anchor point)
        this.x = config.x;
        this.y = config.y;
        // Use a stable unique ID that doesn't change when position changes
        this.id = config.id || `obstacle_${obstacleIdCounter++}`;
        
        // Coordinates relative to the anchor point (like Block class)
        // For multi-cell obstacles, coords should be like [[0,0], [1,0]] for a horizontal 2-cell obstacle
        // Minimum size requirement: obstacles must be at least 2 cells
        if (config.coords) {
            this.coords = config.coords;
            if (this.coords.length < 2) {
                console.warn(`Obstacle ${this.id} has less than 2 cells. Obstacles should be at least 2 cells minimum.`);
            }
        } else {
            // Legacy single-cell - this shouldn't happen with properly grouped obstacles
            console.warn(`Obstacle at (${this.x}, ${this.y}) was created without coords. Obstacles should be at least 2 cells minimum.`);
            this.coords = [[0, 0]];
        }
    }

    /**
     * Get absolute positions of all tiles in this obstacle
     */
    getAbsoluteCoords() {
        return this.coords.map(([dx, dy]) => [this.x + dx, this.y + dy]);
    }

    /**
     * Check if this obstacle occupies a specific position
     */
    occupiesTile(x, y) {
        return this.getAbsoluteCoords().some(([ox, oy]) => ox === x && oy === y);
    }

    /**
     * Check if this obstacle is at a specific position (legacy compatibility)
     * Now checks if any cell of the obstacle is at the position
     */
    isAt(x, y) {
        return this.occupiesTile(x, y);
    }

    /**
     * Move obstacle to new position
     */
    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Get bounding box of the obstacle
     */
    getBoundingBox() {
        const absCoords = this.getAbsoluteCoords();
        const xs = absCoords.map(c => c[0]);
        const ys = absCoords.map(c => c[1]);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys)
        };
    }

    /**
     * Serialize obstacle state for undo
     */
    serialize() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            coords: [...this.coords]
        };
    }

    /**
     * Restore obstacle state from serialized data
     */
    restore(data) {
        this.x = data.x;
        this.y = data.y;
        if (data.coords) {
            this.coords = [...data.coords];
        }
    }
}

class Board {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.walls = [];
        this.obstacles = [];
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
        
        // Check if level uses new obstacle format (with coords and explicit grouping)
        if (levelData.obstacles && Array.isArray(levelData.obstacles)) {
            // New format: obstacles are already grouped
            this.obstacles = levelData.obstacles.map(o => new Obstacle(o));
        } else {
            // Legacy format: convert individual wall cells into grouped obstacles
            // Group adjacent wall cells into multi-cell obstacles
            this.obstacles = this.groupWallsIntoObstacles(this.walls);
        }
        
        // Load blocks
        this.blocks = levelData.blocks.map(b => new Block(b));
        
        // Load dogs
        this.dogManager.loadFromLevel(levelData.dogs);
    }

    /**
     * Group individual wall cells into connected multi-cell obstacles
     * Uses flood-fill to find connected components (4-directional adjacency)
     */
    groupWallsIntoObstacles(walls) {
        if (!walls || walls.length === 0) return [];
        
        // Create a set of wall positions for quick lookup
        const wallSet = new Set(walls.map(w => `${w.x},${w.y}`));
        const visited = new Set();
        const obstacles = [];
        
        for (const wall of walls) {
            const key = `${wall.x},${wall.y}`;
            if (visited.has(key)) continue;
            
            // Flood fill to find all connected cells
            const group = [];
            const queue = [{ x: wall.x, y: wall.y }];
            
            while (queue.length > 0) {
                const cell = queue.shift();
                const cellKey = `${cell.x},${cell.y}`;
                
                if (visited.has(cellKey)) continue;
                if (!wallSet.has(cellKey)) continue;
                
                visited.add(cellKey);
                group.push(cell);
                
                // Check 4-directional neighbors
                const neighbors = [
                    { x: cell.x + 1, y: cell.y },
                    { x: cell.x - 1, y: cell.y },
                    { x: cell.x, y: cell.y + 1 },
                    { x: cell.x, y: cell.y - 1 }
                ];
                
                for (const neighbor of neighbors) {
                    const neighborKey = `${neighbor.x},${neighbor.y}`;
                    if (!visited.has(neighborKey) && wallSet.has(neighborKey)) {
                        queue.push(neighbor);
                    }
                }
            }
            
            if (group.length > 0) {
                // Use deterministic anchor point: top-left cell (minimum y, then minimum x)
                // This ensures consistent obstacle positioning across different runs
                const anchor = group.reduce((best, cell) => {
                    if (cell.y < best.y || (cell.y === best.y && cell.x < best.x)) {
                        return cell;
                    }
                    return best;
                }, group[0]);
                
                // Calculate relative coordinates for all cells
                const coords = group.map(cell => [cell.x - anchor.x, cell.y - anchor.y]);
                
                obstacles.push(new Obstacle({
                    x: anchor.x,
                    y: anchor.y,
                    coords: coords
                }));
            }
        }
        
        return obstacles;
    }

    /**
     * Check if a position is a wall (now checks obstacles)
     */
    isWall(x, y) {
        return this.obstacles.some(o => o.occupiesTile(x, y));
    }

    /**
     * Get obstacle at a specific position
     */
    getObstacleAt(x, y) {
        return this.obstacles.find(o => o.occupiesTile(x, y));
    }

    /**
     * Check if an obstacle can move to a new position
     * Now handles multi-cell obstacles - all tiles must be in valid positions
     */
    canObstacleMoveTo(obstacle, newX, newY) {
        // Calculate new absolute positions for all tiles of the obstacle
        const newCoords = obstacle.coords.map(([dx, dy]) => [newX + dx, newY + dy]);
        
        // Check each tile
        for (const [x, y] of newCoords) {
            // Check bounds
            if (!this.isInBounds(x, y)) {
                return false;
            }
            // Check other obstacles (excluding this obstacle)
            for (const other of this.obstacles) {
                if (other !== obstacle && other.occupiesTile(x, y)) {
                    return false;
                }
            }
            // Check blocks
            if (this.isOccupiedByBlock(x, y)) {
                return false;
            }
            // Check dogs
            if (this.dogManager.getDogAt(x, y)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Move an obstacle to a new position
     */
    moveObstacle(obstacle, newX, newY) {
        if (!this.canObstacleMoveTo(obstacle, newX, newY)) {
            return { success: false };
        }
        obstacle.moveTo(newX, newY);
        return { success: true };
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
            dogs: this.dogManager.serialize(),
            obstacles: this.obstacles.map(o => o.serialize())
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
        if (data.obstacles) {
            data.obstacles.forEach((obstacleData, i) => {
                if (this.obstacles[i]) {
                    this.obstacles[i].restore(obstacleData);
                }
            });
        }
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
}
