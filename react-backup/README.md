# HappyRow Frontend

A React + TypeScript + Vite application with automated deployment via GitHub Actions.

## Features

- ⚡️ Vite for fast development and building
- ⚛️ React 19 with TypeScript
- 🧪 Vitest for testing
- 🐳 Docker support with multi-stage builds
- 🚀 Automated deployment with GitHub Actions
- 📦 GitHub Container Registry integration

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Deployment

This project includes automated deployment via GitHub Actions:

- **GitHub Pages**: Automatic deployment to `https://[username].github.io/happyrow-front/`
- **Docker**: Containerized deployment with GitHub Container Registry
- **Pull Requests**: Automated testing and validation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Docker

```bash
# Development
npm run docker:dev

# Production
npm run docker:prod

# Build specific targets
npm run docker:build:dev
npm run docker:build:prod
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
//  eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
