/**
 * Dog Rescue Puzzle - Block Management
 * Handles polyomino block shapes (I, L, J, T) and their behaviors
 */

// Define the standard polyomino shapes (no Z, S, or O)
const BLOCK_SHAPES = {
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
        
        const rotations = BLOCK_SHAPES[this.shape].rotations;
        this.rotationIndex = (this.rotationIndex + 1) % rotations.length;
        this.coords = [...rotations[this.rotationIndex]];
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
