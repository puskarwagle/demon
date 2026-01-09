# Element Inspector - Integration Complete ✅

The element inspector is now fully integrated into demon!

## What Was Done

### 1. Created Merged Script (`static/inspector.js`)
- Combined CSS + JS into single file
- Auto-injects styles when loaded
- Listens for messages from parent window (iframe communication)
- Hidden toggle button (controlled by parent)

### 2. Created Vite Plugin (`vite.config.js`)
- Auto-injects `inspector.js` into all `/templates/**/*.html` files
- Only runs in development mode
- No manual script tags needed in HTML files

### 3. Added Toggle Button to ChatWidget
- Eye icon in chat header
- Toggles inspector on/off via iframe `postMessage`
- Shows green when active (Eye) vs gray when inactive (EyeOff)
- Receives state updates from iframe

### 4. Annotated All Templates
- Ran `annotate-html.js` on all 137 HTML files
- Added `data-source-file` and `data-source-line` to elements
- Templates are now inspector-ready

## How to Use

1. **Start demon dev server:**
   ```bash
   npm run dev
   ```

2. **Open a template:**
   ```
   http://localhost:5173/templates/botcloud
   ```

3. **Open chat widget** (bottom-right)

4. **Click eye icon** in chat header to toggle inspector

5. **Hover/click elements** in the template to inspect them

6. **Lock element** by clicking (shows detailed info)

7. **Copy info** for AI by clicking copy button

## Features

✅ **Auto-injection** - No manual script tags needed
✅ **Dev-only** - Only runs in development mode
✅ **Source tracking** - Shows exact file path and line number
✅ **Rich context** - CSS selectors, styles, DOM hierarchy, dimensions
✅ **AI-optimized** - Copy button exports markdown for Aider
✅ **Clean UI** - Matches Svelte Dev Inspector design
✅ **Iframe control** - Toggle from parent window

## File Structure

```
demon/
├── static/
│   └── inspector.js           # Merged CSS+JS (auto-injected)
├── inspector/
│   ├── annotate-html.js       # HTML annotation script
│   ├── INTEGRATION.md         # This file
│   ├── QUICKSTART.md          # Quick reference
│   ├── README.md              # Full docs
│   └── example.html           # Standalone demo
├── vite.config.js             # Vite plugin for auto-injection
└── src/lib/ChatWidget.svelte  # Toggle button added
```

## Workflow

### When editing templates:
```bash
# 1. Make changes to HTML files in static/templates/

# 2. Re-annotate (if needed)
npm run inspector:annotate

# 3. Dev server auto-reloads with inspector injected
```

### When asking AI for help:
1. Toggle inspector on (eye icon)
2. Click element to lock
3. Click copy button
4. Paste into Aider chat with your request

Example:
```
Fix the spacing on this button:

[paste inspector data]

The button needs more padding and a larger font size
```

## Technical Details

### How Auto-Injection Works
1. Vite plugin reads `static/inspector.js` on startup
2. When serving `/templates/**/*.html`, plugin injects script inline
3. Inspector auto-initializes when loaded
4. Listens for `postMessage` from parent

### How Toggle Works
1. User clicks eye icon in ChatWidget
2. ChatWidget sends `{ type: 'inspector-toggle' }` to iframe
3. Inspector receives message and toggles active state
4. Inspector sends `{ type: 'inspector-state', active: true }` back
5. ChatWidget updates button color/icon

### Communication Protocol
```javascript
// Parent → Iframe
{ type: 'inspector-toggle' }

// Iframe → Parent
{ type: 'inspector-ready' }
{ type: 'inspector-state', active: boolean }
```

## Troubleshooting

### Inspector not showing up?
1. Check you're on a `/templates/` URL
2. Check browser console for errors
3. Verify `static/inspector.js` exists

### Toggle button not working?
1. Make sure iframe has loaded
2. Check same-origin policy (should be fine since it's same server)
3. Check browser console for postMessage errors

### Elements not highlighting?
1. Make sure templates are annotated: `npm run inspector:annotate`
2. Look for `data-source-file` attributes in HTML
3. Check elements aren't inside `<script>` or `<style>` tags

## Production

The inspector is **automatically disabled** in production because:
1. Vite plugin only runs when `config.mode === 'development'`
2. No script injection happens in production builds
3. Templates remain clean

## Next Steps

You can now:
- Use inspector to debug templates
- Copy element info for AI assistance
- Understand template structure visually
- Track down specific elements in source files

Enjoy! 🎉
