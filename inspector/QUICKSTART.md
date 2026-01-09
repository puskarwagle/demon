# Element Inspector - Quick Start

## What is this?

A vanilla JavaScript element inspector for static HTML that tracks source locations and provides rich context for AI assistants like Aider. It has the same beautiful UI as Svelte Dev Inspector but works with any static HTML site.

## Files Created

```
demon/inspector/
├── annotate-html.js           # Script to add source location attributes
├── element-inspector.js       # Main inspector (vanilla JS)
├── element-inspector.css      # Styles matching Svelte inspector
├── example.html               # Demonstration page
├── README.md                  # Full documentation
└── QUICKSTART.md              # This file
```

## How to Use

### Step 1: Annotate Your HTML

Run this command to add source location data to your HTML files:

```bash
npm run inspector:annotate
```

This processes `static/templates/` and outputs to `static/templates-annotated/`.

You can also run it manually:

```bash
node inspector/annotate-html.js static/templates static/templates-annotated
```

### Step 2: Include Inspector in Your HTML

Add these lines to your HTML `<head>`:

```html
<!-- Element Inspector (dev only) -->
<link rel="stylesheet" href="/inspector/element-inspector.css">
<script src="/inspector/element-inspector.js"></script>
```

### Step 3: Use the Inspector

1. **Toggle**: Press `Alt+I` or click the eye icon (top-right)
2. **Hover**: Move mouse over elements to see info
3. **Lock**: Click an element to lock it for detailed inspection
4. **Copy**: Click copy button to export data for AI
5. **Unlock**: Press `Escape` or click locked element again

## Features

### What It Shows

- **Source Location**: Exact file path and line number
- **Element Identity**: CSS selector, tag, ID, classes
- **DOM Hierarchy**: Parent chain up to 5 levels
- **Computed Styles**: Colors, fonts, spacing, dimensions
- **Layout Info**: Position and size on screen
- **Content**: Text content and important attributes

### AI Integration

When you click the copy button, it exports markdown-formatted data perfect for AI assistants:

```markdown
# Element Inspector Info

## Source Location
File: templates/home/page.html
Line: 42

## Element Identity
Tag: <button>
CSS Selector: body > main > section.hero > button.btn-primary
...
```

Feed this to Aider when asking for:
- Style tweaks
- Bug fixes
- Layout improvements
- Accessibility enhancements

## Example Commands

```bash
# View the example page
cd inspector
python3 -m http.server 8000
# Open http://localhost:8000/example.html

# Annotate templates
npm run inspector:annotate

# Or annotate specific directory
node inspector/annotate-html.js path/to/input path/to/output
```

## Keyboard Shortcuts

- `Alt+I` - Toggle inspector on/off
- `Escape` - Unlock currently locked element

## Tips

1. **Development Only**: Don't ship this to production
2. **Lock Before Copy**: Lock an element before copying its info
3. **Use with Aider**: Copy element info and paste into Aider chat for precise edits
4. **Annotate After Changes**: Re-run annotation script after editing HTML

## Troubleshooting

**Inspector not showing?**
- Check that CSS/JS are loaded in browser DevTools
- Verify `window.elementInspector` is defined

**Elements not highlighting?**
- Make sure HTML is annotated with `data-source-file` attributes
- Check browser console for errors

**Wrong source locations?**
- Re-run the annotation script: `npm run inspector:annotate`

## Next Steps

- See `README.md` for full documentation
- See `example.html` for a working demo
- Integrate with your build process
- Customize colors in `element-inspector.css`

## Pro Tips for Aider Integration

### When asking Aider to fix styles:

1. Lock the element
2. Copy info
3. Paste into Aider with prompt like:

```
Fix the padding on this button:

[paste element info]

Make the vertical padding 12px and horizontal 24px
```

### When reporting a bug:

```
This element is not centered correctly:

[paste element info]

The container should center its children horizontally
```

### When asking for new features:

```
Add hover effects to this card:

[paste element info]

On hover: scale 1.05, shadow more prominent, transition 0.2s
```

The inspector gives Aider perfect context so it can make surgical edits to the exact right place in your code.
