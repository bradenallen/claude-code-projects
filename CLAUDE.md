# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

- **Platform:** Windows 11, Git Bash shell (use Unix syntax — forward slashes, `/dev/null`, etc.)
- **Node.js:** Not installed. All apps are built as self-contained HTML files using CDN-hosted libraries.
- **Git/GitHub:** Configured. Always commit and push after meaningful changes using clean, descriptive commit messages. Remote: `https://github.com/bradenallen/claude-code-projects`

## Running / Opening Files

```bash
start "filename.html"   # opens in default browser
```

No build step, no dev server — files run directly in the browser.

## Architecture

This is a collection of standalone browser apps. Each app is a **single `.html` file** that bundles markup, styles, and logic together, loading dependencies via CDN at runtime.

### Dependency pattern (used in autoapply.html)

```html
<script src="https://unpkg.com/react@18/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://unpkg.com/recharts@2/umd/Recharts.js"></script>
<script src="https://unpkg.com/lucide-react@0.417.0/dist/umd/lucide-react.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
```

JSX is transpiled in-browser by Babel standalone. UMD globals replace ES module imports:
- `React` → `{ useState, useCallback }`
- `Recharts` → chart components
- `LucideReact` → icon components

React is mounted via `ReactDOM.createRoot(document.getElementById("root")).render(<App />)` at the bottom of the `<script type="text/babel">` block.

### autoapply.html

Job application tracker. Four screens rendered by a single `App` root component, switching via `screen` state:
- **Dashboard** — stats cards + Recharts area chart of applications over time
- **User Profile** — form with `SECTIONS` config array driving all fields; saves to `localStorage`
- **Applications** — paste a job URL, open it in a new tab, reference profile data with copy buttons
- **Historic Applications** — table of logged submissions, click row to edit in modal

State persistence uses `localStorage` with keys `aa_profile` and `aa_history`.

`autoapply_3.jsx` is the original source JSX (uses ES module imports) — `autoapply.html` is the runnable version with imports replaced by UMD globals.

### tictactoe.html

Two-player Tic Tac Toe. Pure vanilla JS — no framework. Win detection iterates `WINS` (8 line combos), score persists in JS variables (resets on page refresh).

## Git Workflow

After every meaningful change:
```bash
git add <files>
git commit -m "concise description of what and why"
git push
```
