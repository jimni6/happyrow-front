# 🛡️ Guide de Sécurité - Protection Shai-Hulud

## 🚨 Contexte : Les Attaques Shai-Hulud et SHA1-Hulud

En 2025, les attaques **Shai-Hulud** et **SHA1-Hulud** ont compromis **plus de 800 packages npm**, incluant des packages populaires de Zapier, PostHog, et Postman.

### Comment fonctionnent ces attaques ?

1. **Injection de code malveillant** via scripts `postinstall` et `preinstall`
2. **Vol de credentials** : npm tokens, GitHub tokens, AWS/Azure/GCP keys
3. **Exfiltration de données** via webhooks et GitHub workflows
4. **Propagation** : transforme votre machine en runner malveillant
5. **Destructeur** : peut effacer votre répertoire home

### Vecteurs d'attaque :

- ✅ Scripts lifecycle npm (postinstall, preinstall)
- ✅ Secrets en clair dans fichiers .env
- ✅ Lockfiles modifiés pour pointer vers packages malveillants
- ✅ Comptes npm mainteneurs compromis
- ✅ Supply chain attacks via dépendances transitives

## 🎯 Notre Protection : 12 Couches de Sécurité

Ce projet implémente **toutes les 12 recommandations** de l'article Snyk :

| #   | Protection                      | Status | Fichiers                     |
| --- | ------------------------------- | ------ | ---------------------------- |
| 1   | Scripts post-install désactivés | ✅     | `.npmrc`, `package.json`     |
| 2   | Installation avec cooldown      | ✅     | Scripts, workflow            |
| 3   | npq pour durcir installs        | ✅     | `.zshrc_security`            |
| 4   | Lockfile injection prevention   | ✅     | `package.json`, CI/CD        |
| 5   | Installations déterministes     | ✅     | `.github/workflows/`         |
| 6   | Pas de blind updates            | ✅     | `DEPENDENCY_AUDIT.md`        |
| 7   | Secrets sécurisés               | ✅     | `SECRETS_MANAGEMENT.md`      |
| 8   | Dev containers                  | ✅     | `.devcontainer/`             |
| 9   | 2FA npm (doc)                   | ✅     | `NPM_PUBLISHING_SECURITY.md` |
| 10  | Provenance (doc)                | ✅     | `NPM_PUBLISHING_SECURITY.md` |
| 11  | OIDC publishing (doc)           | ✅     | `NPM_PUBLISHING_SECURITY.md` |
| 12  | Dépendances minimales           | ✅     | `DEPENDENCY_AUDIT.md`        |

## 🚀 Quick Start : Configuration Initiale

### 1. Configuration npm (Machine locale)

```bash
# Désactiver les scripts lifecycle globalement
npm config set ignore-scripts true

# Activer l'audit automatique
npm config set audit true
npm config set audit-level moderate

# Versions exactes uniquement
npm config set save-exact true
```

### 2. Installer les outils de sécurité

```bash
# Installation globale des outils
npm install -g npq lockfile-lint

# Optionnel : 1Password CLI pour secrets
brew install --cask 1password-cli

# Optionnel : Infisical pour secrets
brew install infisical/get-cli/infisical
```

### 3. Configurer les alias (optionnel mais recommandé)

```bash
# Ajouter à votre ~/.zshrc ou ~/.bashrc
source /Users/j.ni/IdeaProjects/happyrow-front/.zshrc_security

# Recharger
source ~/.zshrc
```

### 4. Installer les dépendances du projet

```bash
cd /Users/j.ni/IdeaProjects/happyrow-front

# Installation sécurisée
npm install --save-dev lockfile-lint @lavamoat/allow-scripts
npm ci --ignore-scripts

# Vérifier la sécurité
npm run security:check
```

### 5. Configurer vos secrets (IMPORTANT !)

**⚠️ Ne jamais utiliser de secrets en clair dans .env**

Voir le guide complet : [`SECRETS_MANAGEMENT.md`](./SECRETS_MANAGEMENT.md)

```bash
# Option A : 1Password CLI
op run -- npm run dev

# Option B : Infisical
infisical run -- npm run dev
```

## 📋 Workflows Quotidiens

### Installation d'un nouveau package

```bash
# ❌ NE JAMAIS FAIRE
npm install <package>

# ✅ TOUJOURS FAIRE
npq install <package>
# Suivre les recommandations de npq

# Si npq approuve :
npm install --save <package> --ignore-scripts

# Tester
npm test
npm run build
```

### Développement local

```bash
# Sans secrets manager (dev seulement)
npm run dev:unsafe

# Avec 1Password (recommandé)
op run -- npm run dev

# Avec Infisical (recommandé)
infisical run -- npm run dev

# Ou utiliser les alias
npm-dev  # Si configuré dans .zshrc
```

### Mise à jour des dépendances

