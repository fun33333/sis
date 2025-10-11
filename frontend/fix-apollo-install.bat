@echo off
echo Fixing Apollo Client Installation...
cd /d "%~dp0"

echo.
echo Step 1: Clearing npm cache...
npm cache clean --force

echo.
echo Step 2: Removing node_modules...
if exist node_modules rmdir /s /q node_modules

echo.
echo Step 3: Removing package-lock.json...
if exist package-lock.json del package-lock.json

echo.
echo Step 4: Installing packages fresh...
npm install

echo.
echo Step 5: Installing Apollo Client specifically...
npm install @apollo/client@latest graphql@latest

echo.
echo Step 6: Verifying installation...
if exist node_modules\@apollo\client (
    echo ✅ Apollo Client installed successfully!
) else (
    echo ❌ Apollo Client installation failed!
)

echo.
echo Installation complete!
pause
