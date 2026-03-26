# Fix iOS Apple Touch Icon

## Problème

L'icône PWA sur iPhone s'affichait avec un fond blanc par défaut car le logo original a un fond transparent, et iOS ne supporte pas la transparence dans les `apple-touch-icon`.

## Solution Implémentée

### 1. Création d'une icône spécifique iOS (180x180)

- **Fichier** : `public/apple-touch-icon.png`
- **Composition** : Logo HappyRow sur fond teal (#5FBDB4 - couleur de marque)
- **Taille** : 180x180 px (standard iOS)
- **Format** : PNG opaque (RGB, pas RGBA)

### 2. Commande de génération

```bash
# Nécessite ImageMagick: brew install imagemagick
cd public
magick -size 180x180 xc:'#5FBDB4' \
       \( logo.png -resize 180x180 \) \
       -composite apple-touch-icon.png
```

### 3. Mise à jour du HTML

`index.html` :

```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

### 4. Mise à jour du Manifest PWA

`vite.config.ts` - Ajout dans le tableau `icons` :

```typescript
{
  src: 'apple-touch-icon.png',
  sizes: '180x180',
  type: 'image/png',
  purpose: 'any',
}
```

## Fichiers Modifiés

- `index.html` : Lien vers la nouvelle icône Apple
- `vite.config.ts` : Ajout de l'icône dans le manifest et `includeAssets`
- `public/apple-touch-icon.png` : Nouvelle icône créée
- `.gitignore` : Ajout de `dev-dist/`
- `PWA_IMPLEMENTATION.md` : Documentation mise à jour

## Test sur iOS

### Installation

1. Ouvrir l'app dans Safari sur iPhone
2. Appuyer sur le bouton Partager (carré avec flèche)
3. Sélectionner "Sur l'écran d'accueil"
4. ✅ L'icône apparaît maintenant avec le logo sur fond teal

### Vérification

L'icône affiche désormais :

- Logo HappyRow (lettre H stylisée) bien visible
- Fond de couleur teal (#5FBDB4) cohérent avec la marque
- Pas de fond blanc par défaut

## Pourquoi cette approche ?

### iOS != Android

- **Android** : Supporte la transparence dans les icônes PWA
- **iOS** : Ne supporte PAS la transparence → remplace par un fond blanc

### Solution standard

- Composer le logo sur un fond de couleur de marque
- Utiliser `apple-touch-icon.png` dédié (différent des autres icônes PWA)
- Taille 180x180 pour iOS (au lieu de 192x192 pour Android)

## Régénération Future

Si le logo change, régénérer avec la commande ci-dessus ou scripter dans le build process.

## Status

✅ **Résolu** - L'icône iOS affiche maintenant correctement le logo sur fond teal.
