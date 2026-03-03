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

# Claude Preferences

## Design & Color Palette

Use the following color palette and design system on all frontend projects unless the user specifies otherwise. This is inspired by 1800contacts.com and has been user-approved.

### nCino-style (financial / enterprise)

For banking or financial product UIs, you can use an nCino-inspired system: clean, trustworthy, enterprise-grade. Primary blue `#0066B3`, dark navy `#003366`, white and light grays; typography Inter or similar; cards with subtle borders and plenty of whitespace. Use when the user asks for "nCino style" or "financial/enterprise" design.

### Color Tokens (default: 1800contacts-inspired)

```js
const C = {
  navyDark:   "#001A57",   // Sidebar backgrounds, table headers, dark UI elements
  navy:       "#002FA7",   // Primary buttons, headings, active states
  navyMid:    "#0047BB",   // Hover states on navy
  blue:       "#006FE8",   // Active nav items, links, chart lines, accent highlights
  blueLight:  "#E8F0FF",   // Hover row backgrounds, tag/badge fills, info banners
  bluePale:   "#F0F5FF",   // Upload drop zones, subtle section backgrounds
  red:        "#D0021B",   // Error states, destructive actions, alerts
  redLight:   "#FFF0F2",   // Error toast background
  white:      "#FFFFFF",   // Card backgrounds, modal backgrounds, input backgrounds
  grayBg:     "#F4F7FC",   // Page background
  grayLine:   "#DDE4F0",   // Borders, dividers, table row separators
  grayMid:    "#8A97B0",   // Placeholder text, labels, secondary text
  grayText:   "#4A5568",   // Body text, table cell content
  dark:       "#1A2340",   // Primary text, headings on white
  success:    "#00875A",   // Success states, confirmation toasts
  successBg:  "#E6F6F0",   // Success toast/badge background
};
```

### Typography

- **Headings**: `Poppins` (weights 700–800) — import from Google Fonts
- **Body / UI**: `Inter` (weights 400–600) — import from Google Fonts
- Import via: `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');`

### Design Principles

- **Light theme** — white cards on `grayBg` page background
- **Cards**: `background: white`, `border: 1px solid grayLine`, `border-radius: 14px`, `box-shadow: 0 2px 12px rgba(0,47,167,0.06)`
- **Sidebar**: `navyDark` background, `blue` active nav item highlight, white text
- **Table headers**: `navyDark` background, muted white text
- **Inputs**: white background, `grayLine` border, focus ring in `blue` with `blueLight` glow
- **Primary buttons**: `navy` fill, white text, `border-radius: 8px`, `font-weight: 700`
- **Outline buttons**: white fill, `navy` border and text
- **Ghost buttons**: transparent fill, `grayLine` border, `grayText` text
- **Success buttons**: `success` fill, white text
- **Date/tag badges**: `blueLight` background, `navy` text, `border-radius: 20px`
- **Toasts**: white background, colored left-border accent (5px), subtle box shadow
- **Section labels**: uppercase, `0.05em` letter-spacing, `12px`, `grayMid` color
- **Scrollbars**: 6px width, `grayLine` thumb color

### Form Fields

```js
// Input style
{
  background: enabled ? white : grayBg,
  border: `1.5px solid ${grayLine}`,
  borderRadius: 8,
  padding: "10px 14px",
  color: enabled ? dark : grayText,
  fontSize: 14,
}

// Focus state (via CSS)
// border-color: blue !important;
// box-shadow: 0 0 0 3px blueLight;
```

### Animations

- `@keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }`
- Use for toasts, modals appearing

### Modal Style

```js
{
  background: white,
  borderRadius: 16,
  padding: "32px 36px",
  boxShadow: "0 24px 64px rgba(0,26,87,0.25)",
}
```

### Modal Overlay

```js
{
  background: "rgba(0,26,87,0.5)",
  backdropFilter: "blur(4px)",
}
```

