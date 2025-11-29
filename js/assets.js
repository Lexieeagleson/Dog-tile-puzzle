/**
 * Dog Rescue Puzzle - Pre-generated SVG Assets
 * All images are generated as SVG and converted to data URLs
 * Modern design with WCAG-compliant contrast ratios
 */

const ASSETS = {
    // Modern color palette for blocks and dogs - WCAG AA compliant
    colors: {
        red: { main: '#DC2626', dark: '#991B1B', light: '#F87171', accent: '#FECACA' },
        blue: { main: '#2563EB', dark: '#1D4ED8', light: '#60A5FA', accent: '#BFDBFE' },
        green: { main: '#16A34A', dark: '#15803D', light: '#4ADE80', accent: '#BBF7D0' },
        yellow: { main: '#CA8A04', dark: '#A16207', light: '#FACC15', accent: '#FEF08A' },
        purple: { main: '#9333EA', dark: '#7E22CE', light: '#C084FC', accent: '#E9D5FF' },
        orange: { main: '#EA580C', dark: '#C2410C', light: '#FB923C', accent: '#FED7AA' }
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

    // Generate SVG block tile - modern flat design with subtle depth
    generateBlockTile: function(color, number) {
        const c = this.colors[color] || this.colors.red;
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <defs>
                    <linearGradient id="mainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${c.light};stop-opacity:1" />
                        <stop offset="40%" style="stop-color:${c.main};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${c.dark};stop-opacity:1" />
                    </linearGradient>
                    <linearGradient id="gloss" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:white;stop-opacity:0.35" />
                        <stop offset="40%" style="stop-color:white;stop-opacity:0.1" />
                        <stop offset="100%" style="stop-color:white;stop-opacity:0" />
                    </linearGradient>
                    <clipPath id="blockClip">
                        <rect x="3" y="3" width="44" height="44" rx="10"/>
                    </clipPath>
                    <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
                        <feOffset dx="0" dy="2" result="offsetBlur"/>
                        <feComposite in="SourceGraphic" in2="offsetBlur" operator="over"/>
                    </filter>
                </defs>
                <!-- Main block body with modern rounded corners -->
                <rect x="3" y="3" width="44" height="44" rx="10" fill="url(#mainGrad)"/>
                <!-- Subtle inner glow -->
                <rect x="4" y="4" width="42" height="42" rx="9" fill="none" stroke="${c.accent}" stroke-width="1" opacity="0.5"/>
                <!-- Glossy overlay for depth -->
                <rect x="3" y="3" width="44" height="20" fill="url(#gloss)" clip-path="url(#blockClip)"/>
                ${number ? `
                <!-- Number badge with better contrast -->
                <circle cx="25" cy="28" r="13" fill="rgba(0,0,0,0.3)"/>
                <circle cx="25" cy="28" r="11" fill="rgba(255,255,255,0.15)"/>
                <text x="25" y="33" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="700" fill="white" text-anchor="middle" style="text-shadow: 0 1px 2px rgba(0,0,0,0.3)">${number}</text>
                ` : ''}
            </svg>
        `;
        return this.svgToDataUrl(svg);
    },

    // Generate cute dog sprite - modern flat design with expressive features
    generateDogSprite: function(color) {
        const c = this.colors[color] || this.colors.red;
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <defs>
                    <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:${c.light};stop-opacity:1" />
                        <stop offset="100%" style="stop-color:${c.main};stop-opacity:1" />
                    </linearGradient>
                </defs>
                <!-- Body -->
                <ellipse cx="25" cy="35" rx="15" ry="12" fill="url(#bodyGrad)"/>
                <!-- Head -->
                <circle cx="25" cy="18" r="14" fill="${c.main}"/>
                <circle cx="25" cy="16" r="13" fill="url(#bodyGrad)"/>
                <!-- Left ear -->
                <ellipse cx="12" cy="10" rx="6" ry="10" fill="${c.dark}" transform="rotate(-20, 12, 10)"/>
                <ellipse cx="13" cy="11" rx="4" ry="7" fill="${c.main}" transform="rotate(-20, 13, 11)"/>
                <!-- Right ear -->
                <ellipse cx="38" cy="10" rx="6" ry="10" fill="${c.dark}" transform="rotate(20, 38, 10)"/>
                <ellipse cx="37" cy="11" rx="4" ry="7" fill="${c.main}" transform="rotate(20, 37, 11)"/>
                <!-- Face (lighter muzzle area) -->
                <ellipse cx="25" cy="22" rx="9" ry="7" fill="${c.accent}"/>
                <!-- Left eye - larger for cuter look -->
                <ellipse cx="19" cy="15" rx="4.5" ry="5" fill="white"/>
                <circle cx="20" cy="15" r="2.5" fill="#1F2937"/>
                <circle cx="21" cy="14" r="1.2" fill="white"/>
                <!-- Right eye -->
                <ellipse cx="31" cy="15" rx="4.5" ry="5" fill="white"/>
                <circle cx="32" cy="15" r="2.5" fill="#1F2937"/>
                <circle cx="33" cy="14" r="1.2" fill="white"/>
                <!-- Nose - heart-shaped -->
                <path d="M 25 21 C 22 19, 20 22, 25 25 C 30 22, 28 19, 25 21" fill="#1F2937"/>
                <ellipse cx="25" cy="20.5" rx="1.5" ry="1" fill="#4B5563"/>
                <!-- Mouth - happy smile -->
                <path d="M 22 26 Q 25 29, 28 26" fill="none" stroke="#1F2937" stroke-width="1.5" stroke-linecap="round"/>
                <!-- Tongue -->
                <ellipse cx="25" cy="28" rx="2" ry="2.5" fill="#F87171"/>
                <ellipse cx="25" cy="27.5" rx="1" ry="1.5" fill="#FECACA"/>
                <!-- Tail - wagging -->
                <path d="M 38 33 Q 46 26, 44 38" fill="none" stroke="${c.dark}" stroke-width="4" stroke-linecap="round"/>
                <!-- Collar -->
                <rect x="17" y="30" width="16" height="3" rx="1.5" fill="${c.dark}"/>
                <circle cx="25" cy="32" r="2" fill="#FDE047"/>
            </svg>
        `;
        return this.svgToDataUrl(svg);
    },

    // Generate wall tile - modern stone texture
    generateWallTile: function() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <defs>
                    <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#6B7280;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#4B5563;stop-opacity:1" />
                    </linearGradient>
                    <pattern id="stonePattern" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
                        <rect width="25" height="25" fill="#52525B"/>
                        <rect x="1" y="1" width="22" height="10" fill="#71717A" rx="2"/>
                        <rect x="13" y="13" width="11" height="11" fill="#71717A" rx="2"/>
                        <rect x="1" y="13" width="10" height="11" fill="#A1A1AA" rx="2"/>
                    </pattern>
                </defs>
                <!-- Base texture -->
                <rect width="50" height="50" fill="url(#stonePattern)"/>
                <!-- Modern border with rounded corners -->
                <rect x="1" y="1" width="48" height="48" rx="4" fill="none" stroke="#3F3F46" stroke-width="2"/>
                <!-- Subtle highlight -->
                <rect x="2" y="2" width="46" height="46" rx="3" fill="none" stroke="#9CA3AF" stroke-width="1" opacity="0.3"/>
            </svg>
        `;
        return this.svgToDataUrl(svg);
    },

    // Generate empty floor tile - clean modern grid
    generateFloorTile: function() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
                <defs>
                    <linearGradient id="floorGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#FAFAFA;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#F4F4F5;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="50" height="50" fill="url(#floorGrad)"/>
                <rect x="0" y="0" width="50" height="50" fill="none" stroke="#E4E4E7" stroke-width="1"/>
            </svg>
        `;
        return this.svgToDataUrl(svg);
    },

    // Generate victory celebration icon - modern star design
    generateVictoryIcon: function() {
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="starGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" style="stop-color:#FDE047;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:1" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                <!-- Main star with glow -->
                <polygon points="50,5 61,35 95,35 68,55 78,90 50,70 22,90 32,55 5,35 39,35" 
                    fill="url(#starGrad)" stroke="#D97706" stroke-width="2" filter="url(#glow)"/>
                <!-- Sparkles - modern circular design -->
                <circle cx="20" cy="20" r="4" fill="#FDE047" opacity="0.9"/>
                <circle cx="80" cy="25" r="5" fill="#FBBF24" opacity="0.8"/>
                <circle cx="15" cy="70" r="3" fill="#FDE047" opacity="0.7"/>
                <circle cx="85" cy="75" r="4" fill="#FBBF24" opacity="0.8"/>
                <!-- Inner star highlight -->
                <polygon points="50,15 58,35 78,35 62,48 68,70 50,58 32,70 38,48 22,35 42,35" 
                    fill="white" opacity="0.2"/>
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
