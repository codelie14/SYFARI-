# **Cahier des Charges – SYFARI**
**Plateforme SaaS de gestion digitale des tontines et groupes d'épargne collaborative**

**Version** : 1.0
**Date** : 20 décembre 2025
**Auteur** : Élie Archange Yatte
**Stack technique** : Next.js ou React.js, PayDunya, HTMX/Alpine.js, PostgreSQL

---

## **1. Contexte et Objectifs**

### **1.1 Contexte**
En Afrique francophone, les groupes informels (tontines, associations, coopératives) gèrent des milliards de F CFA chaque année **sans outil digitalisé**. Les cotisations, retraits et décisions sont souvent gérés manuellement (cahiers, WhatsApp), ce qui entraîne :
- Des **erreurs de calcul**.
- Un **manque de transparence** (risque de fraude ou de conflits).
- Une **gestion chronophage** pour les responsables.

**SYFARI** vise à **digitaliser et sécuriser** cette gestion, en offrant une plateforme **simple, mobile-first et intégrée à PayDunya** pour les paiements.

### **1.2 Objectifs**
| Objectif                          | Indicateur de succès                                                                 |
|-----------------------------------|--------------------------------------------------------------------------------------|
| **Digitaliser 500 groupes** en 6 mois | 500 groupes actifs (tontines, associations) utilisant SYFARI.                        |
| **Générer 200 000–500 000 F CFA/mois** | Via abonnements, commissions sur transactions et services premium.                  |
| **Réduire les fraudes**           | 0 cas de fraude rapporté grâce à la transparence des transactions.                   |
| **Automatiser les rappels**       | 90% des cotisations payées à temps (vs 60% en gestion manuelle).                     |

---

## **2. Périmètre du Projet**

### **2.1 Fonctionnalités du MVP**
| Fonctionnalité                  | Description                                                                                     | Priorité |
|----------------------------------|-------------------------------------------------------------------------------------------------|----------|
| **Création de groupes**          | Un responsable peut créer un groupe (nom, description, règles de cotisation, membres).       | Haute    |
| **Gestion des membres**          | Ajout/suppression de membres, rôles (admin, membre standard).                                   | Haute    |
| **Cotisations automatiques**     | Planification des cotisations (mensuelles, hebdomadaires) avec rappels SMS/email.              | Haute    |
| **Paiements via PayDunya**       | Intégration de PayDunya pour les cotisations et retraits (mobile money, cartes).                | Haute    |
| **Historique des transactions**  | Affichage clair des dépôts/retraits, solde du groupe, export PDF.                                | Moyenne  |
| **Système de vote**              | Vote pour les décisions (ex : attribution d’un crédit à un membre).                              | Moyenne  |
| **Tableau de bord admin**        | Pour les responsables (statistiques, membres en retard, etc.).                                  | Moyenne  |
| **Support multilingue**          | Interface en français + langues locales (dioula, baoulé).                                        | Basse    |

### **2.2 Fonctionnalités futures (post-MVP)**
- **Crédits internes** : Système de prêt entre membres avec remboursement planifié.
- **Intégration bancaire** : Partenariats avec des banques locales pour des comptes dédiés.
- **Application mobile** : Version mobile (React Native ou Flutter) pour une UX optimisée.
- **Audit financier** : Service premium pour analyser la santé financière du groupe.

---

