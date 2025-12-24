# Roadmap des améliorations (SYFARI)

Objectif: centraliser toutes les améliorations possibles et les faire pas à pas.

Convention:
- \[P0\] indispensable / bloqueur
- \[P1\] important
- \[P2\] utile
- \[P3\] nice-to-have
- \[Dépendances\] éléments requis avant de démarrer
- \[Impact\] produit (UX / sécurité / perf / business)

---

## 1) Groupes

- [ ] \[P0\] Modifier un groupe depuis `/groupes/[id]` (nom, description, montant, fréquence)
- [ ] \[P1\] Gérer le statut du groupe (actif, en attente, archivé)
- [ ] \[P1\] Ajouter une “zone paramètres” réellement persistée (au lieu de cases statiques)
- [ ] \[P1\] Dupliquer un groupe (copier règles + membres optionnel)
- [ ] \[P1\] Archiver / désarchiver un groupe (sans perdre l’historique)
- [ ] \[P2\] Ajouter des tags/catégories (famille, amis, pro, etc.)
- [ ] \[P2\] Recherche + tri + filtres (statut, date, solde, membres, fréquence)
- [ ] \[P2\] Pagination / infinite scroll sur la liste des groupes
- [ ] \[P2\] Vue “Mes groupes” vs “Groupes où je suis membre”
- [ ] \[P3\] Objectif de solde (cible) + barre de progression sur objectif
- [ ] \[P3\] Modèle “règlements du groupe” (pénalités, délais, règles de vote)

---

## 2) Membres

- [ ] \[P0\] Invitations par email (lien d’invitation) au lieu d’un ajout direct
- [ ] \[P0\] Flux accepter/refuser invitation (statut en_attente → actif)
- [ ] \[P0\] Rôles et permissions (responsable, admin, membre) + règles d’accès API
- [ ] \[P1\] Transférer la responsabilité du groupe à un autre membre
- [ ] \[P1\] Bloquer / réactiver un membre (sans suppression)
- [ ] \[P1\] Empêcher le retrait du dernier responsable / règles de sortie
- [ ] \[P2\] Profil membre enrichi dans le contexte groupe (tel, notes, pseudo)
- [ ] \[P2\] Historique d’activité par membre (cotisations, retards, pénalités)
- [ ] \[P2\] Vue “membres en retard” (calcul sur échéances / dernières cotisations)
- [ ] \[P3\] Import de membres via CSV
- [ ] \[P3\] QR code d’invitation (mobile)

---

## 3) Cotisations (planifiées) et échéances

- [ ] \[P0\] Générer automatiquement les échéances selon la fréquence (table `cotisations`)
- [ ] \[P0\] Marquer une cotisation (payée, en attente, en retard, annulée)
- [ ] \[P1\] Règles de pénalités automatiques (fixe, %, par jour de retard)
- [ ] \[P1\] Rappels automatiques (email / SMS) pour échéances proches ou dépassées
- [ ] \[P2\] Tableau récap mensuel (attendu vs reçu, retards, pénalités)
- [ ] \[P2\] Paramétrer “cotisation par membre” vs “cotisation libre”
- [ ] \[P3\] Mode “tontine” (tour de bénéficiaire) + calendrier

---

## 4) Transactions (historique et gestion)

- [ ] \[P0\] Ajouter un écran “détails transaction” (référence, auteur, horodatage, note)
- [ ] \[P0\] Filtrer/chercher les transactions (période, type, membre, statut)
- [ ] \[P1\] Pagination transactions (au lieu d’un `LIMIT 100` fixe)
- [ ] \[P1\] Annuler une transaction (avec traçabilité) et recalcul du solde
- [ ] \[P1\] Éditer une transaction (permissions + audit log)
- [ ] \[P1\] Workflow retraits: demande → approbation → exécution
- [ ] \[P2\] Pièces jointes (reçus) pour transactions
- [ ] \[P2\] Catégoriser transactions (cotisation, retrait, pénalité, remboursement, autres)
- [ ] \[P2\] Réconciliation: outil pour recalculer `solde` depuis les transactions
- [ ] \[P3\] Statistiques avancées: tendance, top contributeurs, saisonnalité

---

## 5) Paiements (PayDunya)

- [ ] \[P0\] Payer une cotisation via PayDunya (mobile money/carte) au lieu d’un enregistrement manuel
- [ ] \[P0\] Lier paiement ↔ transaction (`reference_paiement`) et sécuriser les statuts
- [ ] \[P1\] Webhook/IPN robuste: idempotence, validation montant, gestion erreurs
- [ ] \[P1\] Page suivi paiements (succès, pending, erreurs, relance)
- [ ] \[P2\] Remboursement (si support provider) et traçabilité
- [ ] \[P2\] Paramètres mode test/live + checks des variables d’environnement
- [ ] \[P3\] Multi-providers (Stripe, CinetPay, etc.) via une couche d’abstraction