```bash
# ❌ DANGEREUX - Ne jamais faire
npm update
npx npm-check-updates -u

# ✅ SÉCURISÉ - Review interactif
npx npm-check-updates --interactive

# Pour chaque package à update :
npq install <package>@<new-version>

# Tester après chaque update
npm run test
npm run build
```

### Avant un commit

```bash
# Vérification automatique via Husky
# Mais vous pouvez aussi lancer manuellement :

# Lockfile validation
npm run security:lockfile

# Audit complet
npm run security:check

# Audit des dépendances
./scripts/audit-dependencies.sh
```

## 🔒 Protection des Secrets

### Niveau de Sécurité par Méthode

| Méthode               | Sécurité     | Facilité        | Recommandation         |
| --------------------- | ------------ | --------------- | ---------------------- |
| Plaintext .env        | ❌ DANGEREUX | ✅ Facile       | **NE JAMAIS UTILISER** |
| 1Password CLI         | ✅ Excellent | ⚠️ Setup requis | ✅ **RECOMMANDÉ**      |
| Infisical             | ✅ Excellent | ⚠️ Setup requis | ✅ **RECOMMANDÉ**      |
| Cloud Secrets Manager | ✅ Excellent | ⚠️ Complex      | Production             |

### Configuration 1Password (Recommandé)

```bash
# 1. Installer
brew install --cask 1password-cli

# 2. Créer vault "Development" dans 1Password app

# 3. Ajouter vos secrets dans 1Password

# 4. Modifier .env
VITE_SUPABASE_URL=op://Development/Supabase/url
VITE_SUPABASE_ANON_KEY=op://Development/Supabase/anon-key

# 5. Lancer avec 1Password
op run -- npm run dev
```

Voir guide complet : [`SECRETS_MANAGEMENT.md`](./SECRETS_MANAGEMENT.md)

## 🏗️ CI/CD Sécurisé

### GitHub Actions

Le projet utilise des workflows sécurisés :

**`.github/workflows/deploy.yml`** - Déploiement

- ✅ Validation du lockfile avant installation
- ✅ Installation avec `--ignore-scripts`
- ✅ Audit de sécurité
- ✅ Tests avant déploiement

**`.github/workflows/security-audit.yml`** - Audit quotidien

- ✅ Vérification lockfile
- ✅ Détection de scripts lifecycle
- ✅ Scan de vulnérabilités
- ✅ Vérification de l'âge des packages

### Secrets GitHub

**Configuration dans GitHub :**

1. Repository → Settings → Secrets and variables → Actions
2. Ajouter vos secrets :
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `VERCEL_TOKEN`
   - etc.

**❌ Ne jamais** commit de secrets dans le code ou .env

## 🐳 Développement en Container (Optionnel mais Recommandé)

### Pourquoi ?

- ✅ Isole les packages malveillants de votre système
- ✅ Empêche l'accès à vos autres repos
- ✅ Protège vos SSH keys et tokens
- ✅ Environnement reproductible

### Utilisation VS Code Dev Containers

```bash
# 1. Installer VS Code extension : "Dev Containers"

# 2. Ouvrir le projet dans VS Code

# 3. Cmd+Shift+P → "Dev Containers: Reopen in Container"

# 4. Le container se construit automatiquement avec :
#    - Node.js 20
#    - npm avec ignore-scripts=true
#    - Outils de sécurité pré-installés
#    - Isolation sécurisée

# 5. Développer normalement dans le container
npm run dev
```

Configuration : [`.devcontainer/`](./.devcontainer/)

## 🔍 Audit et Monitoring

### Audit Quotidien (Automatique)

GitHub Actions exécute automatiquement :

- Validation du lockfile
- npm audit
- Détection de packages avec scripts
- Vérification de l'âge des packages

### Audit Manuel

```bash
# Audit complet
npm run security:check

# Audit des dépendances
./scripts/audit-dependencies.sh

# Vérifier les vulnérabilités
npm audit

# Voir l'arbre de dépendances
npm ls --all
```

### Surveiller les Alertes

1. **GitHub Dependabot** (automatique)
   - Repository → Security → Dependabot alerts

