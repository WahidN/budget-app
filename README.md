# Budget App

A budget management application built with React, TypeScript, Vite, and Firebase Authentication.

## Features

- 📊 Budget tracking and management
- 💰 Income and expense tracking
- 📅 Monthly budget planning
- 🔐 Google Authentication (via Firebase)
- ☁️ Cloud database (Firestore) with automatic sync
- 💾 Local storage backup

## Setup

### Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)
- A Firebase project

### Firebase Setup

1. Create a new project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Authentication** and select **Google** as a sign-in provider
3. Enable **Firestore Database**:
   - Go to Firestore Database in the Firebase Console
   - Click "Create database"
   - Start in **test mode** (we'll add security rules next)
   - Choose a location close to your users
4. Set up Firestore Security Rules:
   - Go to Firestore Database > Rules
   - Copy the contents of `firestore.rules` from this project
   - Paste and publish the rules
   - These rules ensure users can only access their own budget data
5. Go to Project Settings > General
6. Under "Your apps", add a web app (if not already added)
7. Copy the Firebase configuration values
8. Create a `.env` file in the root directory based on `.env.example`:

```bash
cp .env.example .env
```

9. Fill in your Firebase configuration values in `.env`

### Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Authentication

The app uses Firebase Authentication with Google Sign-In. Users must sign in with their Google account to access the dashboard and subscriptions pages.

## Tech Stack

- React 19
- TypeScript
- Vite
- Firebase Authentication
- Zustand (state management)
- Tailwind CSS
- React Router

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