## **3. Public Cible**
| Segment                   | Description                                                                                     | Taille estimée (Côte d'Ivoire) |
|---------------------------|-------------------------------------------------------------------------------------------------|--------------------------------|
| **Tontines informelles**  | Groupes de 5–50 personnes (famille, amis, voisins) qui épargnent ensemble.                     | 500 000 groupes               |
| **Associations locales**  | Groupes communautaires (femmes, jeunes, professionnels).                                        | 200 000 groupes               |
| **Coopératives agricoles**| Groupes d’agriculteurs gérant des fonds communs.                                               | 50 000 groupes                |

**Cible prioritaire** : Tontines informelles (besoin urgent de transparence et facilité d’adoption).

---

## **4. Modèle Économique**
| Source de revenus               | Détails                                                                                     | Tarification                  |
|----------------------------------|---------------------------------------------------------------------------------------------|--------------------------------|
| **Abonnements mensuels**         | 3 plans : Basique (2 000 F), Standard (5 000 F), Premium (10 000 F) selon la taille du groupe. | 100 000–300 000 F/mois         |
| **Commission sur transactions**   | 1–2% sur chaque cotisation/retrait via PayDunya.                                            | 50 000–150 000 F/mois          |
| **Services premium**             | Audit financier, formation à la gestion, intégration bancaire.                              | 50 000–100 000 F/mois          |
| **Publicité ciblée**             | Partenariats avec banques/assurances pour promouvoir leurs services aux membres.              | 20 000–50 000 F/mois           |

**Revenus totaux estimés** : **220 000–600 000 F CFA/mois** (dès 500 groupes actifs).

---

## **5. Stack Technique**

### **5.1 Backend**
- **Framework** : Django (pour la sécurité et la scalabilité).
- **Base de données** : PostgreSQL (pour gérer les transactions et les groupes).
- **Tâches asynchrones** : Celery (pour les rappels SMS/email).
- **APIs externes** :
  - [PayDunya](https://developer.paydunya.com/) (paiements).
  - [Twilio](https://www.twilio.com/) (SMS).
  - [SendGrid](https://sendgrid.com/) (emails).

### **5.2 Frontend**
- **Framework** : HTMX + Alpine.js (pour une interface légère et réactive sans JavaScript lourd).
- **Design** : Template Bootstrap ou Tailwind CSS (pour un rendu mobile-friendly).

### **5.3 Hébergement et DevOps**
- **Hébergement** : [Railway.app](https://railway.app/) (gratuit pour démarrer, scalable).
- **CI/CD** : GitHub Actions (pour les tests et déploiements automatiques).
- **Monitoring** : Sentry (pour le suivi des erreurs).

---

## **6. Intégrations Clés**
| Intégration               | Utilisation                                                                                 |
|---------------------------|---------------------------------------------------------------------------------------------|
| **PayDunya**              | Paiements des cotisations et retraits (mobile money, cartes).                                |
| **Twilio**                | Envoi de rappels SMS aux membres.                                                           |
| **SendGrid**              | Envoi d’emails (confirmations, rappels).                                                    |
| **Google Sheets API**     | Export des données pour les groupes qui veulent une copie externe.                         |

---

## **7. Roadmap et Planning**

### **7.1 MVP (8 semaines)**
| Semaine | Tâches                                                                                     |
|---------|--------------------------------------------------------------------------------------------|
| 1       | Configuration de Django + modèles (Groupes, Membres, Transactions).                        |
| 2       | Développement des vues pour la création de groupes et gestion des membres.               |
| 3       | Intégration de PayDunya (paiements + tests en sandbox).                                    |
| 4       | Ajout des notifications (SMS/email) et du tableau de bord.                                  |
| 5       | Tests utilisateurs avec 5 groupes pilotes (feedback et corrections).                      |
| 6       | Correction des bugs + optimisations.                                                      |
| 7       | Lancement officiel + campagne marketing (réseaux sociaux, partenariats).                  |
| 8       | Itération : ajout du système de vote et rapports PDF.                                      |

### **7.2 Post-MVP (3–6 mois)**
- Développement des fonctionnalités futures (crédits internes, application mobile).
- Scaling : contact avec des institutions financières pour des partenariats.

---

## **8. Budget Prévisionnel**
| Poste                          | Coût estimé (F CFA) | Détails                                                                 |
|--------------------------------|---------------------|-------------------------------------------------------------------------|
| **Développement**              | 0                   | Auto-développement (pas de coût externe).                               |
| **Hébergement (Railway.app)**  | 10 000–20 000/mois  | Version gratuite pour démarrer, puis plan payant si scaling.            |
| **SMS (Twilio)**               | 5 000–10 000/mois    | Coût par SMS envoyé (environ 10 F/SMS).                                 |
| **Marketing**                   | 30 000–50 000        | Campagnes Facebook/Instagram + partenariats locaux.                      |
| **Support client**             | 0                   | Géré via WhatsApp/email (pas de coût initial).                           |

**Budget total initial** : **45 000–80 000 F CFA** (principalement marketing et SMS).

---

## **9. Stratégie de Lancement**

### **9.1 Acquisition des premiers utilisateurs**
- **Partenariats** :
  - Collaborer avec des associations locales (ex : [REPAOC](https://www.repaoc.org/) en Côte d’Ivoire).
  - Offrir **1 mois gratuit** aux 100 premiers groupes.
- **Ambassadeurs** :
  - Recruter des responsables de tontine influents pour promouvoir SYFARI.

### **9.2 Marketing Digital**
- **Réseaux sociaux** :
  - Campagnes Facebook/Instagram ciblées (ex : "Arrêtez les cahiers, passez à SYFARI !").
  - Vidéos courtes (TikTok, YouTube) expliquant le fonctionnement.
- **Contenu éducatif** :
  - Articles/blogs : "Comment sécuriser votre tontine avec SYFARI".
  - Témoignages des groupes pilotes.

### **9.3 Support et Formation**
- **Webinaires** :
  - Sessions en ligne pour former les responsables de groupe.
- **Support WhatsApp** :
  - Groupe dédié pour répondre aux questions.

---

## **10. Risques et Atténuation**

| Risque                          | Impact                          | Solution                                                                 |
|----------------------------------|---------------------------------|--------------------------------------------------------------------------|
| Méfiance envers le digital      | Adoption lente                 | Démonstrations en personne + formations.                               |
| Concurrence des solutions informelles | Difficulté à convaincre       | Mettre en avant la **transparence** et la **sécurité**.                |
| Fraude aux paiements             | Perte de confiance              | Utiliser les outils anti-fraude de PayDunya + vérification manuelle.  |
| Problèmes techniques            | Instabilité de la plateforme   | Tests rigoureux + monitoring (Sentry).                                  |

---

## **11. Livrables**

| Livrable                          | Date prévue   | Responsable      |
|-----------------------------------|---------------|------------------|
| MVP fonctionnel                   | 8 semaines    | Élie             |
| Landing page + formulaire d’inscription | Semaine 2     | Élie             |
| Intégration PayDunya testée       | Semaine 3     | Élie             |
| Tests utilisateurs (5 groupes)    | Semaine 5     | Élie + groupes pilotes |
| Lancement officiel                | Semaine 7     | Élie             |

---

## **12. Annexes**

### **12.1 Exemple de code (Modèle Django pour un groupe)**
```python
from django.db import models
from django.contrib.auth.models import User

class Groupe(models.Model):
    nom = models.CharField(max_length=100)
    description = models.TextField()
    date_creation = models.DateField(auto_now_add=True)
    responsable = models.ForeignKey(User, on_delete=models.CASCADE, related_name="groupes_responsable")
    membres = models.ManyToManyField(User, related_name="groupes_membre")
    montant_cotisation = models.DecimalField(max_digits=10, decimal_places=2)
    frequence_cotisation = models.CharField(max_length=20, choices=[
        ("hebdomadaire", "Hebdomadaire"),
        ("mensuelle", "Mensuelle"),
        ("trimestrielle", "Trimestrielle"),
    ])
    solde = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        return self.nom

class Transaction(models.Model):
    groupe = models.ForeignKey(Groupe, on_delete=models.CASCADE)
    membre = models.ForeignKey(User, on_delete=models.CASCADE)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=20, choices=[
        ("cotisation", "Cotisation"),
        ("retrait", "Retrait"),
        ("credit", "Crédit"),
    ])
    date = models.DateTimeField(auto_now_add=True)
    statut = models.CharField(max_length=20, choices=[
        ("en_attente", "En attente"),
        ("valide", "Validé"),
        ("rejete", "Rejeté"),
    ], default="en_attente")
    reference_paydunya = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.type} - {self.montant} F - {self.membre.username}"
```

### **12.2 Exemple de landing page (structure)**
```html
<!DOCTYPE html>
<html>
<head>
    <title>SYFARI – Gérez vos tontines en toute transparence</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-12">
        <h1 class="text-4xl font-bold text-center mb-6">SYFARI</h1>
        <p class="text-xl text-center mb-8">
            La première plateforme digitale pour gérer vos tontines et associations
            <strong>en toute transparence</strong>.
        </p>
        <div class="flex justify-center mb-12">
            <a href="#inscription" class="bg-green-500 text-white px-6 py-3 rounded-lg font-bold">
                Essayer gratuitement
            </a>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-2xl font-bold mb-4">✅ Cotisations automatiques</h2>
                <p>Plus de retards, plus d’oubli ! SYFARI rappelle vos membres par SMS.</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-2xl font-bold mb-4">💳 Paiements sécurisés</h2>
                <p>Via PayDunya (Orange Money, MTN, cartes).</p>
            </div>
            <div class="bg-white p-6 rounded-lg shadow">
                <h2 class="text-2xl font-bold mb-4">📊 Historique clair</h2>
                <p>Tout le monde voit où va l’argent.</p>
            </div>
        </div>
        <div id="inscription" class="mt-12 text-center">
            <h2 class="text-2xl font-bold mb-4">Rejoignez les 100 premiers groupes gratuits !</h2>
            <form class="max-w-md mx-auto">
                <input type="email" placeholder="Votre email" class="w-full p-2 mb-4 border rounded">
                <button type="submit" class="bg-green-500 text-white px-6 py-2 rounded-lg font-bold w-full">
                    S’inscrire
                </button>
            </form>
        </div>
    </div>
</body>
</html>
```

### **12.3 Script de démarchage pour les groupes**
```
Bonjour [Nom du responsable],

Je m’appelle Élie, et je développe **SYFARI**, une plateforme pour digitaliser la gestion des tontines et rendre tout plus transparent.

Avec SYFARI, vous pouvez :
✅ Automatiser les rappels de cotisation (plus de retards !).
✅ Tout payer via PayDunya (Orange Money, MTN, cartes).
✅ Voir l’historique des transactions en temps réel.

Nous offrons **1 mois gratuit** aux 100 premiers groupes. Seriez-vous intéressé par une démo ?

Cordialement,
Élie Archange Yatte
Fondateur de SYFARI
archangeyatte@gmail.com | +225 07 11 45 48 41 | archangeyatte.vercel.app
```

---

## **13. Conclusion**
SYFARI est un projet **ambitieux mais réalisable**, avec un **marché immense et peu concurrentiel** en Afrique francophone. En combinant une **technologie simple (Django + PayDunya)** et une **stratégie d’acquisition ciblée**, tu peux atteindre tes objectifs financiers tout en ayant un **impact social positif**.
