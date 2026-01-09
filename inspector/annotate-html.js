#!/usr/bin/env node

/**
 * HTML Source Annotator
 *
 * Adds data-source-file and data-source-line attributes to HTML elements
 * for use with the element inspector.
 *
 * Usage:
 *   node annotate-html.js <input-dir> <output-dir>
 *   node annotate-html.js static/templates static/templates-annotated
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HTMLAnnotator {
  constructor(inputDir, outputDir, basePath = null) {
    this.inputDir = inputDir;
    this.outputDir = outputDir;
    this.basePath = basePath || this.deriveBasePath(inputDir);
    this.processedCount = 0;
    this.errorCount = 0;
  }

  /**
   * Derive base path from input directory
   * Removes leading ../ and normalizes the path
   */
  deriveBasePath(inputDir) {
    // Normalize and remove leading ../
    const normalized = path.normalize(inputDir);
    const relative = normalized.replace(/^\.\.\//, '');
    return relative;
  }

  /**
   * Recursively process all HTML files in a directory
   */
  processDirectory(dir = this.inputDir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relativePath, entry.name);

      if (entry.isDirectory()) {
        // Create output directory
        const outDir = path.join(this.outputDir, relPath);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        // Recurse
        this.processDirectory(fullPath, relPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        this.processFile(fullPath, relPath);
      }
    }
  }

  /**
   * Process a single HTML file
   */
  processFile(inputPath, relativePath) {
    try {
      console.log(`Processing: ${relativePath}`);
      const content = fs.readFileSync(inputPath, 'utf8');
      const annotated = this.annotateHTML(content, relativePath);

      const outputPath = path.join(this.outputDir, relativePath);
      fs.writeFileSync(outputPath, annotated, 'utf8');

      this.processedCount++;
    } catch (error) {
      console.error(`Error processing ${relativePath}:`, error.message);
      this.errorCount++;
    }
  }

  /**
   * Annotate HTML content with source location attributes
   */
  annotateHTML(html, sourceFile) {
    const lines = html.split('\n');
    const result = [];

    // Build full path from base path
    const fullPath = path.join(this.basePath, sourceFile).replace(/\\/g, '/');

    // Tags to skip annotation (script, style, meta, link, etc.)
    const skipTags = new Set(['script', 'style', 'meta', 'link', 'title', 'base', 'head']);

    // Self-closing tags
    const selfClosingTags = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'param', 'source', 'track', 'wbr']);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // Match opening tags
      const annotatedLine = line.replace(
        /<([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^>]*)?)(\/?)>/g,
        (match, tagName, attributes, selfClosing) => {
          // Skip if it's a closing tag or in skip list
          if (skipTags.has(tagName.toLowerCase())) {
            return match;
          }

          // Remove existing data-source-* attributes if present
          let cleanAttrs = attributes
            .replace(/\s+data-source-file="[^"]*"/g, '')
            .replace(/\s+data-source-line="[^"]*"/g, '');

          // Add source annotations with full path
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

  /**
   * Run the annotator
   */
  run() {
    console.log('HTML Source Annotator');
    console.log('====================');
    console.log(`Input:     ${this.inputDir}`);
    console.log(`Output:    ${this.outputDir}`);
    console.log(`Base Path: ${this.basePath}`);
    console.log();

    // Create output directory if it doesn't exist
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Process all files
    this.processDirectory();

    console.log();
    console.log('Summary');
    console.log('=======');
    console.log(`Processed: ${this.processedCount} files`);
    console.log(`Errors:    ${this.errorCount} files`);
  }
}

// CLI
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: node annotate-html.js <input-dir> <output-dir> [base-path]');
    console.error('Example: node annotate-html.js static/templates static/templates-annotated');
    console.error('         node annotate-html.js ../static/templates ../static/templates-annotated static/templates');
    process.exit(1);
  }

  const [inputDir, outputDir, basePath] = args;

  if (!fs.existsSync(inputDir)) {
    console.error(`Error: Input directory does not exist: ${inputDir}`);
    process.exit(1);
  }

  const annotator = new HTMLAnnotator(inputDir, outputDir, basePath);
  annotator.run();
}

export default HTMLAnnotator;
