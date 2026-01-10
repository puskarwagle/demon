import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inline HTML annotation function
function annotateHTML(html, sourceFile, basePath) {
	const lines = html.split('\n');
	const result = [];
	const fullPath = path.join(basePath, sourceFile).replace(/\\/g, '/');
	const skipTags = new Set(['script', 'style', 'meta', 'link', 'title', 'base', 'head']);
	const selfClosingTags = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']);

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineNumber = i + 1;

		const annotatedLine = line.replace(
			/<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^>]*)?)(\/?)>/g,
			(match, tagName, attributes, selfClosing) => {
				if (skipTags.has(tagName.toLowerCase())) {
					return match;
				}

				let cleanAttrs = attributes
					.replace(/\s+data-source-file="[^"]*"/g, '')
					.replace(/\s+data-source-line="[^"]*"/g, '');

				const isSelfClosing = selfClosing === '/' || selfClosingTags.has(tagName.toLowerCase());
				const annotationAttrs = ` data-source-file="${fullPath}" data-source-line="${lineNumber}"`;

				if (isSelfClosing) {
					return `<${tagName}${cleanAttrs}${annotationAttrs}${selfClosing}>`;
				} else {
					return `<${tagName}${cleanAttrs}${annotationAttrs}>`;
				}
			}
		);

		result.push(annotatedLine);
	}

	return result.join('\n');
}

// Aider API logic
function findAider() {
	const possiblePaths = [
		path.join(homedir(), '.local', 'bin', 'aider'),
		path.join(homedir(), '.local', 'share', 'pipx', 'venvs', 'aider-chat', 'bin', 'aider'),
		'/usr/local/bin/aider'
	];

	for (const p of possiblePaths) {
		if (existsSync(p)) return p;
	}

	return 'aider';
}

async function sendToAider(message, timeout = 120000, template = null, file = null) {
	return new Promise((resolve, reject) => {
		const aiderPath = findAider();

		let workingDir = process.cwd();
		if (template) {
			const templateDir = path.join(process.cwd(), '..', 'templates', template);
			if (existsSync(templateDir)) {
				workingDir = templateDir;
			}
		}

		const args = [
			'--message', message,
			'--no-auto-commits',
			'--yes',
			'--no-auto-lint',
			'--no-show-model-warnings',
			'--subtree-only'
		];

		if (file) {
			// Strip template directory prefix if present
			// e.g., "templates/botcloud/index.html" -> "index.html"
			let relativeFile = file;
			if (template && file.startsWith(`templates/${template}/`)) {
				relativeFile = file.replace(`templates/${template}/`, '');
			}
			args.push(relativeFile);
		}

		if (process.env.DEEPSEEK_API_KEY) {
			args.push('--model', 'openai/deepseek-chat');
			args.push('--openai-api-base', 'https://api.deepseek.com');
		}

		const aider = spawn(aiderPath, args, {
			cwd: workingDir,
			shell: false,
			env: {
				...process.env,
				PATH: `${path.join(homedir(), '.local', 'bin')}:${process.env.PATH || ''}`,
				OPENAI_API_KEY: process.env.DEEPSEEK_API_KEY || '',
				OPENAI_API_BASE: 'https://api.deepseek.com'
			}
		});

		let output = '';
		let errorOutput = '';

		aider.stdout.on('data', (data) => {
			output += data.toString();
		});

		aider.stderr.on('data', (data) => {
			errorOutput += data.toString();
		});

		aider.on('close', (code) => {
			if (code === 0) {
				resolve(output || 'Command executed successfully');
			} else {
				reject(new Error(errorOutput || `Aider exited with code ${code}`));
			}
		});

		aider.on('error', (err) => {
			reject(err);
		});

		const timeoutId = setTimeout(() => {
			aider.kill();
			reject(new Error('Aider command timed out'));
		}, timeout);

		aider.on('exit', () => {
			clearTimeout(timeoutId);
		});
	});
}

