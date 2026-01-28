# 🚀 Setup Rapide - Protection Shai-Hulud

Ce guide vous permet de mettre en place **toutes les protections en 15 minutes**.

## ⚡ Installation Express

### 1. Configuration npm (2 min)

```bash
# Copier-coller ces 3 commandes
npm config set ignore-scripts true
npm config set audit true
npm config set save-exact true
```

### 2. Outils de sécurité (3 min)

```bash
# Installation globale
npm install -g npq lockfile-lint

# Installation projet
cd /Users/j.ni/IdeaProjects/happyrow-front
npm install --ignore-scripts
```

### 3. Secrets Manager (5 min)

**Option A : 1Password CLI (Recommandé macOS)**

```bash
# Installer
brew install --cask 1password-cli

# Créer un vault "Development" dans 1Password app

# Ajouter vos secrets dans 1Password :
# - Nom: "Supabase - Dev"
# - Champs: url, anon-key

# Lancer l'app
op run -- npm run dev
```

**Option B : Développement local temporaire**

```bash
# ⚠️ Pour dev seulement, pas pour production !
# Copiez votre .env actuel (gardez les vraies valeurs pour l'instant)
# Mais planifiez la migration vers 1Password rapidement
```

### 4. Alias pratiques (2 min)

```bash
# Ajouter à ~/.zshrc
echo '# Security aliases' >> ~/.zshrc
echo 'alias npm-safe="npm install --ignore-scripts"' >> ~/.zshrc
echo 'alias npm-dev="op run -- npm run dev"' >> ~/.zshrc
source ~/.zshrc
```

### 5. Test (3 min)

```bash
# Vérifier la configuration
npm run security:check

# Lancer le dev
npm run dev  # ou npm-dev si 1Password configuré
```

## ✅ Checklist de Vérification

Après le setup, vérifiez :

```bash
# 1. npm config correcte
npm config get ignore-scripts  # Doit afficher "true"

# 2. Outils installés
npq --version
lockfile-lint --version

# 3. Projet sécurisé
npm run security:lockfile  # Doit passer
npm audit                  # Vérifier les vulnérabilités

# 4. App fonctionne
npm run dev
npm run build
npm test
```

## 🎯 Utilisation Quotidienne

### Installer un package

```bash
npq install <package-name>
```

### Développer

```bash
npm-dev  # avec 1Password
# ou
npm run dev  # sans (moins sécurisé)
```

### Mettre à jour

```bash
npx npm-check-updates --interactive
```

## 📚 Documentation Complète

- **Guide principal** : [`SECURITY.md`](./SECURITY.md)
- **Gestion secrets** : [`SECRETS_MANAGEMENT.md`](./SECRETS_MANAGEMENT.md)
- **Audit dépendances** : [`DEPENDENCY_AUDIT.md`](./DEPENDENCY_AUDIT.md)
- **Publication npm** : [`NPM_PUBLISHING_SECURITY.md`](./NPM_PUBLISHING_SECURITY.md)

## 🆘 Problèmes Courants

### "npq: command not found"

```bash
npm install -g npq
```

### "lockfile-lint: command not found"

```bash
npm install --save-dev lockfile-lint
```

### "op: command not found"

```bash
brew install --cask 1password-cli
```

### Scripts bloqués

```bash
# Certains packages légitimes nécessitent des scripts
# Utiliser @lavamoat/allow-scripts pour whitelist
npm run allow-scripts
```

## ⚠️ Important

- **Ne jamais** utiliser `npm install` sans `npq` pour nouveaux packages
- **Ne jamais** commiter de secrets en clair
- **Ne jamais** faire `npm update` en aveugle
- **Toujours** review les changements de lockfile

## 🎉 Vous êtes Protégé !

Votre projet est maintenant protégé contre Shai-Hulud et les attaques supply chain.

**Prochaines étapes :**

1. Lire [`SECURITY.md`](./SECURITY.md) en détail
2. Migrer tous vos secrets vers 1Password
3. Partager ce guide avec votre équipe
4. Activer les GitHub Actions de sécurité

---

**🛡️ Stay safe!**
