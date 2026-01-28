# Guide de Sécurité : Publication npm

## 🎯 Pour les Mainteneurs de Packages npm

Si vous publiez des packages npm, ce guide est **critique** pour éviter que vos packages soient compromis comme dans Shai-Hulud.

## 🔐 1. Activer 2FA sur votre compte npm

### Pourquoi ?

L'attaque eslint-scope a montré qu'un compte compromis peut publier des versions backdoorées à des millions d'utilisateurs.

### Configuration

#### Activer 2FA pour authentification ET publication :

```bash
npm profile enable-2fa auth-and-writes
```

#### Vérifier le statut 2FA :

```bash
npm profile get
```

Vous devriez voir :

```
two-factor auth: auth-and-writes
```

### Configuration avec Passkey (encore plus sécurisé)

1. Allez sur [npmjs.com](https://www.npmjs.com)
2. Settings → Profile → Security
3. Ajoutez une Passkey (utilise biométrie ou YubiKey)

## 🔒 2. Publication avec Provenance Attestations

### Qu'est-ce que la provenance ?

La provenance permet aux consommateurs de vérifier :

- ✅ D'où vient le package (quel repo GitHub)
- ✅ Quel commit a été utilisé
- ✅ Quel workflow l'a construit
- ✅ Que le build n'a pas été altéré

### Configuration dans GitHub Actions

#### Fichier : `.github/workflows/publish.yml`

```yaml
name: Publish Package

on:
  release:
    types: [created]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      id-token: write # ← CRITIQUE pour OIDC et provenance

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies (secure)
        run: npm ci --ignore-scripts

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Publish with Provenance
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Exigences :**

- npm CLI version 9.5.0+
- GitHub Actions avec runners hébergés par GitHub
- Permission `id-token: write`

### Vérifier la provenance d'un package

```bash
# Vérifier après publication
npm view your-package-name --json | jq .dist.attestations

# Ou sur npmjs.com, onglet "Provenance"
```

## 🎫 3. Publication avec OIDC (Trusted Publishing)

### Avantages vs tokens longue durée

| Méthode   | Sécurité  | Rotation    | Exposition     |
| --------- | --------- | ----------- | -------------- |
| NPM_TOKEN | ⚠️ Faible | Manuelle    | Risque de leak |
| OIDC      | ✅ Forte  | Automatique | Éphémère       |

### Configuration

#### Étape 1 : Configurer sur npmjs.com

1. Connectez-vous à [npmjs.com](https://www.npmjs.com)
2. Package Settings → Publishing Access
3. Add Trusted Publisher → GitHub
4. Configurez :
   - **Repository**: `jimni6/happyrow-front`
   - **Workflow**: `publish.yml`
   - **Environment**: `production` (optionnel)

#### Étape 2 : Workflow GitHub Actions

```yaml
name: Publish with OIDC

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    environment: production # Correspond à la config npm

    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci --ignore-scripts

      - name: Publish (no NPM_TOKEN needed!)
        run: npm publish --provenance
        # OIDC token automatiquement fourni par GitHub
```

**Aucun `NPM_TOKEN` n'est stocké !**

## 📝 4. Workflow Complet Recommandé

Créez `.github/workflows/npm-publish.yml` :

```yaml
name: Secure npm Publish

on:
  release:
    types: [published]
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to publish'
        required: true
        type: string

jobs:
  security-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Validate lockfile
        run: |
          npm install --save-dev lockfile-lint
          npx lockfile-lint \
            --path package-lock.json \
            --type npm \
            --allowed-hosts npm \
            --validate-https

      - name: Install (secure)
        run: npm ci --ignore-scripts

      - name: Audit
        run: npm audit --audit-level=moderate

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

  publish:
    needs: security-checks
    runs-on: ubuntu-latest
    environment: npm-production

    permissions:
      contents: read
      id-token: write

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install
        run: npm ci --ignore-scripts

      - name: Build
        run: npm run build

      - name: Publish with Provenance & OIDC
        run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create Summary
        run: |
          echo "## 🎉 Package Published Successfully" >> $GITHUB_STEP_SUMMARY
          echo "" >> $GITHUB_STEP_SUMMARY
          echo "**Package:** $(node -p "require('./package.json').name")" >> $GITHUB_STEP_SUMMARY
          echo "**Version:** $(node -p "require('./package.json').version")" >> $GITHUB_STEP_SUMMARY
          echo "**Provenance:** ✅ Enabled" >> $GITHUB_STEP_SUMMARY
          echo "**2FA:** ✅ Required" >> $GITHUB_STEP_SUMMARY
```

## 🛡️ 5. Checklist Pre-Publication

Avant chaque publication :

- [ ] ✅ 2FA activé sur compte npm (`auth-and-writes`)
- [ ] ✅ Workflow utilise `--provenance`
- [ ] ✅ Permission `id-token: write` configurée
- [ ] ✅ OIDC trusted publishing configuré (recommandé)
- [ ] ✅ Tests passent
- [ ] ✅ Audit npm clean
- [ ] ✅ Lockfile validé
- [ ] ✅ Installation avec `--ignore-scripts`
- [ ] ✅ Pas de secrets dans le code
- [ ] ✅ CHANGELOG à jour

## 🚨 6. Détection de Compromission

### Signes qu'un compte est compromis :

- Publications non autorisées
- Nouveaux mainteneurs ajoutés
- Versions publiées depuis des IPs inhabituelles
- Modifications de métadonnées (repo URL, etc.)

### Actions immédiates :

```bash
# 1. Dépublier la version compromise
npm unpublish your-package@compromised-version

# 2. Changer votre mot de passe npm
npm profile set password

# 3. Révoquer tous les tokens
# Sur npmjs.com → Account Settings → Auth Tokens → Revoke All

# 4. Réactiver 2FA
npm profile enable-2fa auth-and-writes

# 5. Publier une version saine avec un message
npm version patch -m "Security: Reverting compromised version"
npm publish --provenance
```

## 📊 7. Monitoring Post-Publication

### Surveiller votre package :

1. **npm Advisories**

   ```bash
   npm audit
   ```

2. **Socket.dev** - Détection de comportements malveillants
   - [socket.dev/npm/package/your-package](https://socket.dev)

3. **Snyk** - Vulnérabilités et malware
   - [snyk.io](https://snyk.io)

4. **GitHub Dependabot** - Alertes automatiques

### S'inscrire aux alertes npm :

```bash
# Recevoir des emails pour votre package
npm access grant read-write <your-org> <your-package>
```

## 🔗 Ressources

- [npm 2FA Documentation](https://docs.npmjs.com/configuring-two-factor-authentication)
- [npm Provenance](https://docs.npmjs.com/generating-provenance-statements)
- [npm Trusted Publishing with OIDC](https://github.blog/2023-04-19-introducing-npm-package-provenance/)
- [OpenSSF Best Practices](https://bestpractices.coreinfrastructure.org/)

## ⚠️ Note Importante

**Ce projet (happyrow-front) est une application frontend, pas un package npm publié.**

Ce guide est fourni pour référence future si vous décidez de :

- Publier une bibliothèque de composants React
- Créer un package utilitaire
- Partager du code avec la communauté

Si vous ne publiez pas sur npm, les sections 1-7 ne s'appliquent pas directement, mais restent des bonnes pratiques à connaître en tant que développeur JavaScript.
