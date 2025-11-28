/**
 * Dog Rescue Puzzle - Block Management
 * Handles polyomino block shapes (2-6 squares) and their behaviors
 */

/**
 * Utility function to rotate coordinates 90 degrees clockwise and normalize
 * @param {Array} coords - Array of [x, y] coordinate pairs
 * @returns {Array} Rotated and normalized coordinates
 */
function rotateCoords90CW(coords) {
    // Rotate 90 degrees clockwise: (x, y) -> (y, -x)
    const rotated = coords.map(([x, y]) => [y, -x]);
    
    // Normalize to start from (0, 0) - find min x and y
    const minX = Math.min(...rotated.map(([x, y]) => x));
    const minY = Math.min(...rotated.map(([x, y]) => y));
    
    // Shift all coords so minimum is at origin
    return rotated.map(([x, y]) => [x - minX, y - minY]);
}

// Define the standard polyomino shapes (2-6 squares)
const BLOCK_SHAPES = {
    // 2-square shapes (dominoes)
    I2: {
        coords: [[0, 0], [1, 0]],
        rotations: [
            [[0, 0], [1, 0]],  // Horizontal
            [[0, 0], [0, 1]]   // Vertical
        ]
    },

    // 3-square shapes (triominoes)
    I3: {
        coords: [[0, 0], [1, 0], [2, 0]],
        rotations: [
            [[0, 0], [1, 0], [2, 0]],  // Horizontal
            [[0, 0], [0, 1], [0, 2]]   // Vertical
        ]
    },
    L3: {
        coords: [[0, 0], [0, 1], [1, 1]],
        rotations: [
            [[0, 0], [0, 1], [1, 1]],  // Default
            [[0, 0], [1, 0], [0, 1]],  // 90 CW
            [[0, 0], [1, 0], [1, 1]],  // 180
            [[1, 0], [0, 1], [1, 1]]   // 270
        ]
    },

    // 4-square shapes (tetrominoes)
    I: {
        coords: [[0, 0], [1, 0], [2, 0], [3, 0]],
        rotations: [
            [[0, 0], [1, 0], [2, 0], [3, 0]],  // Horizontal
            [[0, 0], [0, 1], [0, 2], [0, 3]]   // Vertical
        ]
    },
    L: {
        coords: [[0, 0], [0, 1], [0, 2], [1, 2]],
        rotations: [
            [[0, 0], [0, 1], [0, 2], [1, 2]],  // Default
            [[0, 0], [1, 0], [2, 0], [0, 1]],  // 90 CW
            [[0, 0], [1, 0], [1, 1], [1, 2]],  // 180
            [[2, 0], [0, 1], [1, 1], [2, 1]]   // 270
        ]
    },
    J: {
        coords: [[1, 0], [1, 1], [1, 2], [0, 2]],
        rotations: [
            [[1, 0], [1, 1], [1, 2], [0, 2]],  // Default
            [[0, 0], [0, 1], [1, 1], [2, 1]],  // 90 CW
            [[0, 0], [1, 0], [0, 1], [0, 2]],  // 180
            [[0, 0], [1, 0], [2, 0], [2, 1]]   // 270
        ]
    },
    T: {
        coords: [[0, 0], [1, 0], [2, 0], [1, 1]],
        rotations: [
            [[0, 0], [1, 0], [2, 0], [1, 1]],  // Default (T pointing down)
            [[0, 0], [0, 1], [0, 2], [1, 1]],  // 90 CW (T pointing right)
            [[1, 0], [0, 1], [1, 1], [2, 1]],  // 180 (T pointing up)
            [[1, 0], [1, 1], [1, 2], [0, 1]]   // 270 (T pointing left)
        ]
    },
    O: {
        coords: [[0, 0], [1, 0], [0, 1], [1, 1]],
        rotations: [
            [[0, 0], [1, 0], [0, 1], [1, 1]]   // Square (no rotation needed)
        ]
    },

    // 5-square shapes (pentominoes)
    I5: {
        coords: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
        rotations: [
            [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],  // Horizontal
            [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]]   // Vertical
        ]
    },
    L5: {
        coords: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]],
        rotations: [
            [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]],  // Default
            [[0, 0], [1, 0], [2, 0], [3, 0], [0, 1]],  // 90 CW
            [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3]],  // 180
            [[3, 0], [0, 1], [1, 1], [2, 1], [3, 1]]   // 270
        ]
    },
    T5: {
        coords: [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],
        rotations: [
            [[0, 0], [1, 0], [2, 0], [1, 1], [1, 2]],  // Default (T pointing down)
            [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],  // 90 CW
            [[1, 0], [1, 1], [0, 2], [1, 2], [2, 2]],  // 180
            [[0, 1], [1, 1], [2, 0], [2, 1], [2, 2]]   // 270
        ]
    },
    P: {
        coords: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]],
        rotations: [
            [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]],  // Default
            [[0, 0], [1, 0], [2, 0], [1, 1], [2, 1]],  // 90 CW
            [[1, 0], [0, 1], [1, 1], [0, 2], [1, 2]],  // 180
            [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1]]   // 270
        ]
    },
    U: {
        coords: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]],
        rotations: [
            [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]],  // Default
            [[0, 0], [1, 0], [0, 1], [0, 2], [1, 2]],  // 90 CW
            [[0, 0], [1, 0], [2, 0], [0, 1], [2, 1]],  // 180
            [[0, 0], [1, 0], [1, 1], [0, 2], [1, 2]]   // 270
        ]
    },

    // 6-square shapes (hexominoes)
    I6: {
        coords: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
        rotations: [
            [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],  // Horizontal
            [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]]   // Vertical
        ]
    },
    L6: {
        coords: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4]],
        rotations: [
            [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4]],  // Default
            [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [0, 1]],  // 90 CW
            [[0, 0], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],  // 180
            [[4, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1]]   // 270
        ]
    },
    C: {
        coords: [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [1, 2]],
        rotations: [
            [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2], [1, 2]],  // Default
            [[0, 0], [1, 0], [0, 1], [0, 2], [1, 2], [2, 2]],  // 90 CW
            [[1, 0], [2, 0], [2, 1], [0, 2], [1, 2], [2, 2]],  // 180
            [[0, 0], [1, 0], [2, 0], [2, 1], [1, 2], [2, 2]]   // 270
        ]
    }
};

