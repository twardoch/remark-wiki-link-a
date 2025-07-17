# GitHub Actions Setup Guide

This guide shows how to set up GitHub Actions for automated CI/CD with this project.

## Prerequisites

- GitHub repository with Actions enabled
- NPM token for publishing (set as `NPM_TOKEN` secret)
- Write permissions for the repository

## Setup Instructions

### 1. Create `.github/workflows` directory

```bash
mkdir -p .github/workflows
```

### 2. Create CI Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ master, develop ]
  pull_request:
    branches: [ master ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x, 20.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test
      
    - name: Check version consistency
      run: npm run version:check
      
    - name: Run build
      run: npm run build:full

  coverage:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests with coverage
      run: npm run test:coverage
      
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
        fail_ci_if_error: true
```

### 3. Create Release Workflow

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run full test suite
      run: npm test
      
    - name: Check version consistency
      run: npm run version:check
      
    - name: Run build
      run: npm run build:full

  release:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: write
      
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'
        registry-url: https://registry.npmjs.org/
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build package
      run: npm run build:full
      
    - name: Extract version from tag
      id: version
      run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_OUTPUT
      
    - name: Create GitHub Release
      uses: actions/create-release@v1
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
        tag_name: ${{ github.ref }}
        release_name: Release ${{ github.ref }}
        draft: false
        prerelease: false
        body: |
          Release ${{ steps.version.outputs.VERSION }}
          
          ## Changes
          See [CHANGELOG.md](https://github.com/${{ github.repository }}/blob/master/CHANGELOG.md) for details.
          
          ## Installation
          ```bash
          npm install remark-wiki-link-a@${{ steps.version.outputs.VERSION }}
          ```
          
    - name: Publish to npm
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
        
    - name: Create package artifact
      run: npm pack
      
    - name: Upload package artifact
      uses: actions/upload-artifact@v3
      with:
        name: npm-package-${{ steps.version.outputs.VERSION }}
        path: remark-wiki-link-a-*.tgz
        retention-days: 30
```

### 4. Create Manual Release Workflow

Create `.github/workflows/manual-release.yml`:

```yaml
name: Manual Release

on:
  workflow_dispatch:
    inputs:
      release_type:
        description: 'Release type'
        required: true
        default: 'patch'
        type: choice
        options:
        - patch
        - minor
        - major
      dry_run:
        description: 'Dry run (no actual release)'
        required: false
        default: false
        type: boolean

jobs:
  manual-release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      with:
        fetch-depth: 0
        token: ${{ secrets.GITHUB_TOKEN }}
        
    - name: Configure Git
      run: |
        git config --global user.name "GitHub Action"
        git config --global user.email "action@github.com"
        
    - name: Use Node.js
      uses: actions/setup-node@v4
      with:
        node-version: 18.x
        cache: 'npm'
        registry-url: https://registry.npmjs.org/
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Run full build
      run: npm run build:full
      
    - name: Dry run release
      if: ${{ github.event.inputs.dry_run == 'true' }}
      run: npm run release:dry
      
    - name: Create release
      if: ${{ github.event.inputs.dry_run != 'true' }}
      run: npm run release:${{ github.event.inputs.release_type }}
      
    - name: Push changes
      if: ${{ github.event.inputs.dry_run != 'true' }}
      run: |
        git push origin master
        git push origin --tags
        
    - name: Get new version
      if: ${{ github.event.inputs.dry_run != 'true' }}
      id: version
      run: echo "VERSION=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT
      
    - name: Publish to npm
      if: ${{ github.event.inputs.dry_run != 'true' }}
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Configuration

### Required Secrets

1. **NPM_TOKEN**: Your NPM authentication token
   - Go to Repository Settings → Secrets and variables → Actions
   - Add new secret named `NPM_TOKEN`
   - Get token from https://www.npmjs.com/settings/tokens

### Optional: Codecov Setup

1. Sign up at https://codecov.io
2. Add your repository
3. Get the upload token
4. Add as `CODECOV_TOKEN` secret (optional, works without it too)

## Usage

### Automatic Release (Recommended)

```bash
# Create a release using the release script
npm run release:patch

# This will:
# 1. Run tests and build
# 2. Bump version in package.json
# 3. Create git tag
# 4. Commit changes
# 5. When you push, GitHub Actions will:
#    - Run tests
#    - Create GitHub release
#    - Publish to NPM
```

### Manual Release via GitHub UI

1. Go to Actions tab in your repository
2. Click "Manual Release" workflow
3. Click "Run workflow"
4. Select release type (patch/minor/major)
5. Optionally enable dry run
6. Click "Run workflow"

### Tag-based Release

```bash
# Create and push a tag directly
git tag v1.0.1
git push origin v1.0.1

# GitHub Actions will automatically:
# - Run tests
# - Create GitHub release
# - Publish to NPM
```

## Benefits

- **Automated Testing**: Every push and PR runs tests
- **Version Consistency**: Automatic version validation
- **Multi-platform**: Tests on multiple Node.js versions
- **Code Coverage**: Automatic coverage reporting
- **Release Automation**: One-click releases
- **Binary Artifacts**: Package files available for download

## Troubleshooting

1. **NPM Publish Fails**: Check NPM_TOKEN secret
2. **Tests Fail**: Check test scripts in package.json
3. **Version Mismatch**: Run `npm run version:check` locally first
4. **Permission Errors**: Ensure repository has Actions enabled

This setup provides a professional CI/CD pipeline for your project!