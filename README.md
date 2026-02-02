# PrereqTree

An interactive tool for visualizing course prerequisites as a directed acyclic graph. Plan your learning path by adding courses and their dependencies, then explore the graph to understand the order you need to tackle them.

**Live demo:** [dhevinnandyala.com/prerequisite-visualizer](https://dhevinnandyala.com/prerequisite-visualizer)

## Features

- **Graph visualization** — Dagre-based automatic layout with React Flow, bezier edges, and arrow markers
- **Multiple workspaces** — Organize different course plans separately
- **Color themes** — Ocean, Sunset, and Forest color schemes for graph nodes
- **Dark mode** — Light, Dark, and System appearance options
- **Import/Export** — Save and load workspaces as JSON files (drag-and-drop supported)
- **Cycle detection** — Prevents circular prerequisite chains
- **Regenerate layout** — Reset node positions after dragging with one click
- **Responsive** — Collapsible sidebar, works on mobile
- **Persistent storage** — All data saved in browser localStorage

## Tech Stack

- React 19 + TypeScript (strict)
- Vite
- Zustand (state management)
- Tailwind CSS v4
- @xyflow/react + @dagrejs/dagre (graph layout)

## Getting Started

Requires [Node.js](https://nodejs.org/) v20+ and npm.

```bash
git clone https://github.com/dhevinnandyala/prerequisite-visualizer.git
cd prerequisite-visualizer
npm install
npm run dev
```

Visit [http://localhost:5173/prerequisite-visualizer/](http://localhost:5173/prerequisite-visualizer/)

## Build

```bash
npm run build
```

Type-check only:

```bash
npm run type-check
```

## Contributing

Contributions are welcome! Feel free to open issues or pull requests.

## Author

Created by [Dhevin Nandyala](https://dhevinnandyala.com).
