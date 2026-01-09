# Demon 😈

**Demon** is a modern development environment and template viewer designed to bridge the gap between static HTML templates and AI-assisted development. It features a powerful, vanilla JavaScript **Element Inspector** that provides rich context for AI agents, allowing them to understand and modify static templates with precision.

![Demon Inspector](https://placehold.co/800x400?text=Demon+Inspector+Preview)

## ✨ Features

- **🚀 Template Viewer**: Browse and interact with high-quality static HTML templates (E-commerce, BotCloud).
- **🔍 Intelligent Element Inspector**:
    - **Source Tracking**: Instantly locate the exact file and line number of any HTML element.
    - **Rich Context**: View computed styles, DOM hierarchy, attributes, and layout info.
    - **AI-Ready Exports**: Copy element data in a structured Markdown format perfect for LLM prompts.
    - **Svelte-like UI**: Beautiful, unobtrusive interface inspired by the Svelte Dev Inspector.
- **💬 Built-in AI Chat**: Integrated chat interface to assist with development directly within the environment.
- **🛠️ Automated Annotation**: Smart scripts to automatically inject source location data into your static HTML files.

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/demon.git
    cd demon
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

To start the development server and the Demon environment:

```bash
npm run dev
```
Or use the CLI:
```bash
./bin/demon.js start
```

Visit `http://localhost:5173` to access the dashboard.

## 🔍 The Element Inspector

The core feature of Demon is its **Element Inspector**. It works by reading annotated HTML files and providing an interactive overlay.

### How it Works

1.  **Annotation**: The system processes your static HTML templates in `static/templates` and outputs annotated versions to `static/templates-annotated`.
2.  **Injection**: The annotated HTML files include `data-source-file` and `data-source-line` attributes.
3.  **Inspection**: When you view a template, the Inspector UI allows you to hover, lock, and inspect elements.

### Usage

1.  Navigate to a template (e.g., E-commerce).
2.  **Toggle Inspector**: Click the generic "Eye" icon in the top-right or press `Alt + I`.
3.  **Hover**: Move your mouse to highlight elements.
4.  **Lock**: Click an element to lock the selection.
5.  **Copy**: Click the "Copy" button in the inspector panel to grab the element's context for your AI assistant.

### Manual Annotation

If you modify templates or add new ones, you can manually trigger the annotation process:

```bash
npm run inspector:annotate
```
*This command runs `node inspector/annotate-html.js static/templates static/templates-annotated`.*

## 📂 Project Structure

```
demon/
├── bin/                 # CLI entry point
├── inspector/           # Inspector source code and annotation scripts
│   ├── annotate-html.js # Script to add data-source attributes
│   ├── element-inspector.js # Core inspector logic
│   └── element-inspector.css # Inspector styles
├── src/
│   ├── lib/             # Svelte components (ChatWidget, etc.)
│   └── routes/          # SvelteKit routes
├── static/
│   ├── templates/       # Original static HTML templates
│   └── templates-annotated/ # Processed templates (generated)
└── package.json
```

## 📦 Available Templates

Demon currently includes two fully annotated templates:

1.  **BotCloud**: A professional AI solutions website with modern styling.
2.  **E-commerce**: A complete online store template with product listings, cart, and checkout pages.

## 🤝 Contributing

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes (`git commit -m 'Add some amazing feature'`).
4.  Push to the branch (`git push origin feature/amazing-feature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
