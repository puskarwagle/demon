import { json } from '@sveltejs/kit';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Find aider executable
function findAider() {
  const possiblePaths = [
    join(homedir(), '.local', 'bin', 'aider'),
    join(homedir(), '.local', 'share', 'pipx', 'venvs', 'aider-chat', 'bin', 'aider'),
    '/usr/local/bin/aider'
  ];

  for (const path of possiblePaths) {
    if (existsSync(path)) return path;
  }

  return 'aider'; // Fallback to system PATH
}

// Execute aider command and return response
async function sendToAider(message, timeout = 120000, template = null) {
  return new Promise((resolve, reject) => {
    const aiderPath = findAider();

    // Determine working directory based on template
    let workingDir = process.cwd();
    if (template) {
      const templateDir = join(process.cwd(), 'src', 'routes', 'templates', template);
      if (existsSync(templateDir)) {
        workingDir = templateDir;
      }
    }

    // Build command arguments
    const args = [
      '--message', message,
      '--no-auto-commits',
      '--yes',
      '--no-auto-lint',
      '--no-show-model-warnings',
      '--subtree-only'  // Only scan current directory, not entire repo
    ];

    // Add DeepSeek configuration if API key is available
    if (process.env.DEEPSEEK_API_KEY) {
      args.push('--model', 'openai/deepseek-chat');
      args.push('--openai-api-base', 'https://api.deepseek.com');
    }

    // Spawn aider process with the message
    const aider = spawn(aiderPath, args, {
      cwd: workingDir,
      shell: false,
      env: {
        ...process.env,
        PATH: `${join(homedir(), '.local', 'bin')}:${process.env.PATH || ''}`,
        OPENAI_API_KEY: process.env.DEEPSEEK_API_KEY || '',
        OPENAI_API_BASE: 'https://api.deepseek.com'
      }
    });

    let output = '';
    let errorOutput = '';

    // Collect stdout
    aider.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Collect stderr
    aider.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    aider.on('close', (code) => {
      if (code === 0) {
        resolve(output || 'Command executed successfully');
      } else {
        reject(new Error(errorOutput || `Aider exited with code ${code}`));
      }
    });

    // Handle process errors
    aider.on('error', (err) => {
      reject(err);
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      aider.kill();
      reject(new Error('Aider command timed out'));
    }, timeout);

    // Clear timeout on process exit
    aider.on('exit', () => {
      clearTimeout(timeoutId);
    });
  });
}

export async function POST({ request }) {
  try {
    const { message, template } = await request.json();

    if (!message) {
      return json({ error: 'Message is required' }, { status: 400 });
    }

    // Send message to aider with template context
    const response = await sendToAider(message, 120000, template);

    return json({
      success: true,
      response: response || 'Command executed',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return json({
      error: error.message || 'Failed to process message'
    }, { status: 500 });
  }
}
