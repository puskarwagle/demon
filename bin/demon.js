#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';

program
  .name('demon')
  .description('Demon - Development environment with AI chat')
  .version('0.0.1');

program
  .command('start')
  .description('Start Demon dev server')
  .action(() => {
    console.log(chalk.blue('🔥 Starting Demon...'));
    console.log(chalk.green('✓ Run npm run dev to start the development server'));
    console.log(chalk.yellow('\n💬 Chat with AI at /chat'));
  });

program.parse();
