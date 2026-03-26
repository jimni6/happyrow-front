# HappyRow — Feature Ideas & Product Roadmap

> Document généré à partir de l'analyse du codebase existant.
> Objectif : lister un maximum d'idées à fort impact produit, classées par catégorie puis par priorité globale.

---

## Résumé de l'existant

| Module            | Fonctionnalités actuelles                                           |
| ----------------- | ------------------------------------------------------------------- |
| **Auth**          | Inscription (email + Google OAuth), connexion, reset password       |
| **Events**        | Création, édition, suppression (PARTY, BIRTHDAY, DINER, SNACK)      |
| **Participants**  | Invitation par email, statuts (INVITED, CONFIRMED, MAYBE, DECLINED) |
| **Resources**     | Catégories (FOOD, DRINK, UTENSIL, DECORATION), quantités suggérées  |
| **Contributions** | Un user contribue une quantité à une ressource                      |
| **Profil**        | Page basique (nom, email, sign out) — "coming soon"                 |
| **PWA**           | Installable, offline basique, service worker                        |

---

## 1. Engagement & Social

| #   | Feature                                      | Description                                                                                                                                                        | Impact     |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 1.1 | **Lien de partage d'événement**              | Générer un lien unique (ou QR code) pour inviter des participants sans connaître leur email. Le lien redirige vers l'app et ajoute automatiquement le participant. | Très élevé |
| 1.2 | **Commentaires / Chat d'événement**          | Fil de discussion temps réel sur chaque événement pour coordonner les détails (heure de rendez-vous, allergies, etc.).                                             | Très élevé |
| 1.3 | **Notifications push (PWA)**                 | Notifier les participants : nouvelle invitation, rappel avant l'événement, nouvelle contribution, changement de détails.                                           | Très élevé |
| 1.4 | **Réactions / Emojis sur les contributions** | Permettre aux participants de réagir aux contributions (merci, bravo, etc.) pour encourager la participation.                                                      | Moyen      |
| 1.5 | **Galerie photos de l'événement**            | Upload et partage de photos avant/pendant/après l'événement. Album collaboratif.                                                                                   | Élevé      |
| 1.6 | **Flux d'activité (Activity Feed)**          | Timeline des actions récentes sur un événement : "Marie a apporté 2 bouteilles de vin", "Paul a confirmé sa participation".                                        | Élevé      |
| 1.7 | **Mentions (@user) dans les commentaires**   | Taguer un participant pour lui envoyer une notification ciblée dans le chat.                                                                                       | Moyen      |
| 1.8 | **Système de "nudge" / relance**             | L'organisateur peut relancer les invités qui n'ont pas encore répondu ou contribué, en un clic.                                                                    | Élevé      |

---

## 2. Organisation & Planification

| #    | Feature                                       | Description                                                                                                                                         | Impact     |
| ---- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 2.1  | **Templates d'événements**                    | Modèles pré-remplis (BBQ, Anniversaire, Brunch, Apéro, Noël…) avec ressources suggérées automatiquement.                                            | Très élevé |
| 2.2  | **Événements récurrents**                     | Créer un événement qui se répète (hebdo, mensuel) — ex : "Apéro du vendredi".                                                                       | Élevé      |
| 2.3  | **Liste de courses générée**                  | Agréger toutes les ressources manquantes (quantité suggérée - quantité actuelle) dans une checklist partageable.                                    | Très élevé |
| 2.4  | **Sondage de date (Doodle-like)**             | L'organisateur propose plusieurs dates, les participants votent pour leur préférence.                                                               | Très élevé |
| 2.5  | **Sondage de lieu**                           | Même principe que le sondage de date, mais pour le lieu.                                                                                            | Élevé      |
| 2.6  | **Catégories de ressources personnalisables** | Permettre à l'organisateur d'ajouter ses propres catégories (Jeux, Musique, Transport…).                                                            | Moyen      |
| 2.7  | **Suggestions intelligentes de ressources**   | Basé sur le type d'événement et le nombre de participants, suggérer automatiquement des ressources et quantités (ex : 1 baguette pour 3 personnes). | Élevé      |
| 2.8  | **Sous-événements / Planning horaire**        | Découper un événement en créneaux (accueil, repas, jeux, départ) avec horaires.                                                                     | Moyen      |
| 2.9  | **Check-in des participants**                 | Permettre aux participants de signaler leur arrivée le jour J. L'organisateur voit qui est là en temps réel.                                        | Moyen      |
| 2.10 | **Événement multi-jours**                     | Support des événements sur plusieurs jours (week-end, vacances).                                                                                    | Moyen      |

