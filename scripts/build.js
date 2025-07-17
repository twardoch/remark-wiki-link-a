#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Build script for remark-wiki-link-a
 * Handles transpilation, testing, and validation
 */

function runCommand(command, description) {
  console.log(`\n🔧 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully`);
  } catch (error) {
    console.error(`❌ ${description} failed`);
    process.exit(1);
  }
}

function ensureDirectories() {
  const libDir = path.join(__dirname, '../lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
}

function main() {
  const args = process.argv.slice(2);
  const skipTests = args.includes('--skip-tests');
  
  console.log('🚀 Building remark-wiki-link-a...');
  
  // Ensure directories exist
  ensureDirectories();
  
  // Clean previous build
  runCommand('rm -rf lib/*', 'Cleaning previous build');
  
  // Build the project
  runCommand('npm run build', 'Transpiling source code');
  
  // Run tests unless skipped
  if (!skipTests) {
    runCommand('npm test', 'Running tests');
  }
  
  // Version check
  runCommand('node scripts/version.js check', 'Checking version consistency');
  
  console.log('\n🎉 Build completed successfully!');
}

if (require.main === module) {
  main();
}