// Inspector + API middleware plugin
function demonPlugin() {
	let isDev = false;

	return {
		name: 'demon-plugin',
		configResolved(config) {
			isDev = config.mode === 'development';
		},
		configureServer(server) {
			if (!isDev) return;

			// Middleware for both templates and API
			server.middlewares.use(async (req, res, next) => {
				// Handle API requests
				if (req.url === '/api/chat' && req.method === 'POST') {
					let body = '';
					req.on('data', chunk => {
						body += chunk.toString();
					});

					req.on('end', async () => {
						try {
							const { message, template, file } = JSON.parse(body);

							if (!message) {
								res.statusCode = 400;
								res.setHeader('Content-Type', 'application/json');
								res.end(JSON.stringify({ error: 'Message is required' }));
								return;
							}

							const response = await sendToAider(message, 120000, template, file);

							res.statusCode = 200;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({
								success: true,
								response: response || 'Command executed',
								timestamp: new Date().toISOString()
							}));
						} catch (error) {
							console.error('Chat API error:', error);
							res.statusCode = 500;
							res.setHeader('Content-Type', 'application/json');
							res.end(JSON.stringify({
								error: error.message || 'Failed to process message'
							}));
						}
					});

					return;
				}

				// Handle inspector.js serving (check this first, before templates)
				if (req.url === '/inspector.js') {
					const inspectorPath = path.resolve(__dirname, 'static/inspector.js');
					if (fs.existsSync(inspectorPath)) {
						const content = fs.readFileSync(inspectorPath, 'utf-8');
						res.setHeader('Content-Type', 'application/javascript');
						res.setHeader('Content-Length', Buffer.byteLength(content));
						res.end(content);
						console.log('[Demon Plugin] Served inspector.js');
					} else {
						console.log('[Demon Plugin] inspector.js not found at:', inspectorPath);
						return next();
					}
					return;
				}

				// Handle template serving with inspector injection
				if (req.url && req.url.includes('/templates/')) {
					console.log('[Demon Plugin] Intercepting:', req.url);

					const relativeUrl = req.url.startsWith('/') ? req.url.slice(1) : req.url;
					const filePath = path.resolve(__dirname, '..', relativeUrl);

					if (!fs.existsSync(filePath)) {
						console.log('[Demon Plugin] File not found:', filePath);
						return next();
					}

					// Check if it's a directory
					const stats = fs.statSync(filePath);
					if (stats.isDirectory()) {
						console.log('[Demon Plugin] Path is directory, skipping:', filePath);
						return next();
					}

					// For HTML files: annotate only (no injection needed)
					if (req.url.endsWith('.html')) {
						let html = fs.readFileSync(filePath, 'utf-8');
						const templatePath = req.url.replace('/templates/', '');
						html = annotateHTML(html, templatePath, 'templates');

						console.log('[Demon Plugin] Annotated:', req.url);

						res.setHeader('Content-Type', 'text/html');
						res.setHeader('Content-Length', Buffer.byteLength(html));
						res.end(html);
					} else {
						// For other static files: serve directly
						const ext = path.extname(filePath).toLowerCase();
						const mimeTypes = {
							'.css': 'text/css',
							'.js': 'application/javascript',
							'.png': 'image/png',
							'.jpg': 'image/jpeg',
							'.jpeg': 'image/jpeg',
							'.gif': 'image/gif',
							'.svg': 'image/svg+xml',
							'.woff': 'font/woff',
							'.woff2': 'font/woff2',
							'.ttf': 'font/ttf',
							'.eot': 'application/vnd.ms-fontobject',
							'.webp': 'image/webp'
						};

						const contentType = mimeTypes[ext] || 'application/octet-stream';
						const content = fs.readFileSync(filePath);

						res.setHeader('Content-Type', contentType);
						res.setHeader('Content-Length', content.length);
						res.end(content);
					}

					return;
				}

				next();
			});
		}
	};
}

export default defineConfig({
	plugins: [tailwindcss(), demonPlugin()],
	server: {
		fs: {
			allow: ['..']
		}
	}
});