---

## 3. Expérience Utilisateur (UX)

| #    | Feature                                         | Description                                                                                                       | Impact     |
| ---- | ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------- |
| 3.1  | **Recherche et filtres sur les événements**     | Rechercher par nom, filtrer par type, date (passés/futurs), statut de participation.                              | Très élevé |
| 3.2  | **Vue calendrier**                              | Afficher les événements dans une vue calendrier (mois/semaine) en plus de la liste.                               | Élevé      |
| 3.3  | **Dark mode**                                   | Thème sombre pour le confort visuel.                                                                              | Élevé      |
| 3.4  | **Onboarding guidé**                            | Tutoriel interactif au premier lancement pour expliquer les fonctionnalités clés.                                 | Élevé      |
| 3.5  | **Pull-to-refresh**                             | Rafraîchir la liste d'événements par geste de swipe (mobile PWA).                                                 | Moyen      |
| 3.6  | **Skeleton loading**                            | Remplacer les "Loading..." par des squelettes animés pour un ressenti plus fluide.                                | Moyen      |
| 3.7  | **Animations & transitions**                    | Micro-interactions (ajout de contribution, changement de statut) pour un feedback visuel agréable.                | Moyen      |
| 3.8  | **Barre de progression des ressources**         | Visualiser en un coup d'œil le % de complétion de chaque ressource (barre visuelle quantité actuelle / suggérée). | Élevé      |
| 3.9  | **Tri des événements**                          | Trier par date, par nombre de participants, par événements où j'ai des contributions.                             | Moyen      |
| 3.10 | **Page 404 et états d'erreur stylisés**         | Pages d'erreur avec illustrations et actions claires.                                                             | Faible     |
| 3.11 | **Haptic feedback (mobile)**                    | Vibration légère sur les actions importantes (contribution ajoutée, statut changé).                               | Faible     |
| 3.12 | **Drag & drop pour réorganiser les ressources** | L'organisateur peut réordonner les ressources par priorité.                                                       | Faible     |

---

## 4. Profil & Social

| #   | Feature                                    | Description                                                                                                                         | Impact     |
| --- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 4.1 | **Profil complet & éditable**              | Photo de profil, bio, préférences alimentaires (végétarien, allergies), numéro de téléphone.                                        | Très élevé |
| 4.2 | **Historique des événements**              | Voir tous les événements passés auxquels on a participé, avec ses contributions.                                                    | Élevé      |
| 4.3 | **Statistiques personnelles**              | "Tu as participé à X événements, contribué Y fois, ton item le plus apporté est…". Gamification légère.                             | Moyen      |
| 4.4 | **Carnet de contacts / Favoris**           | Sauvegarder des contacts fréquents pour les inviter rapidement aux prochains événements.                                            | Élevé      |
| 4.5 | **Badges & achievements**                  | Système de badges (Premier événement créé, 10 contributions, Super organisateur…).                                                  | Moyen      |
| 4.6 | **Préférences alimentaires visibles**      | Les préférences alimentaires des participants (allergies, végan, halal…) sont visibles sur l'événement pour adapter les ressources. | Élevé      |
| 4.7 | **Photo de profil via Gravatar ou upload** | Avatar personnalisé au lieu des initiales.                                                                                          | Moyen      |

---

## 5. Gestion Financière

| #   | Feature                                        | Description                                                                                       | Impact     |
| --- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------- |
| 5.1 | **Cagnotte / Budget d'événement**              | Définir un budget global, suivre les dépenses, et voir le solde restant.                          | Très élevé |
| 5.2 | **Partage de frais (Tricount-like)**           | Ajouter des dépenses, répartir les coûts entre les participants, calculer qui doit combien à qui. | Très élevé |
| 5.3 | **Reçu / Historique de dépenses**              | Chaque participant voit ce qu'il a dépensé et ce qu'il doit / ce qu'on lui doit.                  | Élevé      |
| 5.4 | **Intégration paiement (Lydia, PayPal, IBAN)** | Faciliter le remboursement direct depuis l'app.                                                   | Moyen      |
| 5.5 | **Estimation de coût par ressource**           | L'organisateur peut ajouter un prix estimé par ressource pour donner une idée du budget total.    | Moyen      |

