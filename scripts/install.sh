#!/bin/bash

# Installation script for remark-wiki-link-a
# This script provides multiple ways to install the package

set -e

PACKAGE_NAME="remark-wiki-link-a"
GITHUB_REPO="twardoch/remark-wiki-link-a"

echo "🚀 Installing ${PACKAGE_NAME}..."

# Check if we have a version argument
VERSION=${1:-"latest"}
if [ "$VERSION" != "latest" ] && [ "$VERSION" != "" ]; then
    VERSION_ARG="@${VERSION}"
else
    VERSION_ARG=""
fi

# Detect package manager
if command -v npm &> /dev/null; then
    PACKAGE_MANAGER="npm"
elif command -v yarn &> /dev/null; then
    PACKAGE_MANAGER="yarn"
elif command -v pnpm &> /dev/null; then
    PACKAGE_MANAGER="pnpm"
else
    echo "❌ No package manager found. Please install npm, yarn, or pnpm first."
    exit 1
fi

echo "📦 Using ${PACKAGE_MANAGER} to install ${PACKAGE_NAME}${VERSION_ARG}..."

# Install based on package manager
case $PACKAGE_MANAGER in
    "npm")
        npm install ${PACKAGE_NAME}${VERSION_ARG}
        ;;
    "yarn")
        yarn add ${PACKAGE_NAME}${VERSION_ARG}
        ;;
    "pnpm")
        pnpm add ${PACKAGE_NAME}${VERSION_ARG}
        ;;
esac

echo "✅ ${PACKAGE_NAME} installed successfully!"
echo ""
echo "📖 Quick start:"
echo "  const wikiLinkPlugin = require('${PACKAGE_NAME}');"
echo "  // Use with unified/remark processor"
echo ""
echo "🔗 Documentation: https://github.com/${GITHUB_REPO}#readme"
echo "🐛 Issues: https://github.com/${GITHUB_REPO}/issues"