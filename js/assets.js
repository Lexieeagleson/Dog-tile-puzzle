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

    /**
     * Safely encode SVG string to base64 data URL
     * Handles potential encoding issues with special characters
     */
    svgToDataUrl: function(svg) {
        try {
            // Use encodeURIComponent for safer encoding, then convert to base64
            const encoded = btoa(unescape(encodeURIComponent(svg)));
            return 'data:image/svg+xml;base64,' + encoded;
        } catch (e) {
            // Fallback to URL-encoded data URI if base64 fails
            console.warn('Base64 encoding failed, using URL encoding:', e);
            return 'data:image/svg+xml,' + encodeURIComponent(svg);
        }
    },

    // Generate SVG block tile - streamlined sleek design
    generateBlockTile: function(color, number) {
        const c = this.colors[color] || this.colors.red;
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <defs>
                    <linearGradient id="mainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${c.light};stop-opacity:1" />
                        <stop offset="50%" style="stop-color:${c.main};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${c.dark};stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="gloss" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:white;stop-opacity:0.4" />
                        <stop offset="50%" style="stop-color:white;stop-opacity:0.1" />
                        <stop offset="100%" style="stop-color:white;stop-opacity:0" />
                    </linearGradient>
                    <clipPath id="blockClip">
                        <rect x="3" y="3" width="44" height="44" rx="8"/>
                    </clipPath>
                    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.3"/>
                    </filter>
                </defs>
                <!-- Main block body -->
                <rect x="3" y="3" width="44" height="44" rx="8" fill="url(#mainGrad)" filter="url(#shadow)"/>
                <!-- Glossy overlay for sleek look, clipped to block shape -->
                <rect x="3" y="3" width="44" height="22" fill="url(#gloss)" clip-path="url(#blockClip)"/>
                <!-- Inner highlight border -->
                <rect x="5" y="5" width="40" height="40" rx="6" fill="none" stroke="${c.light}" stroke-width="1" opacity="0.5"/>
                ${number ? `
                <!-- Number badge -->
                <circle cx="25" cy="28" r="12" fill="rgba(0,0,0,0.25)"/>
                <text x="25" y="33" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">${number}</text>
                ` : ''}
            </svg>
        `;
        return this.svgToDataUrl(svg);
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
        return this.svgToDataUrl(svg);
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
        return this.svgToDataUrl(svg);
    },

    // Generate empty floor tile
    generateFloorTile: function() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <rect width="50" height="50" fill="#f5f5f5"/>
                <rect x="0" y="0" width="50" height="50" fill="none" stroke="#e0e0e0" stroke-width="1"/>
            </svg>
        `;
        return this.svgToDataUrl(svg);
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
        return this.svgToDataUrl(svg);
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
        
        // Load block tiles for each color and number (1-6 for blocks with 2-6 squares)
        for (const color of Object.keys(this.colors)) {
            for (let num = 1; num <= 6; num++) {
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
