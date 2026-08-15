# PROJET : CERTIFLOW

Tu es un ingénieur logiciel senior spécialisé en applications desktop modernes, UX/UI et génération de documents.

Ta mission est de concevoir et développer **CertiFlow**, une application desktop professionnelle permettant aux écoles et centres de formation de générer automatiquement des attestations et certificats en masse à partir d'un fichier Excel.

L'objectif n'est PAS de créer un logiciel énorme.

L'objectif est de créer une **V1 réellement fonctionnelle, élégante, légère, intuitive et commercialisable**, qui pourra ensuite être personnalisée pour différents centres de formation.

---

# 1. VISION DU PRODUIT

CertiFlow permet à un secrétariat de passer de :

> fichier Excel contenant les étudiants

à :

> plusieurs dizaines ou centaines d'attestations PDF personnalisées

en quelques clics.

Le workflow principal doit être :

```text
IMPORTER LES DONNÉES
        ↓
CONFIGURER LE MODÈLE
        ↓
PERSONNALISER LE CONTENU
        ↓
PRÉVISUALISER
        ↓
GÉNÉRER LES ATTESTATIONS
        ↓
EXPORTER LES PDF
```

L'application doit être suffisamment simple pour qu'un secrétaire qui n'est pas informaticien puisse l'utiliser sans formation.

---

# 2. POSITIONNEMENT

CertiFlow n'est pas un logiciel administratif complet.

Ce n'est pas :

* un ERP scolaire
* un logiciel de gestion des étudiants
* un CRM
* un SaaS
* un réseau social
* un outil de paiement
* un éditeur graphique généraliste
* un clone de Canva
* un clone de n8n

CertiFlow est avant tout :

> **un outil professionnel de génération automatisée de documents de formation.**

---

# 3. UTILISATEUR CIBLE

Utilisateur principal :

* secrétaire d'école
* responsable administratif
* directeur de centre de formation
* responsable pédagogique

Le niveau informatique de l'utilisateur peut être faible.

L'interface doit donc privilégier :

* simplicité
* clarté
* guidage
* feedback visuel
* prévention des erreurs

Éviter les termes trop techniques.

---

# 4. STACK TECHNIQUE OBLIGATOIRE

Utiliser :

## Desktop

* Tauri 2

## Frontend

* React
* TypeScript
* Vite

## UI

* Tailwind CSS
* shadcn/ui
* Lucide Icons

## Drag & Drop

* dnd-kit

## Éditeur graphique

* Fabric.js

## Excel / CSV

* SheetJS

## Base de données locale

* SQLite

## ORM

* Drizzle ORM

## Validation

* Zod

## Backend natif

* Rust via Tauri

L'application doit fonctionner **localement et hors ligne**.

Aucun backend distant n'est nécessaire pour la V1.

Ne pas ajouter :

* Supabase
* Firebase
* PostgreSQL distant
* serveur Express
* API externe
* authentification cloud
* système de paiement

sauf si une nécessité technique réelle apparaît.

---

# 5. PRINCIPES D'ARCHITECTURE

Séparer clairement :

```text
UI React
   ↓
Services frontend
   ↓
Commandes Tauri
   ↓
Rust
   ↓
SQLite / système de fichiers
```

Le frontend ne doit pas avoir accès directement aux opérations sensibles du système.

Utiliser les APIs/commands Tauri de manière propre.

Éviter les gros fichiers monolithiques.

Chaque fonctionnalité doit être organisée en modules cohérents.

---

# 6. PHILOSOPHIE DE L'INTERFACE

L'application doit être :

* moderne
* élégante
* professionnelle
* légère
* rapide
* intuitive

Le design doit donner l'impression d'un produit commercial fini.

Éviter absolument :

* interfaces surchargées
* trop de boutons
* couleurs agressives
* animations excessives
* menus inutiles
* panneaux partout
* fenêtres de configuration interminables

Utiliser beaucoup d'espace blanc.

Les composants doivent avoir une hiérarchie visuelle claire.

---

# 7. DESIGN SYSTEM

Créer un petit design system cohérent.

Prévoir :

* boutons primaires
* boutons secondaires
* boutons danger
* champs de texte
* selects
* toggles
* cards
* modales
* tooltips
* menus contextuels
* notifications/toasts
* badges
* progress bars
* empty states
* loading states
* error states

Les animations doivent être subtiles.

Utiliser des transitions courtes et fluides.