2. **Snyk** (optionnel)
   - [snyk.io](https://snyk.io)
   - Monitoring continu

3. **Socket.dev** (optionnel)
   - [socket.dev](https://socket.dev)
   - Détection de comportements malveillants

## 📚 Documentation Complète

| Document                                                     | Description                        |
| ------------------------------------------------------------ | ---------------------------------- |
| [`SECURITY.md`](./SECURITY.md)                               | Ce guide (overview)                |
| [`SECRETS_MANAGEMENT.md`](./SECRETS_MANAGEMENT.md)           | Gestion sécurisée des secrets      |
| [`NPM_PUBLISHING_SECURITY.md`](./NPM_PUBLISHING_SECURITY.md) | 2FA, OIDC, Provenance              |
| [`DEPENDENCY_AUDIT.md`](./DEPENDENCY_AUDIT.md)               | Audit et réduction des dépendances |
| [`.npmrc`](./.npmrc)                                         | Configuration npm                  |
| [`.devcontainer/`](./.devcontainer/)                         | Dev containers config              |
| [`.zshrc_security`](./.zshrc_security)                       | Alias de sécurité                  |

## 🚨 En Cas d'Incident

### Si vous suspectez une infection :

1. **STOP** - Arrêtez tout processus npm

   ```bash
   killall node
   ```

2. **Isoler** - Déconnectez du réseau

   ```bash
   # WiFi → Off
   ```

3. **Révoquer credentials**
   - Révoquez tokens npm : [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
   - Révoquez tokens GitHub : [github.com/settings/tokens](https://github.com/settings/tokens)
   - Changez vos mots de passe
   - Révoquez clés API cloud (AWS, Azure, GCP)

4. **Scanner**

   ```bash
   # Vérifier les processus suspects
   ps aux | grep node

   # Vérifier les connexions réseau
   lsof -i

   # Scanner le projet
   npm audit
   ./scripts/audit-dependencies.sh
   ```

5. **Nettoyer**

   ```bash
   # Supprimer node_modules
   rm -rf node_modules

   # Réinstaller proprement
   npm ci --ignore-scripts

   # Vérifier le lockfile
   npm run security:lockfile
   ```

6. **Notifier**
   - Informez votre équipe
   - Signalez à npm si package compromis
   - Contactez votre équipe sécurité

## ✅ Checklist de Sécurité

### Configuration Initiale (Une fois)

- [ ] npm config ignore-scripts=true configuré
- [ ] npq installé globalement
- [ ] lockfile-lint installé dans le projet
- [ ] 1Password CLI ou Infisical installé
- [ ] Secrets migrés vers gestionnaire de secrets
- [ ] Alias de sécurité configurés dans .zshrc
- [ ] GitHub Secrets configurés
- [ ] Dev Container testé (optionnel)

### Avant Chaque Installation de Package

- [ ] Vérifier avec `npq install <package>`
- [ ] Vérifier l'âge du package (>7 jours)
- [ ] Vérifier le nombre de downloads
- [ ] Vérifier pas de scripts lifecycle dangereux
- [ ] Installer avec `--ignore-scripts`
- [ ] Tester après installation
- [ ] Commit immédiatement

### Hebdomadaire

- [ ] Vérifier Dependabot alerts
- [ ] Review security audit quotidien
- [ ] `npm audit` manuel

### Mensuel

- [ ] Review dépendances obsolètes (interactive)
- [ ] Audit complet avec script
- [ ] Review des permissions GitHub Actions
- [ ] Rotation des tokens si nécessaires

## 🎓 Formation de l'Équipe

### Points Clés à Communiquer

1. **npm install est une surface d'attaque**
   - Toujours utiliser `npq` pour vérifier
   - Toujours installer avec `--ignore-scripts`

2. **Pas de secrets en clair**
   - Utiliser 1Password CLI ou Infisical
   - Jamais de tokens dans .env

3. **Review lockfile changes**
   - Lockfile modifié = potentielle injection
   - Vérifier les URLs dans le lockfile

4. **Pas de blind updates**
   - `npm update` est dangereux
   - Toujours review et test individuellement

5. **Quand douter, demander**
   - Package suspect ? Demandez un review
   - Behaviour étrange ? Signalez immédiatement

## 🔗 Ressources Externes

### Attaques Shai-Hulud

- [Article Snyk Original](https://snyk.io/blog/npm-security-best-practices-shai-hulud-attack/)
- [Socket.dev Analysis](https://socket.dev/blog/shai-hulud-npm-attack)
- [Liste des packages compromis](https://snyk.io/advisor/)

### Outils de Sécurité

- [npq](https://github.com/lirantal/npq) - Pre-install security
- [lockfile-lint](https://github.com/lirantal/lockfile-lint) - Lockfile validation
- [Snyk](https://snyk.io) - Vulnerability scanning
- [Socket.dev](https://socket.dev) - Supply chain security

### Best Practices

- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices)
- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)
- [OWASP Dependency Check](https://owasp.org/www-project-dependency-check/)

## 📞 Support

Pour questions sur la sécurité :

1. Consulter cette documentation
2. GitHub Issues avec tag `security`
3. Contacter le lead technique

---

## 🎯 Résumé : Les 5 Règles d'Or

1. **🚫 Jamais de scripts lifecycle** : `ignore-scripts=true` toujours
2. **🔍 Vérifier avant d'installer** : `npq` pour tous les packages
3. **🔐 Secrets sécurisés** : 1Password/Infisical, jamais en clair
4. **🔒 Lockfile sacré** : Valider avec lockfile-lint
5. **📊 Minimiser les dépendances** : Chaque package = risque

**🛡️ La sécurité est l'affaire de tous. Restons vigilants !**

---

_Dernière mise à jour : Janvier 2025_  
_Version : 1.0_  
_Basé sur : [Snyk NPM Security Best Practices](https://snyk.io/blog/npm-security-best-practices-shai-hulud-attack/)_
