@echo off
echo 🚀 Testing Expense Tracker Pro Deployment
echo ==========================================

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

:: Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version
echo ✅ npm version: 
npm --version

:: Install dependencies
echo 📦 Installing dependencies...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

:: Build the project
echo 🔨 Building the project...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Build completed successfully

:: Check if dist directory exists
if not exist "dist" (
    echo ❌ dist directory not found
    pause
    exit /b 1
)

echo ✅ dist directory exists

:: Check if index.html exists
if not exist "dist\index.html" (
    echo ❌ index.html not found in dist
    pause
    exit /b 1
)

echo ✅ index.html exists in dist

echo 📊 Build Statistics:
echo ====================
for /f %%i in ('dir /s /b dist\*.* ^| find /c /v ""') do echo Total files in dist: %%i
for /f %%i in ('dir /s /b dist\*.css ^| find /c /v ""') do echo CSS files: %%i
for /f %%i in ('dir /s /b dist\*.js ^| find /c /v ""') do echo JS files: %%i

echo.
echo 🎉 Deployment test completed successfully!
echo Your app is ready to deploy to Vercel!
echo.
echo Next steps:
echo 1. Push your code to GitHub
echo 2. Connect GitHub to Vercel
echo 3. Deploy with one click!
echo.
echo Or use Vercel CLI:
echo   npm i -g vercel
echo   vercel login
echo   vercel
echo.
pause
