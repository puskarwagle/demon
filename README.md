# Demon 😈

**Demon** is a lightweight template viewer with built-in AI assistance, designed to bridge static HTML templates and AI-powered development. Built with vanilla JavaScript and Vite, it provides live HTML annotation and an intelligent element inspector for AI agents like Aider.

## ✨ Features

- **🚀 Template Viewer**: Browse and interact with high-quality static HTML templates (E-commerce, BotCloud)
- **🔍 Live Element Inspector**:
    - **Real-time Annotation**: HTML is annotated on-the-fly with source file and line number tracking
    - **Source Tracking**: Instantly locate the exact file and line number of any HTML element
    - **Rich Context**: View computed styles, DOM hierarchy, attributes, and layout info
    - **AI-Ready Exports**: Copy element data in structured format for LLM prompts
- **💬 Built-in AI Chat**: Integrated Aider chat widget to modify templates directly
- **⚡ No Build Step for Templates**: Templates are served directly from separate git repositories

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm
- Aider (optional, for AI assistance)

### Installation

1.  **Navigate to the app directory:**
    ```bash
    cd demon/app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` to access the template selector.

## 🏗️ Architecture

### Directory Structure

```
demon/
├── app/                    # Vite application (this folder)
│   ├── index.html         # Template selector page
│   ├── botcloud.html      # BotCloud viewer (iframe wrapper)
│   ├── ecommerce.html     # E-commerce viewer (iframe wrapper)
│   ├── src/
│   │   ├── main.js        # Entry point
│   │   ├── chat-widget.js # Vanilla JS chat widget
│   │   ├── chat-widget.css
│   │   └── app.css        # Tailwind styles
│   ├── static/
│   │   └── inspector.js   # Element inspector script
│   ├── vite.config.js     # Vite config with custom plugin
│   └── package.json
│
└── templates/              # Template repositories (separate git repos)
    ├── botcloud/.git      # BotCloud template (independent)
    └── ecommerce/.git     # E-commerce template (independent)
```

### How It Works

1. **Template Serving**: Templates live in `../templates/` with their own git repos
2. **Live Annotation**: Vite middleware intercepts `/templates/*` requests and annotates HTML on-the-fly
3. **Inspector Injection**: `static/inspector.js` is injected into every template HTML file
4. **AI Integration**: Chat widget sends requests to `/api/chat` which spawns Aider in the template's git repo

## 🔍 The Element Inspector

### Usage

1. Navigate to a template (click "View Template" on homepage)
2. **Toggle Inspector**: Click the "Eye" icon in the chat widget or press `Alt + I`
3. **Hover**: Move your mouse to highlight elements
4. **Lock**: Click an element to lock the selection
5. **Copy**: Click "Copy" in the inspector panel to grab context for AI prompts

### How Annotation Works

- Templates are **annotated in real-time** by the Vite plugin
- No pre-processing or build step required
- Each HTML element gets `data-source-file` and `data-source-line` attributes
- Inspector reads these attributes to show source location

## 🤖 AI-Assisted Development

### Using Aider with Templates

Templates have their own git repositories, allowing you to use Aider directly:

```bash
# Work on botcloud template
cd ../templates/botcloud
aider

# Or use the chat widget in the browser
# Click the chat button and ask Aider to modify the template
```

The chat widget automatically:
- Detects which template you're viewing
- Runs Aider in the correct template directory
- Passes file context from the inspector
- Streams responses back to the UI

## 📦 Available Templates

1. **BotCloud** (`../templates/botcloud/`)
   - Professional AI solutions website
   - Modern styling with animations
   - Multiple page templates

2. **E-commerce** (`../templates/ecommerce/`)
   - Complete online store
   - Product listings, cart, checkout
   - Vendor management pages

## 🚀 Technology Stack

- **Vite** - Build tool and dev server
- **Vanilla JavaScript** - No frameworks, pure JS
- **Tailwind CSS + DaisyUI** - Styling
- **Custom Vite Plugin** - Template serving, annotation, API middleware

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
