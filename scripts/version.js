#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Git-tag-based semversioning system
 * Automatically syncs package.json version with git tags
 */

function getLatestTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
  } catch (error) {
    console.warn('No git tags found, using v0.0.0');
    return 'v0.0.0';
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  return packageJson.version;
}

function updatePackageVersion(version) {
  const packagePath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  packageJson.version = version;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Updated package.json version to ${version}`);
}

function validateVersion(version) {
  const semverRegex = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
  return semverRegex.test(version);
}

function cleanVersion(version) {
  return version.replace(/^v/, '');
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'sync':
      // Sync package.json with latest git tag
      const latestTag = getLatestTag();
      const cleanTag = cleanVersion(latestTag);
      
      if (!validateVersion(latestTag)) {
        console.error(`Invalid version format: ${latestTag}`);
        process.exit(1);
      }
      
      updatePackageVersion(cleanTag);
      break;
      
    case 'check':
      // Check if versions are in sync
      const currentVersion = getCurrentVersion();
      const tagVersion = cleanVersion(getLatestTag());
      
      if (currentVersion !== tagVersion) {
        console.error(`Version mismatch: package.json has ${currentVersion}, git tag has ${tagVersion}`);
        process.exit(1);
      }
      
      console.log(`Versions are in sync: ${currentVersion}`);
      break;
      
    case 'next':
      // Suggest next version based on commit messages
      const nextType = args[1] || 'patch';
      const current = getCurrentVersion();
      const [major, minor, patch] = current.split('.').map(Number);
      
      let nextVersion;
      switch (nextType) {
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
      
      console.log(`Next ${nextType} version: ${nextVersion}`);
      break;
      
    default:
      console.log(`Usage: node scripts/version.js <command>

Commands:
  sync    - Sync package.json version with latest git tag
  check   - Check if package.json and git tag versions match
  next    - Suggest next version (patch|minor|major)
`);
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = { getLatestTag, getCurrentVersion, updatePackageVersion, validateVersion, cleanVersion };