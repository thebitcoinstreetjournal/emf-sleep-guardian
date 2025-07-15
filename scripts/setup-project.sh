#!/bin/bash

# EMF Sleep Guardian Project Setup Script
set -e

echo "🌙 Setting up EMF Sleep Guardian project..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup React Native CLI if not installed
if ! command -v react-native &> /dev/null; then
    echo "📱 Installing React Native CLI..."
    npm install -g react-native-cli
fi

# Setup iOS dependencies (if on macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Setting up iOS dependencies..."
    
    # Check if CocoaPods is installed
    if ! command -v pod &> /dev/null; then
        echo "Installing CocoaPods..."
        sudo gem install cocoapods
    fi
    
    # Install iOS pods
    cd ios
    pod install
    cd ..
    
    echo "✅ iOS setup complete!"
else
    echo "⚠️  iOS setup skipped (not on macOS)"
fi

# Setup Android (if Android SDK is available)
if [ -d "$ANDROID_HOME" ]; then
    echo "🤖 Android SDK found, setting up Android..."
    
    # Create local.properties file
    echo "sdk.dir=$ANDROID_HOME" > android/local.properties
    
    echo "✅ Android setup complete!"
else
    echo "⚠️  Android SDK not found. Please install Android Studio and set ANDROID_HOME."
fi

# Create necessary directories
mkdir -p assets
mkdir -p src/components
mkdir -p src/screens
mkdir -p src/utils
mkdir -p src/services

# Create development environment file
cp .env.example .env

echo "✅ Project setup complete!"
echo ""
echo "🚀 Next steps:"
echo "1. Update your team ID in ios/ExportOptions.plist"
echo "2. Configure your app icons using the icon generation script"
echo "3. Set up your development certificates for iOS"
echo "4. Configure your Android signing keys"
echo "5. Run 'npm run android' or 'npm run ios' to start development"
echo ""
echo "📖 Available commands:"
echo "  npm run android          - Run on Android"
echo "  npm run ios             - Run on iOS"
echo "  npm run web             - Run web version"
echo "  npm test                - Run tests"
echo "  npm run lint            - Run linter"
echo "  npm run build:android   - Build Android APK"
echo "  npm run build:ios       - Build iOS archive"
echo "  npm run build:web       - Build web version"
echo ""
echo "🌙 Happy coding!"