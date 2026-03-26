# MCP Playwright Configuration

## Configuration MCP

Ce projet est configuré avec un serveur MCP Playwright qui permet d'automatiser les tests du navigateur directement depuis Cursor.

### Fichier de configuration

Le fichier `.cursor/mcp.json` contient la configuration du serveur MCP Playwright :

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "env": {
        "NODE_PATH": "/Users/j.ni/IdeaProjects/happyrow-front/node_modules"
      }
    }
  }
}
```

**Note:** Previous configuration included `--workspace-root` argument which is not supported by `@playwright/mcp`. The server will use the current working directory automatically.

## Activation dans Cursor

### Option 1 : Configuration globale (Recommandé pour usage permanent)

1. Ouvrir Cursor Settings : `Cmd+,` (macOS) ou `Ctrl+,` (Windows/Linux)
2. Rechercher "MCP" dans la barre de recherche
3. Cliquer sur "Edit in settings.json"
4. Ajouter la configuration suivante dans `"mcpServers"` :

```json
{
  "mcpServers": {
    "playwright-happyrow": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"],
      "env": {
        "NODE_PATH": "/Users/j.ni/IdeaProjects/happyrow-front/node_modules"
      }
    }
  }
}
```

5. Redémarrer Cursor

### Option 2 : Configuration par projet (Actuelle)

La configuration est déjà présente dans `.cursor/mcp.json` de ce projet. Cursor devrait la détecter automatiquement.

Pour vérifier :

1. Ouvrir le Command Palette : `Cmd+Shift+P` (macOS) ou `Ctrl+Shift+P` (Windows/Linux)
2. Rechercher "MCP: List Servers"
3. Vous devriez voir "playwright" dans la liste

## Utilisation

Une fois le serveur MCP activé, vous pouvez utiliser Playwright directement dans vos conversations avec l'assistant :

### Exemples de commandes

1. **Tester l'installation PWA** :

   ```
   Utilise Playwright pour :
   1. Ouvrir http://localhost:4173
   2. Vérifier que le manifest PWA est présent
   3. Prendre une capture d'écran de la page
   ```

2. **Tester le mode offline** :

   ```
   Utilise Playwright pour :
   1. Ouvrir l'app
   2. Activer le mode offline
   3. Vérifier que la page se charge depuis le cache
   ```

3. **Test d'interface** :
   ```
   Utilise Playwright pour :
   1. Cliquer sur le bouton "Créer un événement"
   2. Remplir le formulaire
   3. Soumettre et vérifier la redirection
   ```

## Outils disponibles

Le serveur MCP Playwright expose les outils suivants :

- **playwright_navigate** : Naviguer vers une URL
- **playwright_screenshot** : Prendre une capture d'écran
- **playwright_click** : Cliquer sur un élément
- **playwright_fill** : Remplir un champ de formulaire
- **playwright_evaluate** : Exécuter du JavaScript dans la page
- **playwright_close** : Fermer le navigateur
- Et plus encore...

## Dépendances installées

- `@playwright/mcp` : Serveur MCP Playwright officiel
- `playwright` : Bibliothèque Playwright
- Navigateurs installés : Chromium (headless)

## Troubleshooting

### Le serveur MCP ne démarre pas

1. Vérifier que les dépendances sont installées :

   ```bash
   npm list @playwright/mcp playwright
   ```

2. Réinstaller si nécessaire :
   ```bash
   npm install -D @playwright/mcp playwright
   npx playwright install chromium
   ```

### Node.js introuvable

Si vous utilisez nvm, assurez-vous que le PATH est correct :

```bash
which node
# /Users/j.ni/.nvm/versions/node/v23.1.0/bin/node
```

Mettez à jour le PATH dans la configuration MCP si nécessaire.

### Permission denied

Sur macOS, vous devrez peut-être autoriser Chromium dans les Préférences Système :

1. Préférences Système > Sécurité et confidentialité
2. Onglet Confidentialité > Accessibilité
3. Autoriser Terminal ou Cursor

## Scripts NPM

### Tests E2E avec Playwright

```bash
# Lancer les tests E2E (démarre le serveur preview automatiquement)
npm run test:e2e

# Lancer les tests avec l'interface UI
npm run test:e2e:ui

# Lancer les tests en mode headed (voir le navigateur)
npm run test:e2e:headed

# Générer du code Playwright interactivement
npm run playwright:codegen
```

### Scripts NPM standards

Vous pouvez ajouter des scripts dans `package.json` pour faciliter l'utilisation :

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "playwright:codegen": "playwright codegen http://localhost:5173"
  }
}
```

✅ **Ces scripts sont déjà ajoutés au `package.json`**

## Configuration Playwright

La configuration Playwright est déjà créée dans `playwright.config.ts` avec :

- Tests dans `tests/e2e/`
- Serveur de preview lancé automatiquement
- Screenshots sur échec
- Traces pour le debugging

### Exemple de test

Un exemple de test PWA est disponible dans `tests/e2e/pwa.spec.ts` qui teste :

- ✅ Présence du manifest PWA
- ✅ Icône Apple Touch
- ✅ Enregistrement du Service Worker
- ✅ Mode offline basique

Pour lancer les tests :

```bash
npm run test:e2e
```

## Configuration Playwright (Optionnel)

Pour créer une configuration Playwright complète, créez un fichier `playwright.config.ts` :

```bash
npx playwright init
```

Cela générera une configuration avec des exemples de tests.

## Ressources

- [Playwright MCP Documentation](https://github.com/microsoft/playwright-mcp)
- [Playwright Documentation](https://playwright.dev)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Cursor MCP Guide](https://docs.cursor.com/mcp)

## Status

✅ **Configuré** - Le serveur MCP Playwright est installé et prêt à être utilisé dans Cursor.