/**
 * Block class - Represents a single polyomino block on the board
 */
class Block {
    constructor(config) {
        this.id = config.id;
        this.color = config.color;
        this.required = config.required;  // Number of dogs to rescue
        this.rescued = 0;  // Dogs rescued so far
        this.shape = config.shape;
        this.x = config.x;
        this.y = config.y;
        this.rotatable = config.rotatable !== false;  // Default to true
        this.rotationIndex = 0;
        
        // Use provided coords or get from shape definition
        if (config.coords) {
            this.baseCoords = config.coords;
        } else {
            this.baseCoords = BLOCK_SHAPES[this.shape].coords;
        }
        
        this.coords = [...this.baseCoords];
    }

    /**
     * Get absolute positions of all tiles in this block
     */
    getAbsoluteCoords() {
        return this.coords.map(([dx, dy]) => [this.x + dx, this.y + dy]);
    }

    /**
     * Check if this block occupies a specific tile
     */
    occupiesTile(x, y) {
        return this.getAbsoluteCoords().some(([bx, by]) => bx === x && by === y);
    }

    /**
     * Rotate the block (if allowed)
     */
    rotate() {
        if (!this.rotatable) return false;
        
        // Check if shape has predefined rotations
        const shapeData = BLOCK_SHAPES[this.shape];
        if (shapeData && shapeData.rotations) {
            const rotations = shapeData.rotations;
            this.rotationIndex = (this.rotationIndex + 1) % rotations.length;
            this.coords = [...rotations[this.rotationIndex]];
        } else {
            // For custom shapes without predefined rotations, calculate 90-degree CW rotation
            this.coords = rotateCoords90CW(this.coords);
            this.rotationIndex = (this.rotationIndex + 1) % 4;
        }
        return true;
    }

    /**
     * Get remaining dogs to rescue
     */
    getRemainingDogs() {
        return this.required - this.rescued;
    }

    /**
     * Rescue a dog
     * @returns {boolean} True if block should disappear (all dogs rescued)
     */
    rescueDog() {
        this.rescued++;
        return this.rescued >= this.required;
    }

    /**
     * Check if block is complete (all dogs rescued)
     */
    isComplete() {
        return this.rescued >= this.required;
    }

    /**
     * Move block to new position
     */
    moveTo(x, y) {
        this.x = x;
        this.y = y;
    }

    /**
     * Get bounding box of the block
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
     * Clone this block
     */
    clone() {
        const cloned = new Block({
            id: this.id,
            color: this.color,
            required: this.required,
            shape: this.shape,
            x: this.x,
            y: this.y,
            rotatable: this.rotatable,
            coords: [...this.baseCoords]
        });
        cloned.rescued = this.rescued;
        cloned.rotationIndex = this.rotationIndex;
        cloned.coords = [...this.coords];
        return cloned;
    }

    /**
     * Serialize block state for undo
     */
    serialize() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            rescued: this.rescued,
            rotationIndex: this.rotationIndex,
            coords: [...this.coords]
        };
    }

    /**
     * Restore block state from serialized data
     */
    restore(data) {
        this.x = data.x;
        this.y = data.y;
        this.rescued = data.rescued;
        this.rotationIndex = data.rotationIndex;
        this.coords = [...data.coords];
    }
}
