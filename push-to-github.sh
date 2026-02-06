#!/bin/bash
# push-to-github.sh - Push opencode-bot to GitHub
# Usage: ./push-to-github.sh

set -e

echo "🚀 Pushing opencode-bot to GitHub..."
echo ""

cd ~/Desktop/opencode-bot-github

# Check current status
echo "📊 Current branch:"
git branch -v

echo ""
echo "📝 Latest commits:"
git log --oneline -5

echo ""
echo "🌐 Remote configured:"
git remote -v

echo ""
echo "⬆️  Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Successfully pushed to https://github.com/Misaka-15134/opencode-bot"
