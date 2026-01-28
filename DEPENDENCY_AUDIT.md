# Audit et Réduction des Dépendances

## 🎯 Objectif

Chaque dépendance npm représente :

- ✅ Du code utile
- ⚠️ Une surface d'attaque potentielle
- ⚠️ Des mainteneurs dont les comptes peuvent être compromis
- ⚠️ Des dépendances transitives (dépendances de dépendances)

**Principe : Minimiser l'arbre de dépendances = Réduire la surface d'attaque**

## 📊 État Actuel du Projet

### Dépendances de Production (3)

```json
{
  "@supabase/supabase-js": "^2.39.3",
  "react": "^19.1.1",
  "react-dom": "^19.1.1"
}
```

**Analyse :**

- ✅ **Minimal** : Seulement 3 dépendances directes
- ✅ **Nécessaires** : Toutes sont essentielles au fonctionnement
- ✅ **Bien maintenues** : Projets majeurs avec équipes sécurité

### Dépendances de Développement (17)

```json
{
  "@eslint/js": "^9.33.0",
  "@lavamoat/allow-scripts": "^3.4.1",
  "@testing-library/jest-dom": "^6.4.2",
  "@testing-library/react": "^16.3.0",
  "@testing-library/user-event": "^14.6.1",
  "@types/node": "^24.4.0",
  "@types/react": "^19.1.13",
  "@types/react-dom": "^19.1.7",
  "@vitejs/plugin-react": "^5.0.0",
  "eslint": "^9.33.0",
  "husky": "^9.1.7",
  "jsdom": "^27.0.0",
  "lint-staged": "^16.1.6",
  "lockfile-lint": "^4.15.1",
  "prettier": "^3.6.2",
  "typescript": "~5.8.3",
  "vite": "^7.1.2",
  "vitest": "^3.2.4"
}
```

**Analyse :**

- ✅ **Tooling** : Principalement des outils de développement
- ✅ **Isolation** : DevDependencies ne sont pas en production
- ⚠️ **Surface d'attaque dev** : Peuvent compromettre machines développeurs

## 🔍 Script d'Audit

### Exécuter l'audit :

```bash
# Audit complet
./scripts/audit-dependencies.sh

# Ou via npm
npm run security:audit
```

### Ce que vérifie le script :

1. ✅ Nombre de dépendances directes
2. ✅ Packages avec scripts lifecycle (danger Shai-Hulud)
3. ✅ Vulnérabilités connues (npm audit)
4. ✅ Taille de l'arbre de dépendances
5. ✅ Suggestions d'alternatives natives

## 🎯 Recommandations Spécifiques

### 1. Avant d'ajouter une dépendance

**Questions à se poser :**

1. **Est-ce vraiment nécessaire ?**
   - Puis-je l'implémenter en JavaScript natif ?
   - Combien de code dois-je écrire vs importer ?

2. **Le package est-il sûr ?**

   ```bash
   # Utiliser npq pour vérifier avant installation
   npq install <package-name>
   ```

3. **Le package est-il bien maintenu ?**
   - Date de dernière publication
   - Nombre de mainteneurs
   - Historique de sécurité
   - Activité GitHub

4. **Combien de dépendances transitives ?**
   ```bash
   npm view <package-name> dependencies
   ```

### 2. Alternatives Natives

#### ❌ Au lieu de Lodash

```javascript
// Lodash
import _ from 'lodash';
const unique = _.uniq(array);
const values = _.values(object);

// ✅ Native
const unique = [...new Set(array)];
const values = Object.values(object);
```

#### ❌ Au lieu de Axios (pour requêtes simples)

```javascript
// Axios
import axios from 'axios';
const data = await axios.get(url).then(r => r.data);

// ✅ Native fetch
const data = await fetch(url).then(r => r.json());
```

#### ❌ Au lieu de Moment.js

```javascript
// Moment (300KB)
import moment from 'moment';
const formatted = moment().format('DD/MM/YYYY');

// ✅ Native Intl
const formatted = new Intl.DateTimeFormat('fr-FR').format(new Date());
```

#### ❌ Au lieu de utility libs pour checks simples

```javascript
// Utility lib
import { isEmpty } from 'some-utility';
const empty = isEmpty(obj);

// ✅ Native
const isEmpty = obj => Object.keys(obj).length === 0;
```

