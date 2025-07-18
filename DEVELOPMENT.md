# Development Guide

This guide covers development setup, testing, building, and releasing for `remark-wiki-link-a`.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/twardoch/remark-wiki-link-a.git
cd remark-wiki-link-a

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build
```

## Development Setup

### Prerequisites

- Node.js 14.x or later
- npm 7.x or later
- Git

### Installation

```bash
npm install
```

This will install all dependencies and run the build process via the `prepare` script.

## Available Scripts

### Core Scripts

- `npm run build` - Transpile source code with Babel
- `npm test` - Run the full test suite
- `npm run prepare` - Prepare package (runs automatically on install)

### Development Scripts

- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run watch` - Watch and build source files

### Version Management

- `npm run version:sync` - Sync package.json version with git tags
- `npm run version:check` - Check if versions are consistent
- `npm run version:next` - Show next version suggestion

### Build and Release

- `npm run build:full` - Full build with tests and validation
- `npm run release:patch` - Create a patch release
- `npm run release:minor` - Create a minor release  
- `npm run release:major` - Create a major release
- `npm run release:dry` - Dry run release (no changes)

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

- `test/index_test.js` - Core functionality tests
- `test/edge-cases.test.js` - Edge cases and error handling
- `test/integration.test.js` - Integration tests with HTML output
- `test/version.test.js` - Version management tests

### Coverage Requirements

The project maintains high code coverage standards:
- Lines: 80%
- Statements: 80%
- Functions: 80%
- Branches: 70%

## Building

### Local Build

```bash
# Standard build
npm run build

# Full build with tests and validation
npm run build:full
```

### Build Process

1. **Clean** - Remove previous build artifacts
2. **Transpile** - Babel transpilation from `src/` to `lib/`
3. **Test** - Run full test suite
4. **Validate** - Check version consistency

## Release Process

### Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/):

- `PATCH` - Bug fixes, documentation updates
- `MINOR` - New features, backward compatible
- `MAJOR` - Breaking changes

### Local Release

```bash
# Create a patch release
npm run release:patch

# Create a minor release
npm run release:minor

# Create a major release
npm run release:major

# Dry run (preview changes)
npm run release:dry
```

### Automated Release

Releases are automated via GitHub Actions:

1. **Tag-based Release** - Push a version tag to trigger automatic release
2. **Manual Release** - Use GitHub Actions workflow with manual trigger

#### Creating a Release

```bash
# Method 1: Using release scripts (recommended)
npm run release:patch
git push origin master
git push origin --tags

# Method 2: Manual tagging
git tag v1.2.3
git push origin v1.2.3
```

## GitHub Actions

### CI Workflow

- **Trigger**: Push to master/develop, Pull requests
- **Tests**: Multiple Node.js versions (14.x, 16.x, 18.x, 20.x)
- **Coverage**: Automatic coverage reporting
- **Validation**: Version consistency checks

### Release Workflow

- **Trigger**: Git tags matching `v*`
- **Process**: Test → Build → Release → Publish
- **Artifacts**: NPM package, GitHub release

### Manual Release Workflow

- **Trigger**: Manual dispatch via GitHub UI
- **Options**: Release type (patch/minor/major), dry run
- **Process**: Full release cycle with git push

## Code Quality

### Standards

- **ES6+** syntax with Babel transpilation
- **Consistent** formatting and naming
- **Clear** documentation and comments
- **Comprehensive** test coverage

### Code Style

- Use `const` and `let` appropriately
- Follow existing patterns in the codebase
- Add comments for complex logic
- Maintain backward compatibility

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clean and rebuild
   rm -rf lib node_modules
   npm install
   npm run build
   ```

2. **Test Failures**
   ```bash
   # Run specific test file
   npm run build && npx mocha test/specific-test.js
   ```

3. **Version Inconsistencies**
   ```bash
   # Sync versions
   npm run version:sync
   npm run version:check
   ```

### Debug Mode

```bash
# Enable debug output
DEBUG=remark-wiki-link-a npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes with tests
4. Run full test suite
5. Submit pull request

### Pull Request Checklist

- [ ] Tests pass (`npm test`)
- [ ] Coverage maintained (`npm run test:coverage`)
- [ ] Build succeeds (`npm run build:full`)
- [ ] Version check passes (`npm run version:check`)
- [ ] Documentation updated (if needed)

## Architecture

### Source Structure

```
src/
├── index.js          # Main plugin code
test/
├── index_test.js     # Core tests
├── edge-cases.test.js # Edge case tests
├── integration.test.js # Integration tests
└── version.test.js   # Version tests
scripts/
├── build.js          # Build script
├── release.js        # Release script
├── version.js        # Version management
└── install.sh        # Installation script
```

### Plugin Architecture

The plugin follows the unified/remark architecture:

1. **Parser Integration** - Registers inline tokenizer
2. **AST Node Creation** - Creates `wikiLink` nodes
3. **HTML Transformation** - Provides data for rehype conversion

## License

MIT © [Adam Twardoch](https://twardoch.github.io)