Ne pas ajouter d'animations simplement pour faire joli.

---

# 8. STRUCTURE DE NAVIGATION

L'application doit avoir une navigation simple.

Prévoir idéalement :

```text
CertiFlow

Accueil
Projets
Modèles
Paramètres
```

Pas besoin de 15 sections.

---

# 9. ÉCRAN D'ACCUEIL

L'écran d'accueil doit être très simple.

Afficher :

* logo CertiFlow
* nom de l'application
* bouton "Nouveau projet"
* projets récents
* modèles récents

Exemple conceptuel :

```text
CertiFlow

Bonjour 👋

Que souhaitez-vous faire ?

[ + Nouveau projet ]

Projets récents

Promotion Informatique 2026
127 étudiants
Modifié il y a 2 heures

Formation Comptabilité
84 étudiants
Modifié hier
```

Créer également un état vide élégant lorsqu'il n'existe aucun projet.

---

# 10. CONCEPT DE PROJET

Un projet représente une génération d'attestations.

Un projet doit pouvoir contenir :

* nom
* description facultative
* fichier source
* colonnes importées
* modèle utilisé
* paramètres
* étudiants
* historique de génération
* fichiers générés

Exemple :

```text
Promotion Informatique 2026
```

---

# 11. IMPORT EXCEL

L'utilisateur doit pouvoir importer :

* XLSX
* XLS si supporté
* CSV

Utiliser SheetJS.

Après import :

1. lire le fichier
2. détecter les feuilles
3. détecter les colonnes
4. afficher un aperçu
5. permettre à l'utilisateur de confirmer

Afficher les premières lignes sous forme de tableau.

Exemple :

```text
Nom       Prénom       Formation       Moyenne
Dupont    Jean         Informatique    15.5
Martin    Paul         Informatique    13.2
...
```

---

# 12. MAPPING DES COLONNES

L'utilisateur doit pouvoir associer les colonnes Excel aux variables CertiFlow.

Exemple :

```text
Colonne Excel       Variable CertiFlow

Nom                 → {{nom}}
Prénom              → {{prenom}}
Moyenne             → {{moyenne}}
Formation           → {{formation}}
Mention             → {{mention}}
```

Le système doit proposer automatiquement les correspondances évidentes.

Par exemple :

```text
"Nom" → {{nom}}
"Prénom" → {{prenom}}
"Moyenne" → {{moyenne}}
```

Mais l'utilisateur doit pouvoir modifier manuellement.

---

# 13. VARIABLES

Prévoir un système de variables.

Variables initiales :

```text
{{nom}}
{{prenom}}
{{nom_complet}}
{{matricule}}
{{formation}}
{{specialite}}
{{note}}
{{moyenne}}
{{mention}}
{{rang}}
{{duree}}
{{annee}}
{{annee_academique}}
{{date}}
{{date_obtention}}
{{numero}}
```

Prévoir une architecture permettant d'ajouter facilement de nouvelles variables plus tard.

---

# 14. VALIDATION DES DONNÉES

Avant génération, détecter :

* étudiants sans nom
* variables non résolues
* colonnes manquantes
* données invalides
* doublons éventuels
* numéro d'attestation déjà utilisé si la numérotation est activée

Afficher les problèmes clairement.

Ne jamais générer silencieusement des documents incorrects.

Exemple :

```text
⚠ 3 étudiants ont des données manquantes

Jean Dupont
→ moyenne manquante

Paul Martin
→ formation manquante

[Voir les erreurs]
```

---

# 15. ÉDITEUR D'ATTESTATION

C'est une fonctionnalité centrale.

Utiliser Fabric.js.

Le document par défaut doit être :

```text
A4 paysage
```

Dimensions :

```text
297 × 210 mm
```

L'utilisateur doit voir une représentation réaliste de la page.

---

# 16. ÉLÉMENTS DISPONIBLES

Dans l'éditeur, proposer une petite bibliothèque :

```text
Texte
Variable
Image
Ligne
Rectangle
```

Ne PAS construire un éditeur graphique généraliste.

---

# 17. DRAG & DROP

L'utilisateur doit pouvoir :

* glisser un élément
* le déposer sur le document
* le déplacer
* le redimensionner
* le sélectionner
* le supprimer

Utiliser dnd-kit pour les interactions de bibliothèque/panneaux.

Utiliser Fabric.js pour les éléments du canvas.

---

