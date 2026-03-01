# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

- **Platform:** Windows 11, Git Bash shell (use Unix syntax — forward slashes, `/dev/null`, etc.)
- **Node.js:** v24.14.0, npm v11.9.0 (available at `/c/Program Files/nodejs`)
- **Git/GitHub:** Configured. Always commit and push after meaningful changes using clean, descriptive commit messages. Remote: `https://github.com/bradenallen/claude-code-projects`

## Running / Opening Files

```bash
start "filename.html"   # opens in default browser
```

## Architecture

This is a collection of browser-based apps.

### autoapply.html

Job application tracker built with React (loaded via CDN + Babel standalone). Four screens rendered by a single `App` root component, switching via `screen` state:
- **Dashboard** — stats cards + Recharts area chart of applications over time
- **User Profile** — form with `SECTIONS` config array driving all fields; saves to `localStorage`
- **Applications** — paste a job URL, open it in a new tab, reference profile data with copy buttons
- **Historic Applications** — table of logged submissions, click row to edit in modal

State persistence uses `localStorage` with keys `aa_profile` and `aa_history`.

`autoapply_3.jsx` is the original source JSX component.

### tictactoe.html

Two-player Tic Tac Toe. Pure vanilla JS — no framework. Win detection iterates `WINS` (8 line combos), score persists in JS variables (resets on page refresh).

## Git Workflow

After every meaningful change:
```bash
git add <files>
git commit -m "concise description of what and why"
git push
```
