# RevSport Crew Entry Bookmarklet

A development environment for building advanced bookmarklets with proper tooling, testing, and build processes.

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Build the bookmarklet:
```bash
npm run build
```

3. Run tests:
```bash
npm test
```

## Usage

After building, the minified bookmarklet code will be in `dist/bookmarklet.js`.

### Installing the Bookmarklet

1. Build the project: `npm run build`
2. Open `dist/bookmarklet.md` in your browser or GitHub
3. Drag the bookmarklet link to your bookmarks bar

### Current Bookmarklet

The current bookmarklet simply shows "Hello World from bookmarklet!" when clicked.

**Installation Link:** 
```
Check dist/bookmarklet.md after running npm run build
```

## Development Commands

- `npm run build` - Build production bookmarklet
- `npm run dev` - Build in development mode with watch
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run clean` - Clean dist directory

## Project Structure

```
src/
  index.js                # Main bookmarklet source
tests/
  setup.js               # Test configuration
  index.test.js          # Bookmarklet tests
  basic.test.js          # Basic infrastructure tests
templates/
  bookmarklet.md         # Markdown template for generated bookmarklet
dist/                    # Generated files (git ignored)
  bookmarklet.js         # Built bookmarklet
  bookmarklet.md         # Installation guide with drag-and-drop link
```

## Features

- **Modern Build Pipeline**: Uses Webpack with Babel for ES6+ support and minification
- **Testing Infrastructure**: Jest with jsdom for unit testing
- **Easy Installation**: Generates markdown with drag-and-drop bookmarklet link
- **Development Workflow**: Watch mode for continuous building during development
- **Clean Separation**: Template-based generation keeps build config clean