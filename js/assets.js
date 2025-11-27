/**
 * Dog Rescue Puzzle - Pre-generated SVG Assets
 * All images are generated as SVG and converted to data URLs
 */

const ASSETS = {
    // Color palette for blocks and dogs
    colors: {
        red: { main: '#e53935', dark: '#b71c1c', light: '#ef5350' },
        blue: { main: '#1e88e5', dark: '#0d47a1', light: '#42a5f5' },
        green: { main: '#43a047', dark: '#1b5e20', light: '#66bb6a' },
        yellow: { main: '#fdd835', dark: '#f57f17', light: '#ffee58' },
        purple: { main: '#8e24aa', dark: '#4a148c', light: '#ab47bc' },
        orange: { main: '#ff7043', dark: '#bf360c', light: '#ff8a65' }
    },

    // Generate SVG block tile
    generateBlockTile: function(color, number) {
        const c = this.colors[color] || this.colors.red;
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:${c.light};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${c.dark};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect x="2" y="2" width="46" height="46" rx="5" fill="url(#grad)" stroke="${c.dark}" stroke-width="2"/>
                <rect x="6" y="6" width="38" height="38" rx="3" fill="${c.main}" opacity="0.8"/>
                ${number ? `<text x="25" y="33" font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="white" text-anchor="middle" stroke="${c.dark}" stroke-width="1">${number}</text>` : ''}
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    },

    // Generate cute dog sprite
    generateDogSprite: function(color) {
        const c = this.colors[color] || this.colors.red;
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <!-- Body -->
                <ellipse cx="25" cy="35" rx="15" ry="12" fill="${c.main}"/>
                <!-- Head -->
                <circle cx="25" cy="18" r="14" fill="${c.main}"/>
                <!-- Left ear -->
                <ellipse cx="12" cy="10" rx="6" ry="10" fill="${c.dark}" transform="rotate(-20, 12, 10)"/>
                <!-- Right ear -->
                <ellipse cx="38" cy="10" rx="6" ry="10" fill="${c.dark}" transform="rotate(20, 38, 10)"/>
                <!-- Face (lighter area) -->
                <ellipse cx="25" cy="22" rx="9" ry="7" fill="${c.light}"/>
                <!-- Left eye -->
                <circle cx="20" cy="15" r="4" fill="white"/>
                <circle cx="21" cy="15" r="2.5" fill="#333"/>
                <circle cx="22" cy="14" r="1" fill="white"/>
                <!-- Right eye -->
                <circle cx="30" cy="15" r="4" fill="white"/>
                <circle cx="31" cy="15" r="2.5" fill="#333"/>
                <circle cx="32" cy="14" r="1" fill="white"/>
                <!-- Nose -->
                <ellipse cx="25" cy="22" rx="4" ry="3" fill="#333"/>
                <ellipse cx="25" cy="21" rx="1.5" ry="1" fill="#666"/>
                <!-- Mouth -->
                <path d="M 22 26 Q 25 29, 28 26" fill="none" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
                <!-- Tongue -->
                <ellipse cx="25" cy="28" rx="2.5" ry="3" fill="#ff6b6b"/>
                <!-- Tail -->
                <path d="M 38 35 Q 48 30, 45 40" fill="none" stroke="${c.dark}" stroke-width="4" stroke-linecap="round"/>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    },

    // Generate wall tile
    generateWallTile: function() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <defs>
                    <pattern id="stone" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
                        <rect width="25" height="25" fill="#757575"/>
                        <rect x="1" y="1" width="23" height="11" fill="#9e9e9e" rx="2"/>
                        <rect x="13" y="14" width="11" height="10" fill="#9e9e9e" rx="2"/>
                        <rect x="1" y="14" width="10" height="10" fill="#bdbdbd" rx="2"/>
                    </pattern>
                </defs>
                <rect width="50" height="50" fill="url(#stone)"/>
                <rect x="1" y="1" width="48" height="48" fill="none" stroke="#424242" stroke-width="2"/>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    },

    // Generate empty floor tile
    generateFloorTile: function() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <rect width="50" height="50" fill="#f5f5f5"/>
                <rect x="0" y="0" width="50" height="50" fill="none" stroke="#e0e0e0" stroke-width="1"/>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    },

    // Generate victory celebration icon
    generateVictoryIcon: function() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                <!-- Stars -->
                <polygon points="50,5 61,35 95,35 68,55 78,90 50,70 22,90 32,55 5,35 39,35" fill="#ffd700" stroke="#ff9800" stroke-width="2"/>
                <!-- Sparkles -->
                <circle cx="20" cy="20" r="3" fill="#ffeb3b"/>
                <circle cx="80" cy="25" r="4" fill="#ffeb3b"/>
                <circle cx="15" cy="70" r="3" fill="#ffeb3b"/>
                <circle cx="85" cy="75" r="3" fill="#ffeb3b"/>
            </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    },

    // Cache for loaded images
    imageCache: {},

    // Load image and cache it
    loadImage: function(key, dataUrl) {
        return new Promise((resolve) => {
            if (this.imageCache[key]) {
                resolve(this.imageCache[key]);
                return;
            }
            const img = new Image();
            img.onload = () => {
                this.imageCache[key] = img;
                resolve(img);
            };
            img.onerror = () => {
                console.error('Failed to load image:', key);
                resolve(null);
            };
            img.src = dataUrl;
        });
    },

    // Pre-load all assets
    preloadAssets: async function() {
        const promises = [];
        
        // Load block tiles for each color and number
        for (const color of Object.keys(this.colors)) {
            for (let num = 1; num <= 4; num++) {
                const key = `block_${color}_${num}`;
                promises.push(this.loadImage(key, this.generateBlockTile(color, num)));
            }
            // Also load without number
            const keyNoNum = `block_${color}_0`;
            promises.push(this.loadImage(keyNoNum, this.generateBlockTile(color, 0)));
        }
        
        // Load dog sprites for each color
        for (const color of Object.keys(this.colors)) {
            const key = `dog_${color}`;
            promises.push(this.loadImage(key, this.generateDogSprite(color)));
        }
        
        // Load wall tile
        promises.push(this.loadImage('wall', this.generateWallTile()));
        
        // Load floor tile
        promises.push(this.loadImage('floor', this.generateFloorTile()));
        
        // Load victory icon
        promises.push(this.loadImage('victory', this.generateVictoryIcon()));
        
        await Promise.all(promises);
        console.log('All assets preloaded');
    },

    // Get cached image
    getImage: function(key) {
        return this.imageCache[key] || null;
    }
};
