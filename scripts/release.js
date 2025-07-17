#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Release script for remark-wiki-link-a
 * Handles version bumping, tagging, and publishing
 */

function runCommand(command, description, options = {}) {
  console.log(`\n🔧 ${description}...`);
  try {
    const result = execSync(command, { 
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8'
    });
    console.log(`✅ ${description} completed successfully`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed`);
    if (options.silent) {
      console.error(error.message);
    }
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  return packageJson.version;
}

function validateCleanWorkingTree() {
  try {
    execSync('git diff --quiet', { stdio: 'pipe' });
    execSync('git diff --quiet --cached', { stdio: 'pipe' });
  } catch (error) {
    console.error('❌ Working tree is not clean. Please commit or stash changes first.');
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  const releaseType = args[0] || 'patch';
  const dryRun = args.includes('--dry-run');
  const skipTests = args.includes('--skip-tests');
  
  if (!['patch', 'minor', 'major'].includes(releaseType)) {
    console.error('❌ Invalid release type. Use: patch, minor, or major');
    process.exit(1);
  }
  
  console.log(`🚀 Preparing ${releaseType} release...`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made');
  }
  
  // Validate working tree is clean
  validateCleanWorkingTree();
  
  // Build and test
  runCommand(`node scripts/build.js${skipTests ? ' --skip-tests' : ''}`, 'Building project');
  
  // Get current version
  const currentVersion = getCurrentVersion();
  console.log(`📦 Current version: ${currentVersion}`);
  
  // Calculate next version
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  let nextVersion;
  
  switch (releaseType) {
    case 'major':
      nextVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      nextVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
    default:
      nextVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }
  
  console.log(`📈 Next version: ${nextVersion}`);
  
  if (dryRun) {
    console.log('🔍 DRY RUN: Would create tag v' + nextVersion);
    return;
  }
  
  // Update package.json version
  runCommand(`npm version ${nextVersion} --no-git-tag-version`, 'Updating package.json version');
  
  // Create git tag
  runCommand(`git add package.json package-lock.json`, 'Staging version changes');
  runCommand(`git commit -m "v${nextVersion}"`, 'Committing version bump');
  runCommand(`git tag v${nextVersion}`, 'Creating git tag');
  
  console.log(`\n🎉 Release v${nextVersion} prepared successfully!`);
  console.log(`\nNext steps:`);
  console.log(`  git push origin ${execSync('git branch --show-current', { encoding: 'utf8' }).trim()}`);
  console.log(`  git push origin v${nextVersion}`);
  console.log(`  npm publish`);
}

if (require.main === module) {
  main();
}