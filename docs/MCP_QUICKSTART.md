# Guide de Démarrage Rapide - MCP Playwright

## ✅ Configuration Terminée

Le serveur MCP Playwright est installé et configuré dans votre projet HappyRow !

## 🚀 Comment l'utiliser dans Cursor

### Étape 1 : Redémarrer Cursor

Pour que Cursor détecte la nouvelle configuration MCP :

1. Fermer complètement Cursor (`Cmd+Q` sur macOS)
2. Rouvrir Cursor dans ce projet

### Étape 2 : Vérifier que le MCP est actif

1. Ouvrir le Command Palette : `Cmd+Shift+P` (macOS) ou `Ctrl+Shift+P` (Windows/Linux)
2. Rechercher "MCP"
3. Vous devriez voir des commandes MCP disponibles

### Étape 3 : Tester avec l'Assistant

Dans une conversation avec l'assistant Cursor, essayez :

```
Lance l'app en preview et utilise Playwright pour :
1. Ouvrir la page d'accueil
2. Prendre une capture d'écran
3. Vérifier que le titre contient "HappyRow"
```

Ou :

```
Utilise Playwright pour tester l'installation PWA :
1. Ouvrir http://localhost:4173
2. Vérifier le manifest
3. Vérifier l'icône Apple Touch
```

## 📖 Exemples d'Utilisation

### Test de Navigation

```
Utilise Playwright pour :
- Aller sur la page d'accueil
- Cliquer sur "Créer un événement"
- Remplir le formulaire
- Vérifier la redirection
```

### Test PWA

```
Utilise Playwright pour :
- Ouvrir l'app
- Vérifier l'enregistrement du Service Worker
- Activer le mode offline
- Vérifier que l'app fonctionne hors ligne
```

### Capture d'écran

```
Utilise Playwright pour :
- Ouvrir la page d'accueil
- Prendre une capture d'écran en dark mode
- Sauvegarder dans tests/e2e/screenshots/
```

### Test Responsive

```
Utilise Playwright pour :
- Ouvrir l'app en viewport mobile (iPhone 12)
- Naviguer dans l'app
- Vérifier que le menu burger fonctionne
- Prendre des captures d'écran
```

## 🧪 Tests E2E Playwright

En plus du MCP, des tests Playwright sont déjà configurés :

```bash
# Lancer tous les tests
npm run test:e2e

# Mode UI (interface graphique)
npm run test:e2e:ui

# Mode headed (voir le navigateur)
npm run test:e2e:headed

# Générer du code de test
npm run playwright:codegen
```

## 🔧 Tests Disponibles

### `tests/e2e/pwa.spec.ts`

Tests PWA complets :

- ✅ Manifest PWA présent
- ✅ Icône Apple Touch configurée
- ✅ Service Worker enregistré
- ✅ Mode offline fonctionne
- ✅ Pas d'erreurs JavaScript

Lancer ces tests :

```bash
npm run test:e2e
```

## 📁 Structure des Tests

```
tests/
├── e2e/
│   ├── pwa.spec.ts          # Tests PWA
│   └── screenshots/         # Captures d'écran (gitignored)
└── [autres tests vitest]

playwright.config.ts          # Configuration Playwright
.cursor/mcp.json             # Configuration MCP
```

## 🐛 Debugging

### Voir les tests en action

```bash
npm run test:e2e:headed
```

### Interface UI pour déboguer

```bash
npm run test:e2e:ui
```

### Traces Playwright

Les traces sont automatiquement capturées sur échec. Pour les voir :

```bash
npx playwright show-trace test-results/[chemin-vers-trace]
```

## 💡 Astuces

### 1. Générer du Code Automatiquement

```bash
npm run playwright:codegen
```

Cette commande ouvre un navigateur et génère du code Playwright pendant que vous interagissez avec l'app.

### 2. Tests en Parallèle

Playwright lance les tests en parallèle par défaut. Pour les exécuter séquentiellement :

```bash
npx playwright test --workers=1
```

### 3. Filtrer les Tests

```bash
# Exécuter seulement les tests PWA
npx playwright test pwa

# Exécuter un test spécifique
npx playwright test -g "should have PWA manifest"
```

## 🔗 Ressources

- [Documentation MCP Playwright](MCP_PLAYWRIGHT_SETUP.md)
- [Documentation PWA](./PWA_IMPLEMENTATION.md)
- [Playwright Docs](https://playwright.dev)
- [MCP Docs](https://modelcontextprotocol.io)

## ❓ FAQ

### Le MCP ne démarre pas

1. Vérifier que `@playwright/mcp` est installé : `npm list @playwright/mcp`
2. Vérifier que Chromium est installé : `npx playwright install chromium`
3. Redémarrer Cursor complètement

### Les tests échouent

1. Vérifier que l'app est buildée : `npm run build`
2. Le serveur preview démarre automatiquement via `webServer` config
3. Attendre que le serveur soit prêt (timeout 120s)

### Cursor ne détecte pas le MCP

1. Vérifier que `.cursor/mcp.json` existe
2. Le fichier doit être à la racine du workspace
3. Redémarrer Cursor **complètement** (`Cmd+Q` puis rouvrir)

## 🎉 C'est Prêt !

Vous pouvez maintenant utiliser Playwright directement dans vos conversations avec l'assistant Cursor pour automatiser vos tests ! 🚀
