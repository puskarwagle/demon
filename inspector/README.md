# Element Inspector for Static HTML

A vanilla JavaScript element inspector for static websites that provides rich context for AI code assistants. Inspired by the Svelte Dev Inspector UI.

## Features

- 🎯 **Source Location Tracking** - Shows which HTML file and line number each element comes from
- 🎨 **Beautiful UI** - Animated gradient borders and dark floating panel (matches Svelte Dev Inspector)
- 🔍 **Rich Context** - Captures CSS selectors, computed styles, DOM hierarchy, dimensions, and more
- 🤖 **AI-Friendly** - Formats data perfectly for feeding to AI assistants like Aider
- ⌨️ **Keyboard Shortcuts** - `Alt+I` to toggle, `Escape` to unlock
- 🔒 **Lock Mode** - Click to lock an element for detailed inspection
- 📋 **Copy to Clipboard** - Export all info in markdown format
- 💾 **Persistent State** - Remembers if inspector is active across page reloads

## Quick Start

### 1. Annotate Your HTML Files

First, add source location attributes to your HTML files:

```bash
cd demon/inspector
node annotate-html.js ../static/templates ../static/templates-annotated static/templates
```

The third parameter (optional) specifies the base path for source files. If omitted, it's derived from the input directory.

This will process all HTML files and add `data-source-file` and `data-source-line` attributes to elements with full project-relative paths.

### 2. Include Inspector in Your HTML

Add these lines to your HTML `<head>`:

```html
<link rel="stylesheet" href="/inspector/element-inspector.css">
<script src="/inspector/element-inspector.js"></script>
```

### 3. Use the Inspector

1. **Toggle Inspector**: Click the eye icon (top-right) or press `Alt+I`
2. **Hover Elements**: Move your mouse over elements to highlight them
3. **Lock Element**: Click an element to lock it and view detailed info
4. **Copy Info**: Click the copy button to export data for AI
5. **Unlock**: Click the locked element again or press `Escape`

## What Data is Collected?

The inspector captures comprehensive information about each element:

### Source Location
- File path
- Line number

### Element Identity
- Tag name
- CSS selector path
- ID and classes

### DOM Hierarchy
- Parent chain (up to 5 levels)

### Attributes
- Important attributes (href, src, alt, etc.)

### Computed Styles
- Display, position, colors
- Fonts (family, size, weight)
- Spacing (margin, padding)
- Dimensions (width, height)
- Borders and border-radius
- Z-index

### Layout Information
- X/Y position on screen
- Actual rendered dimensions

### Content
- Inner text (truncated to 100 chars)

## AI Assistant Integration

The inspector is designed to work seamlessly with AI code assistants like Aider. When you copy element info, it's formatted in markdown:

```markdown
# Element Inspector Info

## Source Location
File: templates/home/page.html
Line: 42

## Element Identity
Tag: <button>
CSS Selector: body > main.container > section.hero:nth-child(2) > button.btn-primary
Classes: btn btn-primary

## Computed Styles
background-color: rgb(59, 130, 246)
color: rgb(255, 255, 255)
font-size: 16px
padding: 12px 24px 12px 24px
...
```

This format makes it easy for AI to:
- Locate the exact element in source code
- Understand the element's styling and layout
- Suggest precise improvements
- Debug issues with full context

## Build Integration

### Option 1: Build Script

Add to your `package.json`:

```json
{
  "scripts": {
    "annotate": "node inspector/annotate-html.js static/templates static/templates-annotated static/templates",
    "build": "npm run annotate && <your build command>"
  }
}
```

### Option 2: Watch Mode

For development, you can watch files and auto-annotate:

```bash
# Watch templates and re-annotate on changes
nodemon --watch static/templates --ext html --exec "node inspector/annotate-html.js static/templates static/templates-annotated"
```

### Option 3: Vite/SvelteKit Plugin

Since demon uses SvelteKit, you could create a plugin to auto-inject the inspector in dev mode.

## Configuration

The inspector auto-initializes when the script loads. To customize:

```javascript
// Access the inspector instance
const inspector = window.elementInspector;

// Programmatically toggle
inspector.toggle();

// Cleanup (if needed)
inspector.destroy();
```

## Customization

### Change Position

Edit `element-inspector.css`:

```css
.ei-container {
  top: 1rem;    /* Change vertical position */
  right: 1rem;  /* Change horizontal position */
}
```

### Change Colors

All colors use standard hex/rgb values. Search for colors in the CSS and adjust to match your design system.

### Skip Elements

To prevent certain elements from being annotated, edit `annotate-html.js`:

```javascript
const skipTags = new Set(['script', 'style', 'meta', 'link', 'title', 'base', 'head', 'svg']);
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires support for:
- ES6 classes
- `WeakMap`
- `getBoundingClientRect()`
- `getComputedStyle()`
- CSS custom properties

## Production Usage

**Warning**: This tool is intended for development only. Do not ship it to production.

To disable for production:

```html
<!-- Only include in development -->
{% if process.env.NODE_ENV === 'development' %}
  <link rel="stylesheet" href="/inspector/element-inspector.css">
  <script src="/inspector/element-inspector.js"></script>
{% endif %}
```

## Comparison with Svelte Dev Inspector

| Feature | Svelte Dev Inspector | Element Inspector |
|---------|---------------------|-------------------|
| Framework | Svelte | Vanilla JS (any) |
| Source Tracking | Component files | HTML files |
| UI Design | ✓ | ✓ (same) |
| Computed Styles | Limited | Full |
| AI Context | - | ✓ Rich export |
| Lock Mode | ✓ | ✓ |
| Keyboard Shortcuts | - | ✓ Alt+I, Escape |

## Troubleshooting

### Inspector not showing?

Check browser console for errors. Ensure scripts are loaded:

```javascript
console.log(window.elementInspector); // Should be defined
```

### Elements not highlighting?

Make sure HTML files are annotated with `data-source-file` and `data-source-line` attributes:

```html
<div data-source-file="templates/home.html" data-source-line="42">
```

### Styles look broken?

Ensure CSS is loaded before JS:

```html
<link rel="stylesheet" href="/inspector/element-inspector.css">
<script src="/inspector/element-inspector.js"></script>
```

## License

MIT

## Credits

UI design inspired by [@svelte-dev-inspector](https://github.com/sveltejs/vite-plugin-svelte)