---

## 6) Exports et rapports

- [ ] \[P0\] Exports “propres” configurables (colonnes, séparateur) pour membres et transactions
- [ ] \[P1\] Rapport PDF serveur (vrai PDF) si besoin pro (au lieu de `window.print`)
- [ ] \[P1\] Rapport mensuel automatique par groupe + archivage
- [ ] \[P2\] Export Excel (`.xlsx`)
- [ ] \[P2\] Rapport par membre (historique, retards, pénalités, total)
- [ ] \[P3\] Signer/horodater les rapports (hash) pour preuve d’intégrité

---

## 7) Votes et décisions

- [ ] \[P0\] UI complète votes dans le groupe (créer, voir, voter, clôturer)
- [ ] \[P1\] Quorum et règles (majorité simple, 2/3, unanimité)
- [ ] \[P1\] Votes liés aux retraits (approval obligatoire avant exécution)
- [ ] \[P2\] Historique décisions + résultat du vote + participants
- [ ] \[P3\] Votes anonymes vs nominaux (paramètre de groupe)

---

## 8) Partage et collaboration

- [ ] \[P1\] Partage “lecture seule” via lien avec token (optionnel)
- [ ] \[P2\] Journal d’audit (qui a fait quoi: membres, transactions, paramètres)
- [ ] \[P2\] Notifications in-app (centre de notifications)
- [ ] \[P3\] Commentaires sur transactions et décisions

---

## 9) UI/UX

- [ ] \[P0\] États vides utiles (CTA: inviter, créer cotisation, ajouter transaction)
- [ ] \[P1\] Skeleton loaders (membres/transactions/groupes)
- [ ] \[P1\] Accessibilité: focus, labels, navigation clavier, contrastes
- [ ] \[P1\] Responsive avancé (tables → cartes sur mobile)
- [ ] \[P2\] Mode sombre (theme complet)
- [ ] \[P2\] Personnalisation visuelle du groupe (couleur, avatar)
- [ ] \[P3\] Favoris / épingler des groupes

---

## 10) Performance

- [ ] \[P1\] Réduire les rechargements complets après actions (optimistic update)
- [ ] \[P1\] Optimiser les appels (endpoint détail + transactions paginées)
- [ ] \[P2\] Caching côté client (mémoriser listes, invalidation ciblée)
- [ ] \[P2\] Index SQL selon usages (transactions par groupe/date)
- [ ] \[P3\] Pré-calculs (matérialisés) pour dashboards lourds

---

## 11) Sécurité

- [ ] \[P0\] Validation stricte des entrées côté API (schémas)
- [ ] \[P0\] Contrôles d’accès systématiques (RBAC) sur tous endpoints
- [ ] \[P1\] Rate limiting sur auth + endpoints sensibles
- [ ] \[P1\] Durcir la gestion token (expiration, refresh, rotation)
- [ ] \[P2\] Journal sécurité (tentatives login, actions sensibles)
- [ ] \[P3\] “Lecture seule” pour certains rôles

---

## 12) Plans et monétisation

- [ ] \[P0\] Appliquer les limites côté API (pas seulement UI) sur exports/votes/membres
- [ ] \[P1\] Page “usage du forfait” (consommation vs limites)
- [ ] \[P2\] Upgrades/downgrades avec prorata (si nécessaire)
- [ ] \[P3\] Offre équipe/entreprise (multi-responsables, gouvernance)

---

## 13) Qualité, tests, DevEx

- [ ] \[P1\] Ajouter scripts explicites `lint`, `typecheck`, `test` dans `package.json`
- [ ] \[P1\] Tests API (auth, groupes, membres, transactions)
- [ ] \[P2\] Tests e2e (parcours: créer groupe → inviter → cotiser → exporter)
- [ ] \[P2\] Observabilité: logs structurés + capture erreurs
- [ ] \[P3\] Environnements (dev/staging/prod) + migrations robustes

---

## 14) Notifications (email/SMS/WhatsApp)

- [ ] \[P1\] Emails: invitation, rappel cotisation, confirmation paiement
- [ ] \[P2\] SMS: rappels et alertes (retards, retraits)
- [ ] \[P3\] WhatsApp: notifications (si fournisseur) + opt-in utilisateur

---

## 15) Internationalisation

- [ ] \[P2\] Multi-langue (FR + langues locales) avec sélecteur
- [ ] \[P2\] Formats monnaie/date selon locale

---

## 16) Données, conformité, sauvegardes

- [ ] \[P1\] Export des données utilisateur (portable)
- [ ] \[P2\] Politique de rétention et suppression de compte
- [ ] \[P2\] Sauvegarde/restauration (process documenté + vérifié)
- [ ] \[P3\] Détection d’anomalies (fraude, montants atypiques)

