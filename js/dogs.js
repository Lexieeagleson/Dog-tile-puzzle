/**
 * Dog Rescue Puzzle - Dog Management
 * Handles dog entities and rescue logic
 */

/**
 * Dog class - Represents a dog to be rescued
 */
class Dog {
    constructor(config) {
        this.color = config.color;
        this.x = config.x;
        this.y = config.y;
        this.rescued = false;
        this.rescueAnimation = 0;  // Animation state (0 = not animating, 1+ = animating)
    }

    /**
     * Check if dog is at a specific position
     */
    isAt(x, y) {
        return this.x === x && this.y === y;
    }

    /**
     * Mark dog as rescued
     */
    rescue() {
        this.rescued = true;
        this.rescueAnimation = 1;
    }

    /**
     * Check if dog can be rescued by a block of given color
     */
    canBeRescuedBy(blockColor) {
        return !this.rescued && this.color === blockColor;
    }

    /**
     * Clone this dog
     */
    clone() {
        const cloned = new Dog({
            color: this.color,
            x: this.x,
            y: this.y
        });
        cloned.rescued = this.rescued;
        return cloned;
    }

    /**
     * Serialize dog state for undo
     */
    serialize() {
        return {
            color: this.color,
            x: this.x,
            y: this.y,
            rescued: this.rescued
        };
    }

    /**
     * Restore dog state from serialized data
     */
    restore(data) {
        this.rescued = data.rescued;
    }
}

/**
 * DogManager - Manages all dogs in a level
 */
class DogManager {
    constructor() {
        this.dogs = [];
    }

    /**
     * Load dogs from level data
     */
    loadFromLevel(dogsData) {
        this.dogs = dogsData.map(d => new Dog(d));
    }

    /**
     * Get all active (not rescued) dogs
     */
    getActiveDogs() {
        return this.dogs.filter(d => !d.rescued);
    }

    /**
     * Get dog at specific position
     */
    getDogAt(x, y) {
        return this.dogs.find(d => !d.rescued && d.x === x && d.y === y);
    }

    /**
     * Check if all dogs are rescued (win condition)
     */
    allRescued() {
        return this.dogs.every(d => d.rescued);
    }

    /**
     * Count remaining dogs
     */
    countRemaining() {
        return this.dogs.filter(d => !d.rescued).length;
    }

    /**
     * Count remaining dogs of a specific color
     */
    countRemainingByColor(color) {
        return this.dogs.filter(d => !d.rescued && d.color === color).length;
    }

    /**
     * Serialize all dogs for undo
     */
    serialize() {
        return this.dogs.map(d => d.serialize());
    }

    /**
     * Restore dogs state from serialized data
     */
    restore(data) {
        data.forEach((dogData, i) => {
            if (this.dogs[i]) {
                this.dogs[i].restore(dogData);
            }
        });
    }

    /**
     * Reset all dogs to not rescued
     */
    reset() {
        this.dogs.forEach(d => {
            d.rescued = false;
            d.rescueAnimation = 0;
        });
    }
}
