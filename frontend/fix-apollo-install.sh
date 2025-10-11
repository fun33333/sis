#!/bin/bash
echo "Fixing Apollo Client Installation..."

echo ""
echo "Step 1: Clearing npm cache..."
npm cache clean --force

echo ""
echo "Step 2: Removing node_modules..."
rm -rf node_modules

echo ""
echo "Step 3: Removing package-lock.json..."
rm -f package-lock.json

echo ""
echo "Step 4: Installing packages fresh..."
npm install

echo ""
echo "Step 5: Installing Apollo Client specifically..."
npm install @apollo/client@latest graphql@latest

echo ""
echo "Step 6: Verifying installation..."
if [ -d "node_modules/@apollo/client" ]; then
    echo "✅ Apollo Client installed successfully!"
else
    echo "❌ Apollo Client installation failed!"
fi

echo ""
echo "Installation complete!"
