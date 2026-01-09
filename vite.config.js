import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Inspector auto-inject plugin (dev only)
function inspectorPlugin() {
	let isDev = false;

	return {
		name: 'inspector-inject',
		configResolved(config) {
			isDev = config.mode === 'development';
		},
		configureServer(server) {
			// Use middleware to intercept static HTML files
			if (!isDev) return;

			return () => {
				server.middlewares.use((req, res, next) => {
					// Only handle /templates/ HTML requests
					if (!req.url || !req.url.includes('/templates/') || !req.url.endsWith('.html')) {
						return next();
					}

					// Read inspector.js on every request to allow hot updates
					let inspectorScript = '';
					const inspectorPath = path.resolve('static/inspector.js');
					if (fs.existsSync(inspectorPath)) {
						inspectorScript = fs.readFileSync(inspectorPath, 'utf-8');
					}

					console.log('[Inspector Plugin] Intercepting:', req.url);

					// Read the static HTML file
					const filePath = path.join('static', req.url);
					if (!fs.existsSync(filePath)) {
						return next();
					}

					let html = fs.readFileSync(filePath, 'utf-8');

					// Inject inspector script
					if (inspectorScript) {
						const injectTag = `<script>${inspectorScript}</script>`;
						if (html.includes('</head>')) {
							html = html.replace('</head>', `${injectTag}\n</head>`);
						} else if (html.includes('</body>')) {
							html = html.replace('</body>', `${injectTag}\n</body>`);
						}
						console.log('[Inspector Plugin] Injected script into:', req.url);
					}

					// Send modified HTML
					res.setHeader('Content-Type', 'text/html');
					res.setHeader('Content-Length', Buffer.byteLength(html));
					res.end(html);
				});
			};
		}
	};
}

export default defineConfig({
	plugins: [sveltekit(), tailwindcss(), inspectorPlugin()]
});