# 18. TEXTE

Lorsqu'un utilisateur ajoute un bloc texte :

```text
Double-cliquez pour modifier
```

Il doit pouvoir modifier :

* contenu
* taille
* police
* graisse
* italique
* alignement
* couleur
* position
* taille

---

# 19. VARIABLES DANS LE TEXTE

L'utilisateur doit pouvoir écrire :

```text
Nous certifions que {{nom_complet}}
a suivi avec succès la formation
{{formation}}
durant l'année {{annee_academique}}.
```

Dans l'éditeur, proposer une liste de variables disponibles.

Cliquer sur une variable doit permettre de l'insérer facilement.

---

# 20. TEXTE PERSONNALISABLE

Le texte de l'attestation ne doit jamais être codé en dur.

Un centre doit pouvoir écrire son propre contenu.

Exemple :

```text
Nous soussignés, Centre XYZ,
attestons que {{nom_complet}}
a suivi avec succès la formation
{{formation}}.
```

Un autre centre peut utiliser un texte complètement différent.

Le moteur doit rester identique.

---

# 21. LOGO

Permettre :

* import PNG
* import JPG
* éventuellement SVG si facilement supportable

L'utilisateur peut placer le logo sur l'attestation.

Prévoir :

* redimensionnement
* déplacement
* suppression

---

# 22. SIGNATURES

Permettre d'importer une image de signature.

Prévoir plusieurs signatures.

Exemple :

```text
Directeur
Responsable pédagogique
```

Chaque signature doit être positionnable.

---

# 23. CACHET

Permettre également d'ajouter une image de cachet.

Même logique que le logo :

* importer
* déplacer
* redimensionner
* supprimer

---

# 24. STYLE DU DOCUMENT

Permettre de modifier au minimum :

* police
* taille
* couleur
* alignement
* gras
* italique
* bordure
* couleur de bordure

Prévoir quelques styles prédéfinis pour accélérer la création.

---

# 25. MODÈLES

Un modèle représente le design d'une attestation.

L'utilisateur doit pouvoir :

* créer un modèle
* modifier un modèle
* dupliquer un modèle
* supprimer un modèle
* renommer un modèle

Exemple :

```text
Attestation classique
Attestation informatique
Certificat de formation
```

---

# 26. APERÇU

L'aperçu doit être en temps réel.

Lorsqu'une variable est présente :

```text
{{nom}}
```

afficher dans l'aperçu avec un étudiant réel de démonstration.

Prévoir un sélecteur :

```text
Aperçu avec :

Jean Dupont
Paul Martin
Marie Ngo
```

Cela permet de vérifier le rendu avant génération.

---

# 27. NUMÉROTATION

Permettre une numérotation automatique.

Exemple :

```text
CERT-2026-001
CERT-2026-002
CERT-2026-003
```

Le système doit permettre un préfixe.

Exemples :

```text
CERT-
ATT-
CERT/2026/
```

Prévoir également :

* numéro de départ
* nombre de chiffres
* année

---

# 28. INFORMATIONS DE L'ÉTABLISSEMENT

Prévoir un profil d'établissement.

Données :

```text
Nom
Adresse
Téléphone
Email
Site web
Logo
Slogan
Nom du directeur
```

Ces informations peuvent être réutilisées dans plusieurs modèles.

---

# 29. GÉNÉRATION PDF

Une fois tout validé :

```text
Générer les attestations
```

L'application doit :

1. vérifier les données
2. afficher les erreurs
3. demander confirmation
4. générer les documents
5. afficher la progression

Exemple :

```text
Génération des attestations

██████████████████░░ 87%

110 / 127
```

---

# 30. NOMS DES FICHIERS

Prévoir un système configurable.

Par défaut :

```text
{{nom}}_{{prenom}}_attestation.pdf
```

Exemple :

```text
Dupont_Jean_attestation.pdf
```

Éviter les caractères invalides dans les noms de fichiers.

---

# 31. EXPORT ZIP

Après génération :

```text
127 attestations générées

[ Ouvrir le dossier ]
[ Créer un ZIP ]
```

Le ZIP doit contenir tous les PDF.

---

# 32. GESTION DES ERREURS

Toutes les erreurs doivent être compréhensibles par un utilisateur normal.

Ne jamais afficher simplement :

```text
Error: SQLITE_CONSTRAINT...
```

Afficher plutôt :

