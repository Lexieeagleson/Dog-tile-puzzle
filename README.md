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

## 🎨 Game Features

- **Color-coded mechanics**: Red blocks rescue red dogs, blue blocks rescue blue dogs, etc.
- **4 block shapes**: I, L, J, and T (no Z, S, or O shapes)
- **10 challenging levels** with increasing difficulty
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
  "width": 10,
  "height": 10,
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

## 🎨 Color Palette

| Color  | Block & Dog | Use |
|--------|-------------|-----|
| Red    | 🔴 | Primary color |
| Blue   | 🔵 | Primary color |
| Green  | 🟢 | Primary color |
| Yellow | 🟡 | Secondary color |
| Purple | 🟣 | Secondary color |
| Orange | 🟠 | Secondary color |

## 🛠️ Technology

- **Pure JavaScript** - No frameworks required
- **HTML5 Canvas** - For smooth rendering
- **SVG Graphics** - Scalable, generated assets
- **CSS3** - Modern styling with gradients and animations

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
