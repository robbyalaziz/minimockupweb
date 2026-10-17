# Mini Figma 🎨

A fast, responsive, and feature-packed in-browser vector design tool built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**.

![Mini Figma Interface](https://raw.githubusercontent.com/morluto/mini-figma/main/preview.png)

## ✨ Features

- **Vector Canvas Engine**:
  - Interactive infinite canvas with center-anchored zooming (`⌘+`, `⌘-`, `⌘0`, `⇧1`) and smooth trackpad panning (`Space + Drag` or Hand tool `H`).
  - Smart alignment snapping guides (magenta HUD lines).
  - 8-point resize handles with dimensions badge.
  - Multi-selection with marquee dragging and Shift/Cmd-clicking.

- **Design Tools**:
  - 📐 **Frames / Artboards** (`F`) with preset screen sizes (iPhone 16 Pro, MacBook Pro, Desktop 1440p, iMac 4K).
  - ⬛ **Rectangles** (`R`) with independent corner radius controls.
  - ⭕ **Ellipses** (`O`).
  - 🔤 **Text** (`T`) with in-place live editing and Google Fonts picker.
  - ➖ **Lines** (`L`) and **Directional Arrows** (`A`).
  - ⭐ **Stars / Badges** (`S`).
  - 🖼️ **Image Placement** (`⇧⌘K`): File picker, Drag & Drop from desktop, and direct Clipboard paste (`⌘V`) with `cover` / `contain` / `fill` options.

- **Typography & Font Picker**:
  - Direct integration with Google Fonts: *Inter, Plus Jakarta Sans, Poppins, Outfit, Roboto, Montserrat, Space Grotesk, Playfair Display, JetBrains Mono, Fira Code*.
  - Text alignment controls (Left, Center, Right).

- **Grouping & Hierarchy**:
  - Group layers (`⌘G`) and Ungroup (`⇧⌘G`).
  - Synchronized group movement and bounding box.
  - Context menu and layer panel hierarchy.

- **Alignment & Distribution**:
  - Single-click and keyboard alignment (`⌥A`, `⌥H`, `⌥D`, `⌥W`, `⌥V`, `⌥S`).
  - Horizontal & Vertical distribution spacing.

- **Import & Export**:
  - Export to high-resolution **Retina 2x PNG**.
  - Export clean, scalable **vector SVG**.
  - Save and load projects as `.json`.
  - Copy generated **Tailwind CSS / React JSX** code for any layer.

- **Multi-Project Tabs & Presentation Mode**:
  - Switch between multiple open design documents.
  - Fullscreen presentation mode with one-click Zoom to Fit.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/morluto/mini-figma.git
cd mini-figma

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## ⌨️ Shortcuts Cheatsheet

| Shortcut | Action |
| :--- | :--- |
| `V` | Move / Select Tool |
| `H` / `Space` | Hand / Pan Canvas |
| `F` | Frame (Artboard) |
| `R` | Rectangle |
| `O` | Ellipse |
| `T` | Text Block |
| `L` | Line Segment |
| `A` | Arrow |
| `⇧⌘K` | Place Image... |
| `⌘G` | Group Selection |
| `⇧⌘G` | Ungroup |
| `⌘Z` / `⇧⌘Z` | Undo / Redo |
| `⌘D` | Duplicate Selection |
| `Delete` / `⌫` | Delete Selection |
| `⌘+` / `⌘-` | Zoom In / Zoom Out |
| `⌘0` | Reset Zoom to 100% |
| `⇧1` | Zoom to Fit Artboards |
| `?` | Keyboard Shortcuts Cheatsheet |

## 📄 License

MIT License. Created by [Robby](https://github.com/morluto).