---

## 6. Intégrations & Technique

| #    | Feature                                          | Description                                                                                     | Impact     |
| ---- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------- | ---------- |
| 6.1  | **Export vers Google Calendar / Apple Calendar** | Ajouter l'événement au calendrier du téléphone en un clic (.ics).                               | Très élevé |
| 6.2  | **Intégration Google Maps**                      | Afficher le lieu sur une carte, calcul d'itinéraire, partage de localisation.                   | Élevé      |
| 6.3  | **Internationalisation (i18n) FR/EN**            | Support multilingue français/anglais avec détection automatique.                                | Élevé      |
| 6.4  | **Notifications email**                          | Emails automatiques pour les invitations, rappels, récapitulatifs.                              | Élevé      |
| 6.5  | **Mode hors-ligne avancé**                       | Permettre de consulter les détails d'un événement offline, avec sync au retour de la connexion. | Moyen      |
| 6.6  | **Deep linking**                                 | Ouvrir directement un événement depuis un lien partagé (SMS, WhatsApp, email).                  | Élevé      |
| 6.7  | **Export PDF récapitulatif**                     | Générer un récapitulatif de l'événement (qui apporte quoi, dépenses) en PDF.                    | Moyen      |
| 6.8  | **Webhook / API publique**                       | Permettre à des services externes de s'intégrer (Zapier, Slack bot).                            | Faible     |
| 6.9  | **Import de contacts**                           | Importer ses contacts téléphone/Google pour inviter plus facilement.                            | Moyen      |
| 6.10 | **Intégration Spotify / Playlist collaborative** | Créer une playlist collaborative pour l'événement directement depuis l'app.                     | Moyen      |

---

## 7. Sécurité & Conformité

| #   | Feature                                 | Description                                                                                            | Impact     |
| --- | --------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------- |
| 7.1 | **Conformité RGPD**                     | Consentement explicite, export de données personnelles, droit à l'oubli, politique de confidentialité. | Très élevé |
| 7.2 | **Flux complet de mot de passe oublié** | Écran de reset avec token, validation, confirmation visuelle.                                          | Élevé      |
| 7.3 | **Authentification 2FA**                | Double authentification (TOTP / SMS) pour sécuriser les comptes.                                       | Moyen      |
| 7.4 | **Suppression de compte**               | Permettre à l'utilisateur de supprimer son compte et toutes ses données.                               | Élevé      |
| 7.5 | **Rôles et permissions avancés**        | Co-organisateurs, permissions granulaires (qui peut ajouter des ressources, inviter, etc.).            | Élevé      |
| 7.6 | **Événement privé vs public**           | Visibilité : public (découvrable), privé (sur invitation uniquement).                                  | Moyen      |
| 7.7 | **Signalement / Modération**            | Signaler un contenu inapproprié dans les commentaires ou photos.                                       | Faible     |

---

## 8. Growth & Viralité

| #   | Feature                             | Description                                                                                                                 | Impact     |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 8.1 | **Invitation sans compte**          | Un invité peut voir l'événement et contribuer sans créer de compte (friction minimale), puis convertir en compte plus tard. | Très élevé |
| 8.2 | **Partage WhatsApp / SMS / Social** | Boutons de partage natifs vers WhatsApp, SMS, Instagram Stories, etc.                                                       | Très élevé |
| 8.3 | **Parrainage**                      | "Invite un ami, gagne un badge/fonctionnalité premium".                                                                     | Moyen      |
| 8.4 | **Landing page SEO**                | Pages publiques d'événements indexables par Google pour l'acquisition organique.                                            | Élevé      |
| 8.5 | **Widget embarquable**              | Intégrer un widget "Apporter quelque chose" sur un site externe ou un blog.                                                 | Faible     |
| 8.6 | **Recap email post-événement**      | Email automatique après l'événement avec stats, photos, remerciements — incite au partage.                                  | Élevé      |

---

## 9. Accessibilité & Performance

| #   | Feature                                   | Description                                                                                       | Impact |
| --- | ----------------------------------------- | ------------------------------------------------------------------------------------------------- | ------ |
| 9.1 | **Accessibilité WCAG AA**                 | Navigation clavier complète, ARIA labels, contraste suffisant, lecteur d'écran.                   | Élevé  |
| 9.2 | **Optimistic UI updates**                 | Mettre à jour l'UI avant la réponse serveur (contributions, statuts) pour un ressenti instantané. | Élevé  |
| 9.3 | **Lazy loading & code splitting**         | Charger les modules à la demande pour réduire le bundle initial.                                  | Moyen  |
| 9.4 | **Pagination / Infinite scroll**          | Pour les utilisateurs avec beaucoup d'événements.                                                 | Moyen  |
| 9.5 | **Cache intelligent (SWR / React Query)** | Mise en cache des données avec revalidation en arrière-plan.                                      | Élevé  |