```text
Impossible d'enregistrer le modèle.

Une erreur inattendue s'est produite.
Réessayez.

[ Copier les détails techniques ]
```

Les détails techniques peuvent être accessibles séparément.

---

# 33. SAUVEGARDE

Sauvegarder automatiquement les modifications importantes.

Éviter que l'utilisateur perde son modèle après une fermeture accidentelle.

Prévoir :

```text
Sauvegarde automatique...
Enregistré ✓
```

---

# 34. BASE DE DONNÉES

Prévoir au minimum les entités :

```text
establishment
projects
students
templates
template_elements
settings
generation_jobs
```

Ne pas créer une architecture inutilement complexe.

---

# 35. STOCKAGE DES FICHIERS

Organiser les fichiers localement.

Exemple conceptuel :

```text
CertiFlow/
    data/
        database.sqlite
        projects/
        templates/
        assets/
        generated/
```

Les chemins doivent être gérés proprement par Tauri.

Ne jamais dépendre d'un chemin absolu spécifique à une machine.

---

# 36. SÉCURITÉ

L'application manipule potentiellement des informations personnelles.

Donc :

* ne pas envoyer les données vers Internet
* ne pas utiliser d'API externe pour les étudiants
* ne pas logger les données personnelles inutilement
* protéger correctement les commandes Tauri
* valider les entrées
* éviter les injections HTML
* nettoyer les noms de fichiers
* limiter les accès fichiers aux besoins de l'application

---

# 37. PERFORMANCE

L'application doit rester légère.

Elle doit pouvoir gérer au minimum :

```text
500 étudiants
```

sans devenir inutilisable.

Objectif raisonnable :

* import rapide
* interface fluide
* aperçu rapide
* génération fiable
* mémoire maîtrisée

Ne pas charger inutilement tous les PDF en mémoire.

---

# 38. GÉNÉRATION EN MASSE

Pour 500 étudiants, ne pas créer une énorme opération bloquante.

Utiliser une file de traitement.

Conceptuellement :

```text
Étudiant 1 → PDF
Étudiant 2 → PDF
Étudiant 3 → PDF
...
```

Afficher la progression.

Permettre l'annulation si techniquement possible.

---

# 39. MODES D'UTILISATION

Le produit doit fonctionner sans connexion Internet.

Aucune fonctionnalité essentielle ne doit dépendre du réseau.

---

# 40. PARAMÈTRES

Prévoir une page paramètres simple :

```text
Général
    Langue
    Thème

Documents
    Format PDF
    Dossier de sortie
    Format de nommage

Établissement
    Informations

Avancé
    Logs
    Réinitialisation
```

Ne pas surcharger.

---

# 41. THÈME

Prévoir :

* clair
* sombre
* système

Le thème doit être cohérent avec toute l'application.

---

# 42. RESPONSIVE

Même si c'est une application desktop, l'interface doit pouvoir fonctionner correctement sur des résolutions modestes.

Ne pas supposer uniquement un écran 4K.

Tester notamment sur une résolution proche de :

```text
1366 × 768
```

---

# 43. ACCESSIBILITÉ

Prévoir :

* labels clairs
* focus clavier
* tooltips
* contrastes corrects
* boutons suffisamment grands
* messages d'erreur explicites

---

# 44. ÉTATS VIDES

Chaque section doit avoir un état vide élégant.

Exemple :

```text
Aucun modèle

Créez votre premier modèle d'attestation.

[ + Créer un modèle ]
```

---

# 45. ONBOARDING

Au premier lancement, afficher un petit parcours :

```text
Bienvenue dans CertiFlow 👋

Étape 1
Configurez votre établissement

Étape 2
Importez vos étudiants

Étape 3
Créez votre modèle

Étape 4
Générez vos attestations
```

Ne pas faire un tutoriel interminable.

---

# 46. DONNÉES DE DÉMONSTRATION

Prévoir un mode/données de démonstration permettant de tester rapidement l'application.

Créer par exemple :

```text
10 étudiants fictifs
```

avec :

* noms
* formations
* notes
* mentions
* numéros

Cela permettra de tester l'éditeur sans importer immédiatement un fichier Excel.

---

# 47. PREMIER MODÈLE PAR DÉFAUT

Créer un modèle d'attestation élégant en :

```text
A4 paysage
```

Il doit servir de démonstration.

Style :

* professionnel
* moderne
* sobre
* beaucoup d'espace
* hiérarchie claire