### 3. Audit Régulier

#### Hebdomadaire (automatique via CI) :

```bash
# GitHub Actions déjà configuré
# .github/workflows/security-audit.yml s'exécute quotidiennement
```

#### Mensuel (manuel) :

```bash
# 1. Audit de vulnérabilités
npm audit

# 2. Packages obsolètes (review manuel, pas de -u automatique!)
npx npm-check-updates --interactive

# 3. Audit complet
./scripts/audit-dependencies.sh

# 4. Vérifier les packages avec scripts
npm run security:check
```

## 🚨 Packages à Surveiller

### Packages compromis dans Shai-Hulud/SHA1-Hulud :

- `ngx-bootstrap` (compromis)
- `ng2-file-upload` (compromis)
- `@ctrl/tinycolor` (compromis)
- 600+ autres packages

**Notre projet n'utilise aucun de ces packages ✅**

### Types de packages à éviter :

1. **Packages avec peu de téléchargements** (<1000/semaine)
2. **Nouveaux packages** (<3 mois d'existence)
3. **Un seul mainteneur** sans backup
4. **Pas d'activité récente** (>1 an)
5. **Nombreuses issues de sécurité non résolues**

## 📈 Métriques de Santé

### Notre projet actuel :

| Métrique                 | Valeur | Objectif | Status        |
| ------------------------ | ------ | -------- | ------------- |
| Dépendances directes     | 20     | <30      | ✅ Excellent  |
| Dépendances production   | 3      | <10      | ✅ Excellent  |
| Scripts lifecycle        | 0      | 0        | ✅ Parfait    |
| Vulnérabilités critiques | 0      | 0        | ✅ Parfait    |
| Packages obsolètes       | ?      | <5       | ⚠️ À vérifier |

### Commandes de vérification :

```bash
# Nombre de dépendances directes
node -p "Object.keys({...require('./package.json').dependencies, ...require('./package.json').devDependencies}).length"

# Nombre total (avec transitives)
npm ls --all | wc -l

# Packages obsolètes
npx npm-check-updates

# Vulnérabilités
npm audit
```

## 🔄 Processus de Mise à Jour Sécurisé

### ❌ NE JAMAIS faire :

```bash
# Blind update - DANGEREUX!
npm update
npx npm-check-updates -u && npm install

# Ces commandes peuvent installer des packages compromis
```

### ✅ TOUJOURS faire :

```bash
# 1. Review interactif
npx npm-check-updates --interactive

# 2. Vérifier chaque package avant update
npq install <package-name>@<new-version>

# 3. Tester après chaque update
npm run test
npm run build

# 4. Commit par commit (facilite rollback)
git add package.json package-lock.json
git commit -m "chore: update <package-name> to <version>"
```

## 🎓 Formation de l'Équipe

### Points clés à communiquer :

1. **Chaque dépendance compte**
   - "Est-ce que j'en ai vraiment besoin ?"
   - "Puis-je utiliser du JavaScript natif ?"

2. **Utiliser npq pour toute nouvelle dépendance**

   ```bash
   npq install <package-name>
   ```

3. **Ne jamais ignorer les warnings de sécurité**
   - npm audit
   - GitHub Dependabot alerts
   - Snyk alerts

4. **Review les PRs avec attention**
   - Changements dans package.json
   - Changements dans package-lock.json
   - Nouveaux packages ajoutés

## 📚 Ressources

- [npq - Package Security Checker](https://github.com/lirantal/npq)
- [Snyk Advisor](https://snyk.io/advisor/) - Package health scores
- [Socket.dev](https://socket.dev) - Supply chain security
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)

## ✅ Checklist de Revue de Dépendances

Avant d'approuver une PR qui ajoute des dépendances :

- [ ] Package vérifié avec `npq install`
- [ ] Pas de scripts lifecycle dangereux
- [ ] Package bien maintenu (>1M downloads/week idéalement)
- [ ] Pas de vulnérabilités connues
- [ ] Alternative native considérée
- [ ] Tests passent avec la nouvelle dépendance
- [ ] Documentation mise à jour si nécessaire
- [ ] Lockfile validé (pas d'URLs suspectes)

---

**🛡️ Moins de dépendances = Moins de surface d'attaque = Plus de sécurité**
