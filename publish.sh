#!/bin/bash

# VS Code Extension Publishing Script
# Run this script to publish your extension to the marketplace

echo "🚀 VS Code Extension Publishing Script"
echo "====================================="

# Check if vsce is installed
if ! command -v vsce &> /dev/null; then
    echo "❌ vsce is not installed. Installing..."
    npm install -g @vscode/vsce
fi

# Check if user is logged in
echo "🔐 Checking VS Code Marketplace login..."
if ! vsce verify-pat &> /dev/null; then
    echo "❌ You are not logged in to VS Code Marketplace."
    echo ""
    echo "📝 To login, run one of these commands:"
    echo "   vsce login <publisher-name>"
    echo "   # OR set PAT directly:"
    echo "   export VSCE_PAT=your_personal_access_token"
    echo ""
    echo "🔑 Get your PAT from: https://dev.azure.com/YOUR_ORG/_usersSettings/tokens"
    echo "   - Organization: vscode"
    echo "   - Scopes: Marketplace > Manage"
    exit 1
fi

# Package the extension
echo "📦 Packaging extension..."
if vsce package --no-dependencies; then
    echo "✅ Extension packaged successfully!"
else
    echo "❌ Packaging failed!"
    exit 1
fi

# Publish the extension
echo "🌐 Publishing to VS Code Marketplace..."
if vsce publish --no-dependencies; then
    echo "🎉 Extension published successfully!"
    echo ""
    echo "📊 Check your extension at:"
    echo "   https://marketplace.visualstudio.com/items?itemName=greatstackdev.todo-task-reminder"
    echo ""
    echo "📈 Monitor downloads and ratings in your publisher dashboard:"
    echo "   https://marketplace.visualstudio.com/manage/publishers/greatstackdev"
else
    echo "❌ Publishing failed!"
    echo ""
    echo "🔍 Common issues:"
    echo "   - Check your PAT has correct scopes"
    echo "   - Verify publisher name matches your account"
    echo "   - Ensure version number is higher than previous"
    exit 1
fi