Ne pas faire quelque chose de kitsch ou surchargé.

---

# 48. WORKFLOW PRINCIPAL

Le workflow principal doit être extrêmement clair.

Idéalement :

```text
1. Importer
2. Vérifier les données
3. Choisir/créer un modèle
4. Personnaliser
5. Aperçu
6. Générer
7. Exporter
```

Afficher éventuellement une barre d'étapes en haut.

---

# 49. NE PAS SUR-DÉVELOPPER

C'est une règle importante.

Ne pas ajouter spontanément :

* comptes utilisateurs
* cloud
* synchronisation
* paiement
* analytics
* IA
* marketplace
* plugins
* collaboration
* multi-utilisateur
* notifications push
* système d'abonnement
* serveur
* API publique

Ces fonctionnalités pourront être ajoutées dans le futur.

---

# 50. ARCHITECTURE DU CODE

Le projet doit être maintenable.

Organiser les fichiers par fonctionnalité plutôt que créer un dossier rempli de composants génériques.

Exemple :

```text
src/
    components/
    features/
        dashboard/
        projects/
        import/
        editor/
        templates/
        generation/
        settings/
    services/
    hooks/
    lib/
    types/

src-tauri/
    src/
        commands/
        database/
        filesystem/
        pdf/
        models/
        services/
```

Adapter cette structure si une meilleure architecture est nécessaire, mais garder une séparation claire des responsabilités.

---

# 51. TYPESCRIPT

TypeScript doit être utilisé correctement.

Éviter :

```text
any
```

sauf justification.

Créer des types explicites pour :

* Student
* Project
* Template
* TemplateElement
* Variable
* Establishment
* GenerationJob

---

# 52. VALIDATION

Utiliser Zod pour valider les données provenant :

* d'Excel
* des formulaires
* du frontend
* des paramètres

Ne jamais faire confiance aveuglément aux données importées.

---

# 53. LOGGING

Créer un système de logs local minimal.

Les logs doivent être utiles au debugging mais ne doivent pas contenir inutilement :

* noms complets d'étudiants
* données personnelles
* informations sensibles

---

# 54. TESTS

Écrire des tests pour les parties critiques :

* parsing Excel
* mapping des colonnes
* remplacement des variables
* validation
* génération des noms de fichiers
* numérotation
* génération de documents

L'éditeur visuel peut avoir moins de tests unitaires mais doit être testé manuellement.

---

# 55. CRITÈRES DE RÉUSSITE DE LA V1

La V1 est considérée comme terminée lorsqu'un utilisateur peut faire ce parcours complet :

```text
Lancer CertiFlow
        ↓
Créer un projet
        ↓
Importer un fichier Excel
        ↓
Voir les étudiants
        ↓
Mapper les colonnes
        ↓
Créer un modèle
        ↓
Ajouter du texte
        ↓
Ajouter des variables
        ↓
Ajouter un logo
        ↓
Ajouter une signature
        ↓
Modifier le contenu
        ↓
Voir l'aperçu avec un étudiant
        ↓
Valider
        ↓
Générer 100+ PDF
        ↓
Ouvrir le dossier
        ↓
Créer un ZIP
```

Tout ce parcours doit fonctionner sans Internet.

---

# 56. ORDRE DE DÉVELOPPEMENT

NE PAS commencer directement par l'éditeur graphique.

Développer dans cet ordre :

## Phase 1 — Fondation

* initialiser Tauri 2
* React
* TypeScript
* Vite
* Tailwind
* shadcn/ui
* architecture
* navigation
* thème

## Phase 2 — Projet

* création de projet
* SQLite
* sauvegarde
* projets récents

## Phase 3 — Excel

* import XLSX/CSV
* lecture
* aperçu
* mapping
* validation

## Phase 4 — Variables

* système de variables
* remplacement
* aperçu des données

## Phase 5 — Génération PDF minimale

Avant l'éditeur complet, réussir à générer :

```text
Excel
→ modèle HTML
→ variables
→ PDF
```

Cette étape doit être parfaitement fonctionnelle.

## Phase 6 — Éditeur

* Fabric.js
* texte
* variables
* images
* lignes
* formes
* déplacement
* redimensionnement
* propriétés

## Phase 7 — Modèles

* sauvegarder
* charger
* dupliquer
* supprimer

## Phase 8 — Génération massive

* file de génération
* progression
* erreurs
* annulation si possible
* export ZIP

