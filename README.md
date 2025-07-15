# EMF Sleep Guardian

A cross-platform mobile and web application designed to help users reduce electromagnetic field (EMF) exposure and improve sleep quality through healthy nighttime habits.

## Features

- 🌙 **Sleep Optimization**: Daily reminders for healthy sleep habits
- 📱 **EMF Reduction**: Guidance on reducing electromagnetic exposure
- 🎯 **Gamification**: Health scoring system and streak tracking
- 🔗 **Nostr Integration**: Decentralized social features for sharing progress
- 📚 **Educational Content**: Science-based information about EMF and sleep
- 🔔 **Smart Notifications**: Customizable reminder system

## Key Health Practices

1. **WiFi Router Shutdown**: Turn off your router before bedtime
2. **Phone Distance**: Keep devices at least 6 feet from your bed
3. **Smart TV Management**: Power down WiFi-enabled entertainment devices
4. **Microwave Alternatives**: Encourage stovetop cooking over microwave use

## Installation

### Prerequisites
- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/thebitcoinstreetjournal/emf-sleep-guardian.git
cd emf-sleep-guardian
```

2. Install dependencies:
```bash
npm install
```

3. For iOS, install CocoaPods:
```bash
cd ios
pod install
cd ..
```

### Running the App

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

#### Web
```bash
npm run web
```

### Building for Production

#### Android APK
```bash
npm run build:android
```

#### iOS Archive
```bash
npm run build:ios
```

#### Web Build
```bash
npm run build:web
```

## Project Structure

```
emf-sleep-guardian/
├── src/
│   ├── App.js                 # Main app component
│   ├── index.web.js          # Web entry point
│   └── utils/
│       └── nostrClient.js    # Nostr integration
├── android/                   # Android-specific files
├── ios/                      # iOS-specific files
├── public/                   # Web assets
├── assets/                   # App icons and images
├── package.json
├── app.json
├── babel.config.js
├── metro.config.js
└── webpack.config.js
```

## Nostr Integration

The app includes optional Nostr protocol integration for:
- Sharing sleep health progress
- Receiving community tips and motivation
- Decentralized social features

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Health Disclaimer

This app provides general wellness information and should not replace professional medical advice. The recommendations are based on research about electromagnetic fields and sleep hygiene. Consult with healthcare professionals for personalized medical guidance.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Privacy Policy

We respect your privacy. This app stores data locally on your device and only shares information through Nostr if you explicitly enable that feature. No personal data is collected or transmitted to third-party servers without your consent.

## Support

For support, please open an issue on GitHub or contact us at support@emfsleepguardian.com

## Acknowledgments

- Research on EMF exposure and sleep quality
- Nostr protocol development community
- React Native community
- Contributors and beta testers

---

Sleep better, live healthier 🌙