---

## Classement Final — Top 20 par Impact Produit

| Rang | Feature                                     | Catégorie    | Impact     |
| ---- | ------------------------------------------- | ------------ | ---------- |
| 1    | **Lien de partage d'événement + QR code**   | Engagement   | Très élevé |
| 2    | **Invitation sans compte (guest access)**   | Growth       | Très élevé |
| 3    | **Partage WhatsApp / SMS / Social**         | Growth       | Très élevé |
| 4    | **Notifications push (PWA)**                | Engagement   | Très élevé |
| 5    | **Templates d'événements**                  | Organisation | Très élevé |
| 6    | **Sondage de date (Doodle-like)**           | Organisation | Très élevé |
| 7    | **Liste de courses générée**                | Organisation | Très élevé |
| 8    | **Partage de frais (Tricount-like)**        | Financier    | Très élevé |
| 9    | **Export Google Calendar / Apple Calendar** | Intégration  | Très élevé |
| 10   | **Conformité RGPD**                         | Sécurité     | Très élevé |
| 11   | **Profil complet & éditable**               | Social       | Très élevé |
| 12   | **Recherche et filtres sur les événements** | UX           | Très élevé |
| 13   | **Cagnotte / Budget d'événement**           | Financier    | Très élevé |
| 14   | **Commentaires / Chat d'événement**         | Engagement   | Très élevé |
| 15   | **Barre de progression des ressources**     | UX           | Élevé      |
| 16   | **Internationalisation FR/EN**              | Technique    | Élevé      |
| 17   | **Dark mode**                               | UX           | Élevé      |
| 18   | **Vue calendrier**                          | UX           | Élevé      |
| 19   | **Système de "nudge" / relance**            | Engagement   | Élevé      |
| 20   | **Préférences alimentaires visibles**       | Social       | Élevé      |

---

## Matrice Effort / Impact (Résumé visuel)

```
                        IMPACT ÉLEVÉ
                            │
     Quick Wins             │           Big Bets
     ───────────────────────┼───────────────────────
     • Barre de progression │  • Partage de frais
     • Dark mode            │  • Chat d'événement
     • Skeleton loading     │  • Sondage de date
     • Recherche/filtres    │  • Notifications push
     • Export calendrier    │  • Guest access (no account)
     • Pull-to-refresh      │  • Templates d'événements
                            │  • Liste de courses
     EFFORT FAIBLE ─────────┼─────────── EFFORT ÉLEVÉ
                            │
     Nice-to-have           │  Investissements long terme
     ───────────────────────┼───────────────────────
     • Haptic feedback      │  • RGPD complet
     • Page 404 stylisée    │  • i18n FR/EN
     • Drag & drop          │  • Mode offline avancé
     • Widget embarquable   │  • 2FA
     • Réactions emoji      │  • API publique
                            │  • Intégration paiement
                            │
                        IMPACT FAIBLE
```

---

## Recommandation de Priorisation

### Phase 1 — Quick Wins (1-2 sprints)

> Valeur immédiate, effort modéré

1. Lien de partage d'événement
2. Barre de progression des ressources
3. Recherche et filtres
4. Export calendrier (.ics)
5. Profil éditable
6. Dark mode

### Phase 2 — Core Value (3-5 sprints)

> Différenciation produit, rétention

7. Templates d'événements
8. Notifications push
9. Liste de courses générée
10. Sondage de date
11. Commentaires d'événement
12. Préférences alimentaires

### Phase 3 — Growth & Scale (5-10 sprints)

> Acquisition, viralité, monétisation

13. Guest access (invitation sans compte)
14. Partage social (WhatsApp, SMS)
15. Partage de frais
16. Internationalisation FR/EN
17. RGPD
18. Vue calendrier

### Phase 4 — Premium & Polish

> Finitions et features avancées

19. Cagnotte / Budget
20. Événements récurrents
21. Galerie photos
22. Badges & gamification
23. Mode offline avancé
24. Intégration Maps