## Phase 9 — Polish

* animations
* empty states
* loading states
* tooltips
* onboarding
* raccourcis clavier
* messages d'erreur
* optimisation

---

# 57. RÈGLE IMPORTANTE SUR LE PDF

Le moteur PDF est un point critique.

Avant de finaliser l'architecture de génération, créer un prototype minimal qui vérifie :

1. A4 paysage
2. texte
3. variables
4. images
5. polices
6. positionnement précis
7. plusieurs pages
8. génération de 100 documents

Si une technologie ne permet pas d'obtenir un rendu suffisamment fidèle, la remplacer.

La qualité du PDF est prioritaire.

---

# 58. QUALITÉ VISUELLE

Le rendu final doit donner l'impression d'une vraie application commerciale.

Avant de considérer une interface terminée, vérifier :

* alignement
* espacement
* typographie
* hiérarchie
* cohérence des boutons
* cohérence des icônes
* états hover
* états disabled
* chargement
* erreurs
* responsive desktop
* dark mode

Ne jamais laisser des composants avec des styles temporaires.

---

# 59. UX : RÈGLE DES 10 SECONDES

Un nouvel utilisateur doit comprendre en quelques secondes :

```text
Ce que fait CertiFlow
Comment importer mes étudiants
Comment créer mon modèle
Comment générer mes attestations
```

Si une fonctionnalité nécessite une explication longue, simplifier l'interface.

---

# 60. IMPORTANT : NE PAS INVENTER DES FONCTIONNALITÉS

Si tu rencontres une ambiguïté, privilégie la solution :

* simple
* robuste
* locale
* maintenable

Ne pas ajouter automatiquement une fonctionnalité juste parce qu'elle semble intéressante.

Si une décision technique importante est nécessaire, explique :

1. le problème
2. les options
3. la solution recommandée
4. pourquoi

Puis continue avec la solution la plus raisonnable si elle ne nécessite pas de décision produit.

---

# 61. DÉVELOPPEMENT INCRÉMENTAL

Ne tente pas de générer toute l'application en une seule fois.

Construis par étapes fonctionnelles.

À la fin de chaque étape :

1. vérifier que le projet compile
2. lancer l'application
3. tester la fonctionnalité
4. corriger les erreurs
5. seulement ensuite passer à l'étape suivante

Ne laisse pas volontairement un projet cassé pour "finir plus tard".

---

# 62. INTERDICTION DU FAUX FONCTIONNEL

Ne créer aucun bouton qui ne fait rien.

Ne pas utiliser de fausses données dans les fonctionnalités finales.

Si une fonctionnalité n'est pas encore implémentée :

* soit ne pas l'afficher
* soit afficher clairement qu'elle est en développement

Mais ne jamais simuler une fonctionnalité comme si elle fonctionnait.

---

# 63. LIVRABLE ATTENDU

À la fin du développement, fournir :

* code source complet
* structure propre
* instructions d'installation
* instructions de développement
* instructions de build
* documentation minimale
* schéma de base de données
* exemples de fichiers Excel
* modèle de démonstration
* tests des fonctionnalités critiques

Le projet doit pouvoir être cloné et lancé proprement.

---

# 64. PREMIÈRE TÂCHE

NE COMMENCE PAS par générer immédiatement tout le projet.

Commence par :

1. analyser ce cahier des charges
2. identifier les éventuels conflits techniques
3. proposer l'architecture finale
4. proposer l'arborescence complète du projet
5. identifier les dépendances nécessaires
6. identifier les risques techniques, notamment concernant Fabric.js + Tauri et la génération PDF
7. proposer le plan de développement par étapes

Ensuite, commence la Phase 1.

---

# 65. RÈGLE FINALE

Toujours garder en tête cette phrase :

> **CertiFlow doit être suffisamment puissant pour faire gagner énormément de temps à un secrétariat, mais suffisamment simple pour qu'une personne puisse l'utiliser sans formation.**

Ne cherche pas à construire le logiciel le plus complexe.

Construis le logiciel que les centres de formation auront envie d'utiliser.

Le produit doit être :

**BEAU. SIMPLE. RAPIDE. FIABLE. HORS LIGNE. PERSONNALISABLE.**

Commence maintenant par l'analyse technique du projet et le plan d'architecture avant d'écrire le code.
agy --conversation=7788b200-416b-4218-ad69-463e128b57a6

