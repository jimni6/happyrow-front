# Secrets Management Guide

## 🚨 Protection contre Shai-Hulud : Gestion Sécurisée des Secrets

Les attaques Shai-Hulud ciblent spécifiquement les secrets en clair dans les fichiers `.env`. Ce guide explique comment protéger vos secrets.

## ⚠️ Le Problème : Secrets en Clair

**NE FAITES JAMAIS CECI :**

```bash
# .env - DANGEREUX !
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
DATABASE_PASSWORD=super-secret-password
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

**Pourquoi c'est dangereux :**

- Les packages malveillants peuvent lire `process.env` et exfiltrer vos secrets
- Les secrets se retrouvent dans les logs, crash dumps, historique terminal
- Une fuite du fichier .env expose tous vos credentials
- Shai-Hulud scanne activement pour ces patterns

## ✅ La Solution : Secret References + Just-in-Time Injection

### Option 1 : 1Password CLI (Recommandé)

#### Installation

```bash
# macOS
brew install --cask 1password-cli

# Vérifier l'installation
op --version
```

#### Configuration

1. **Créer un vault dans 1Password** nommé "Development" ou "happyrow"

2. **Ajouter vos secrets dans 1Password:**
   - Item: "Supabase - Development"
   - Champs:
     - `url`: votre URL Supabase
     - `anon-key`: votre clé anonyme

3. **Modifier votre .env avec des références:**

```bash
# .env
VITE_SUPABASE_URL=op://Development/Supabase/url
VITE_SUPABASE_ANON_KEY=op://Development/Supabase/anon-key
```

4. **Lancer votre app avec 1Password:**

```bash
# Development
op run -- npm run dev

# Build
op run -- npm run build

# Tests
op run -- npm test
```

#### Ajouter des alias dans ~/.zshrc

```bash
# Add to ~/.zshrc
alias npm-dev='op run -- npm run dev'
alias npm-build='op run -- npm run build'
alias npm-test='op run -- npm test'

# Then use:
npm-dev
```

### Option 2 : Infisical

#### Installation

```bash
# macOS
brew install infisical/get-cli/infisical

# Vérifier
infisical --version
```

#### Configuration

1. **Créer un compte sur [infisical.com](https://infisical.com)**

2. **Initialiser dans votre projet:**

```bash
cd /Users/j.ni/IdeaProjects/happyrow-front
infisical init
```

3. **Ajouter vos secrets via dashboard ou CLI:**

```bash
infisical secrets set VITE_SUPABASE_URL "https://xxxxx.supabase.co"
infisical secrets set VITE_SUPABASE_ANON_KEY "eyJhbGci..."
```

4. **Modifier votre .env:**

```bash
# .env
VITE_SUPABASE_URL=infisical://happyrow-front/dev/VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY=infisical://happyrow-front/dev/VITE_SUPABASE_ANON_KEY
```

5. **Lancer avec Infisical:**

```bash
infisical run -- npm run dev
```

### Option 3 : AWS Secrets Manager / GCP Secret Manager

Pour les environnements de production, utilisez les gestionnaires de secrets cloud:

```bash
# AWS
aws secretsmanager get-secret-value --secret-id prod/supabase/anon-key

# GCP
gcloud secrets versions access latest --secret="supabase-anon-key"
```

## 🔒 Scripts package.json Sécurisés

Mettez à jour vos scripts dans `package.json` :

```json
{
  "scripts": {
    "dev": "echo '⚠️  Use: op run -- npm run dev:unsafe' && exit 1",
    "dev:unsafe": "vite",
    "dev:safe": "op run -- npm run dev:unsafe",
    "build": "op run -- npm run build:unsafe",
    "build:unsafe": "tsc -b && vite build"
  }
}
```

Ou ajoutez un wrapper script `scripts/dev.sh`:

```bash
#!/bin/bash
if [ -z "$OP_SESSION" ]; then
    echo "🔒 Running with 1Password..."
    op run -- npm run dev:unsafe
else
    npm run dev:unsafe
fi
```

## 🚀 CI/CD : GitHub Actions Secrets

Dans GitHub Actions, utilisez les secrets GitHub (jamais de .env) :

```yaml
# .github/workflows/deploy.yml
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
        run: npm run build
```

**Configuration dans GitHub :**

1. Repository Settings → Secrets and variables → Actions
2. Ajouter `SUPABASE_URL` et `SUPABASE_ANON_KEY`

## 🛡️ Checklist de Sécurité

- [ ] ✅ Aucun secret en clair dans .env
- [ ] ✅ .env dans .gitignore (déjà fait)
- [ ] ✅ 1Password CLI ou Infisical installé
- [ ] ✅ Secrets stockés dans le gestionnaire
- [ ] ✅ .env contient uniquement des références
- [ ] ✅ Scripts utilisent `op run --` ou `infisical run --`
- [ ] ✅ GitHub Actions utilise GitHub Secrets
- [ ] ✅ Équipe formée sur les bonnes pratiques

## 📚 Ressources

- [1Password CLI Documentation](https://developer.1password.com/docs/cli/)
- [Infisical Documentation](https://infisical.com/docs)
- [Shai-Hulud Attack Analysis](https://socket.dev/blog/shai-hulud-npm-attack)

## 🆘 En cas d'exposition de secrets

Si vous avez accidentellement exposé des secrets :

1. **Rotation immédiate** : Révoquez et recréez tous les credentials
2. **Audit** : Vérifiez les logs d'accès pour activité suspecte
3. **Notification** : Informez votre équipe et services concernés
4. **Prevention** : Implémentez ce guide immédiatement

---

**🔐 Votre sécurité commence par la protection de vos secrets !**
