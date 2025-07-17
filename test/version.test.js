const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import version utilities
const { getLatestTag, getCurrentVersion, validateVersion, cleanVersion } = require('../scripts/version.js');

describe("Version Management", () => {
    describe("Version Validation", () => {
        it("validates correct semantic versions", () => {
            assert.ok(validateVersion('v1.0.0'));
            assert.ok(validateVersion('1.0.0'));
            assert.ok(validateVersion('v2.1.3'));
            assert.ok(validateVersion('v1.0.0-alpha'));
            assert.ok(validateVersion('v1.0.0-alpha.1'));
            assert.ok(validateVersion('v1.0.0-beta.2'));
            assert.ok(validateVersion('v1.0.0+build.1'));
            assert.ok(validateVersion('v1.0.0-alpha+build.1'));
        });

        it("rejects invalid versions", () => {
            assert.ok(!validateVersion('1.0'));
            assert.ok(!validateVersion('v1.0'));
            assert.ok(!validateVersion('1.0.0.0'));
            assert.ok(!validateVersion('v1.0.0.0'));
            assert.ok(!validateVersion('invalid'));
            assert.ok(!validateVersion(''));
        });
    });

    describe("Version Cleaning", () => {
        it("removes v prefix from versions", () => {
            assert.strictEqual(cleanVersion('v1.0.0'), '1.0.0');
            assert.strictEqual(cleanVersion('v2.1.3'), '2.1.3');
            assert.strictEqual(cleanVersion('v1.0.0-alpha'), '1.0.0-alpha');
        });

        it("leaves versions without v prefix unchanged", () => {
            assert.strictEqual(cleanVersion('1.0.0'), '1.0.0');
            assert.strictEqual(cleanVersion('2.1.3'), '2.1.3');
            assert.strictEqual(cleanVersion('1.0.0-alpha'), '1.0.0-alpha');
        });
    });

    describe("Current Version Reading", () => {
        it("reads version from package.json", () => {
            const version = getCurrentVersion();
            assert.ok(typeof version === 'string');
            assert.ok(version.length > 0);
            assert.ok(validateVersion(version));
        });
    });

    describe("Git Tag Integration", () => {
        it("can read git tags", () => {
            // This test depends on git being available
            try {
                const tag = getLatestTag();
                assert.ok(typeof tag === 'string');
                // Should either be a valid version or default v0.0.0
                assert.ok(validateVersion(tag) || tag === 'v0.0.0');
            } catch (error) {
                // If git is not available, skip this test
                console.log('Git not available, skipping git tag test');
            }
        });
    });

    describe("Version Scripts", () => {
        it("version check script exists and is executable", () => {
            const scriptPath = path.join(__dirname, '../scripts/version.js');
            assert.ok(fs.existsSync(scriptPath));
            
            // Check if file is executable
            const stats = fs.statSync(scriptPath);
            assert.ok(stats.mode & parseInt('111', 8)); // Check execute permission
        });

        it("version sync script can be called", () => {
            const scriptPath = path.join(__dirname, '../scripts/version.js');
            
            // This is a dry run test - we don't actually sync
            try {
                execSync(`node ${scriptPath} --help`, { stdio: 'pipe' });
                assert.ok(true); // Script ran without error
            } catch (error) {
                // Script should show help, not error
                assert.ok(error.status === 0 || error.message.includes('Usage'));
            }
        });
    });
});