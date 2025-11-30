# 🐕 Dog Rescue Puzzle Game

A fun browser-based puzzle game where you move color-coded Tetris-like blocks to rescue matching-color dogs!

## 🎮 How to Play

1. **Select a level** from the level selection screen
2. **Click and drag** blocks to move them around the grid
3. **Rescue dogs** by moving blocks of the same color onto them
4. Each block has a **number** showing how many dogs it needs to rescue
5. When a block rescues all its required dogs, it **disappears**
6. **Win** by rescuing all dogs in the level!

### Controls
- **Click + Drag**: Move blocks
- **Double-click**: Rotate blocks (if rotation is enabled)
- **Undo button**: Undo your last move
- **Reset button**: Restart the current level

## 🎨 Modern UI Design

The game features a modern, accessible UI design with:

### Color Scheme
The UI uses a carefully crafted color palette that meets WCAG AA accessibility standards:

| Element | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| Primary | Indigo | `#4F46E5` | Buttons, accents |
| Secondary | Violet | `#7C3AED` | Backgrounds, gradients |
| Accent | Cyan | `#06B6D4` | Highlights, focus states |
| Success | Emerald | `#10B981` | Success states, UI buttons |
| Warning | Amber | `#F59E0B` | Replay button |

### Game Asset Colors
| Color | Main | Dark | Light | Contrast |
|-------|------|------|-------|----------|
| Red | `#DC2626` | `#991B1B` | `#F87171` | WCAG AA |
| Blue | `#2563EB` | `#1D4ED8` | `#60A5FA` | WCAG AA |
| Green | `#16A34A` | `#15803D` | `#4ADE80` | WCAG AA |
| Yellow | `#CA8A04` | `#A16207` | `#FACC15` | WCAG AA |
| Purple | `#9333EA` | `#7E22CE` | `#C084FC` | WCAG AA |
| Orange | `#EA580C` | `#C2410C` | `#FB923C` | WCAG AA |

### Accessibility Features
- **High contrast ratios**: All text meets WCAG AA standards (minimum 4.5:1 for normal text)
- **Focus indicators**: Visible focus states for keyboard navigation
- **Dark mode support**: Automatic dark mode based on system preferences
- **Reduced motion**: Respects `prefers-reduced-motion` for users sensitive to animations
- **Semantic HTML**: Proper heading structure and ARIA attributes

### Design Elements
- **Modern gradients**: Subtle linear gradients for depth
- **Consistent border radius**: Unified rounded corners throughout
- **Shadow system**: Layered shadows for visual hierarchy
- **Responsive layout**: Adapts to mobile and desktop screens

## 🎨 Game Features

- **Color-coded mechanics**: Red blocks rescue red dogs, blue blocks rescue blue dogs, etc.
- **Multiple block sizes**: Blocks can be 2-6 squares (dominoes, triominoes, tetrominoes, pentominoes, hexominoes)
- **Various block shapes**: I, L, J, T, O shapes and more (I2, I3, L3, I5, L5, T5, P, U, I6, L6, C)
- **30 challenging levels** with increasing difficulty
- **Beautiful SVG graphics** generated and embedded in the game
- **Animations** for dog rescues and block disappearances
- **Mobile-friendly** with touch support

## 🚀 Running Locally

### Option 1: Direct file access
Simply open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge).

### Option 2: Local server (recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (npx)
npx serve

# Using PHP
php -S localhost:8000
```
Then open `http://localhost:8000` in your browser.

## 🌐 Play Online

The game is automatically deployed to GitHub Pages when changes are merged to the main branch.

Play now at: `https://[username].github.io/Dog-tile-puzzle/`

## 📁 Project Structure

```
Dog-tile-puzzle/
├── index.html          # Main HTML file
├── style.css           # Game styles
├── js/
│   ├── assets.js       # SVG asset generation
│   ├── blocks.js       # Block class and shapes
│   ├── dogs.js         # Dog class and management
│   ├── board.js        # Game board logic
│   ├── render.js       # Canvas rendering
│   └── game.js         # Main game controller + levels
├── assets/             # Asset directories (SVGs are embedded)
│   ├── blocks/
│   ├── dogs/
│   ├── ui/
│   ├── backgrounds/
│   └── effects/
├── levels/             # Level directory (levels are embedded)
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Pages deployment
├── LICENSE             # Apache 2.0 License
└── README.md           # This file
```

## 🧩 Level Format

Levels are defined in JSON format in `js/game.js`:

```json
{
  "name": "Level 1",
  "width": 8,
  "height": 8,
  "blocks": [
    {
      "id": "r1",
      "color": "red",
      "required": 2,
      "shape": "L",
      "coords": [[0,0],[0,1],[0,2],[1,2]],
      "x": 1,
      "y": 2,
      "rotatable": true
    }
  ],
  "dogs": [
    {"color": "red", "x": 5, "y": 4}
  ],
  "walls": [
    {"x": 3, "y": 3}
  ]
}
```

## 🎨 In-Game Color Palette

| Color  | Block & Dog | Hex (Main) | Use |
|--------|-------------|------------|-----|
| Red    | 🔴 | `#DC2626` | Primary color |
| Blue   | 🔵 | `#2563EB` | Primary color |
| Green  | 🟢 | `#16A34A` | Primary color |
| Yellow | 🟡 | `#CA8A04` | Secondary color |
| Purple | 🟣 | `#9333EA` | Secondary color |
| Orange | 🟠 | `#EA580C` | Secondary color |

## 🛠️ Technology

- **Pure JavaScript** - No frameworks required
- **HTML5 Canvas** - For smooth rendering
- **SVG Graphics** - Scalable, generated assets
- **CSS3** - Modern styling with CSS custom properties, gradients, and animations
- **Accessibility** - WCAG AA compliant color contrast, keyboard navigation, reduced motion support

## 📜 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Add new levels
- Improve graphics
- Fix bugs
- Add new features

---

Made with ❤️ for puzzle and dog lovers!
