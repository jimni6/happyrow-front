# HappyRow Mobile App

A React Native mobile application built with Expo for testing database connections to the HappyRow backend service.

## 🚀 Features

- **Connection Testing**: Test connectivity to the HappyRow backend API
- **Clean Architecture**: Domain-driven design with clear separation of concerns
- **Cross-Platform**: Runs on iOS, Android, and Web
- **TypeScript**: Full type safety throughout the application

## 📱 Architecture

The app follows clean architecture principles:

```
src/
├── domain/           # Business entities and interfaces
├── application/      # Use cases and business logic
├── infrastructure/   # External services (API repositories)
├── presentation/     # UI components and screens
└── config/          # Configuration files
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- For iOS development: Xcode (macOS only)
- For Android development: Android Studio

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd happyrow-front
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment configuration:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

### Running on Different Platforms

- **iOS Simulator**: `npm run ios`
- **Android Emulator**: `npm run android` 
- **Web Browser**: `npm run web`
- **Physical Device**: Scan QR code with Expo Go app

## 🏗️ Building for Production

### EAS Build Setup

1. Install EAS CLI:
```bash
npm install -g eas-cli
```

2. Login to Expo:
```bash
eas login
```

3. Configure your project:
```bash
eas build:configure
```

4. Build for different platforms:
```bash
# Preview build
eas build --platform all --profile preview

# Production build
eas build --platform all --profile production
```

### GitHub Actions Deployment

The project includes automated CI/CD workflows:

- **Test Workflow** (`.github/workflows/test.yml`): Runs on every push/PR
- **EAS Build Workflow** (`.github/workflows/eas-build.yml`): Builds and deploys the app

#### Required GitHub Secrets

Add these secrets in your GitHub repository settings:

- `EXPO_TOKEN`: Your Expo access token (get from https://expo.dev/accounts/[username]/settings/access-tokens)

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
EXPO_PUBLIC_API_BASE_URL=https://happyrow-core.onrender.com
EAS_PROJECT_ID=your-project-id-here
```

### API Configuration

The app automatically configures API endpoints:

- **Development & Production**: Direct connection to `https://happyrow-core.onrender.com`
- **Custom Override**: Set `EXPO_PUBLIC_API_BASE_URL` environment variable

## 📦 Project Structure

### Key Components

- **HomeScreen**: Main screen with connection test functionality
- **ConnectionButton**: Reusable button component for testing API connectivity
- **CheckConnection**: Use case for testing backend connectivity
- **ConnectionApiRepository**: API implementation for connection testing

### Business Logic

The app uses clean architecture patterns:

1. **Domain Layer**: Defines `ConnectionRepository` interface
2. **Application Layer**: Implements `CheckConnection` use case
3. **Infrastructure Layer**: Provides `ConnectionApiRepository` implementation
4. **Presentation Layer**: React Native UI components

## 🧪 Testing

Run tests with:
```bash
npm test
```

Check TypeScript compilation:
```bash
npx tsc --noEmit
```

Validate Expo configuration:
```bash
npx expo doctor
```

## 📱 App Store Deployment

### iOS App Store

1. Build production iOS app:
```bash
eas build --platform ios --profile production
```

2. Submit to App Store:
```bash
eas submit --platform ios --latest
```

### Google Play Store

1. Build production Android app:
```bash
eas build --platform android --profile production
```

2. Submit to Play Store:
```bash
eas submit --platform android --latest
```

## 🔄 Over-the-Air Updates

Deploy instant updates without app store approval:

```bash
eas update --auto
```

Updates are automatically published on main branch pushes via GitHub Actions.

## 🐛 Troubleshooting

### Common Issues

1. **Metro bundler issues**: Clear cache with `npx expo start --clear`
2. **iOS simulator not starting**: Ensure Xcode is properly installed
3. **Android emulator issues**: Check Android Studio AVD configuration
4. **API connection failures**: Verify backend service is running

### Development Tips

- Use Expo Go app for quick testing on physical devices
- Enable hot reloading for faster development
- Use Flipper for debugging React Native apps
- Check Expo documentation for platform-specific issues

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
