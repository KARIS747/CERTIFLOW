# 📚 Manuel Utilisateur — CertiFlow

> **Version** : 1.0 — *Générateur Automatisé d'Attestations & Certificats Académiques*

---

## Table des matières

1. [Présentation générale](#1-présentation-générale)
2. [Démarrage rapide](#2-démarrage-rapide)
3. [Interface principale](#3-interface-principale)
4. [Étape 1 — Tableau de bord](#4-étape-1--tableau-de-bord)
5. [Étape 2 — Gestion des projets](#5-étape-2--gestion-des-projets)
6. [Étape 3 — Importer les étudiants](#6-étape-3--importer-les-étudiants)
7. [Étape 4 — Modèles d'attestation](#7-étape-4--modèles-dattestation)
8. [Étape 5 — Studio d'édition](#8-étape-5--studio-dédition)
9. [Étape 6 — Génération & Export](#9-étape-6--génération--export)
10. [Étape 7 — Paramètres de l'établissement](#10-étape-7--paramètres-de-létablissement)
11. [Variables disponibles dans les modèles](#11-variables-disponibles-dans-les-modèles)
12. [Format du fichier Excel attendu](#12-format-du-fichier-excel-attendu)
13. [Questions fréquentes (FAQ)](#13-questions-fréquentes-faq)

---

## 1. Présentation générale

**CertiFlow** est une application web conçue pour automatiser la création et l'impression d'attestations de réussite, de certificats académiques et de diplômes en grand volume.

Au lieu de modifier manuellement des centaines de documents Word, CertiFlow vous permet de :

- 📥 **Importer** votre liste d'étudiants depuis un fichier Excel ou CSV
- 🎨 **Concevoir** un modèle d'attestation personnalisé dans le studio visuel
- 🔄 **Générer automatiquement** une attestation par étudiant avec ses données
- 📦 **Exporter** tous les PDFs en un seul clic (fichier ZIP)

---

## 2. Démarrage rapide

### Lancer l'application

```bash
npm install   # Une seule fois
npm run dev   # Lance le serveur sur http://localhost:1420
```

Ouvrez votre navigateur sur **http://localhost:1420**.

### Premier démarrage — Mode Démo

Lors du premier lancement, une **fenêtre de bienvenue** apparaît. Cliquez sur **"Charger la Démo"** pour pré-remplir l'application avec :
- 10 étudiants fictifs complets
- 2 modèles d'attestation prestige
- Les paramètres de l'établissement de démonstration

Cela vous permet de tester toutes les fonctionnalités immédiatement sans préparer de données.

---

## 3. Interface principale

L'interface est organisée en une **barre de navigation latérale** à gauche, avec 7 sections accessibles :

| Icône | Section | Rôle |
|---|---|---|
| 🏠 | **Tableau de bord** | Vue d'ensemble et statistiques |
| 📁 | **Projets** | Créer et gérer vos projets |
| 📥 | **Importer** | Charger votre fichier Excel/CSV |
| 🖼️ | **Modèles** | Galerie et éditeur de modèles |
| 🎨 | **Studio** | Éditeur canvas interactif |
| ⚙️ | **Paramètres** | Informations de votre établissement |

---

## 4. Étape 1 — Tableau de bord

Le tableau de bord affiche :

- **Statistiques globales** : nombre de projets, d'étudiants importés, d'attestations générées
- **Projets récents** : accès rapide à vos derniers projets
- **Actions rapides** : boutons pour créer un projet, importer des données ou ouvrir le studio

### Actions disponibles

| Bouton | Action |
|---|---|
| ➕ Nouveau Projet | Crée un projet vierge |
| 📥 Importer des données | Raccourci vers la page d'import |
| 🎨 Ouvrir le Studio | Lance l'éditeur canvas directement |
| ⚡ Charger la Démo | Pré-remplit tout avec des données fictives |

---

## 5. Étape 2 — Gestion des projets

Un **projet** regroupe une liste d'étudiants, un modèle d'attestation et les paramètres de génération.

### Créer un nouveau projet

1. Cliquez sur **"Nouveau Projet"**
2. Entrez le nom du projet (ex: *"Promotion Juin 2026 — Développement Web"*)
3. Le projet est créé et sélectionné automatiquement

### Gérer vos projets

- **Sélectionner** : cliquez sur un projet pour le rendre actif
- **Renommer** : icône crayon ✏️
- **Dupliquer** : icône copie 📋
- **Supprimer** : icône poubelle 🗑️ (confirmation demandée)

> ⚠️ Toutes les données sont sauvegardées **dans votre navigateur** (localStorage). Elles persistent entre les sessions mais sont liées à votre navigateur et ordinateur.

---

## 6. Étape 3 — Importer les étudiants

### Formats supportés

- **Excel** : `.xlsx`, `.xls`
- **CSV** : `.csv` (séparateur `,` ou `;`)

### Méthode d'import

1. Cliquez sur **"Importer les étudiants"** ou glissez-déposez votre fichier dans la zone prévue
2. CertiFlow analyse automatiquement les colonnes et les mappe aux champs connus
3. Un aperçu des données est affiché avec les anomalies détectées en orange
4. Cliquez sur **"Confirmer l'import"** pour valider

### Colonnes reconnues automatiquement

CertiFlow détecte ces noms de colonnes (insensible à la casse, avec ou sans accents) :

| Champ attendu | Noms de colonnes reconnus |
|---|---|
| Nom | `nom`, `last_name`, `surname` |
| Prénom | `prenom`, `prénom`, `first_name` |
| Formation | `formation`, `filiere`, `filière`, `course` |
| Note | `note`, `grade`, `score`, `moyenne` |
| Mention | `mention`, `honors` |
| Date | `date_obtention`, `date`, `graduation_date` |

> 💡 Si une colonne n'est pas reconnue, vous pouvez la mapper manuellement dans l'interface.

### Validation des données

Après l'import, CertiFlow signale :
- 🔴 **Erreurs bloquantes** : nom ou prénom manquant
- 🟠 **Avertissements** : note hors limites (0-20), email invalide, champs vides

---

## 7. Étape 4 — Modèles d'attestation

### Modèles inclus

| Modèle | Style | Usage |
|---|---|---|
| **Prestige Or & Marine** | Royal, classique, triple cadre doré | Attestations de réussite officielles |
| **Moderne Cyan Épuré** | Contemporain, minimaliste | Certificats de compétences, formations courtes |

### Créer un nouveau modèle

1. Cliquez sur **"Créer un Nouveau Modèle"**
2. Un modèle vierge est créé avec les éléments de base
3. Ouvrez le **Studio** pour le personnaliser graphiquement

### Dupliquer un modèle

Cliquez sur l'icône de copie sur la carte du modèle. Le duplicata est créé et devient actif — idéal pour créer des variantes d'un modèle existant.

### Recharger les modèles officiels

Cliquez sur **"✦ Recharger Modèles Prestige"** pour restaurer les modèles de démonstration originaux (utile si vous les avez accidentellement modifiés ou supprimés).

---

## 8. Étape 5 — Studio d'édition

Le studio est le **cœur de CertiFlow**. C'est un éditeur canvas interactif où vous dessinez votre attestation.

### Zones de l'interface du studio

```
┌─────────────────────────────────────────────────────┐
│  BARRE D'OUTILS (zoom, ajout d'éléments, aperçu)   │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│   CANVAS A4 PAYSAGE      │  PANNEAU PROPRIÉTÉS      │
│   (297 × 210 mm)         │  (texte, taille, couleur)│
│                          │                          │
│                          ├──────────────────────────│
│                          │  BIBLIOTHÈQUE D'ÉLÉMENTS │
│                          │  (variables, formes)     │
└──────────────────────────┴──────────────────────────┘
│  SÉLECTEUR D'APERÇU ÉTUDIANT                       │
└─────────────────────────────────────────────────────┘
```

### Contrôles de zoom

| Bouton | Action |
|---|---|
| `35%` → `125%` | Niveaux de zoom prédéfinis |
| **Ajuster** | Ajuste le canvas à la fenêtre |
| **Plein écran** | Étend l'espace de travail |

### Ajouter des éléments

**Depuis la barre d'outils ou la bibliothèque :**

| Élément | Description |
|---|---|
| 📝 **Texte libre** | Bloc de texte statique éditable |
| `{}` **Variable** | Texte dynamique remplacé par les données étudiant |
| ▭ **Rectangle** | Cadre, fond coloré, bordure décorative |
| ─ **Ligne** | Séparateur horizontal |

### Manipuler les éléments

- **Déplacer** : cliquez et faites glisser
- **Redimensionner** : tirez les poignées aux coins
- **Éditer le texte** : double-cliquez sur un élément texte
- **Sélectionner** : clic simple pour sélectionner, `Suppr` pour supprimer

### Panneau Propriétés (élément sélectionné)

Quand un élément texte est sélectionné :

| Propriété | Description |
|---|---|
| **Contenu** | Texte affiché ou variable (ex: `{{nom_complet}}`) |
| **Police** | Famille de police (Inter, Outfit, Cinzel, Playfair...) |
| **Taille** | Taille en points |
| **Couleur** | Couleur du texte |
| **Gras / Italique** | Style typographique |
| **Alignement** | Gauche, Centre, Droite |

### Aperçu par étudiant

En bas du studio, un **sélecteur d'étudiant** permet de visualiser l'attestation avec les données réelles de chaque étudiant. Les variables `{{nom_complet}}`, `{{formation}}`, etc. sont remplacées en temps réel.

---

## 9. Étape 6 — Génération & Export

### Générer les attestations

1. Depuis le **Tableau de bord** ou le **Studio**, cliquez sur **"Générer les attestations"**
2. Sélectionnez les étudiants à inclure (tous ou une sélection)
3. Choisissez le format d'export :
   - **PDF individuel** : un fichier par étudiant
   - **ZIP groupé** : tous les PDFs dans une archive `.zip`
4. Cliquez sur **"Lancer la génération"**

### Qualité du PDF

Les attestations sont générées en **haute résolution (300 DPI équivalent)** pour une impression professionnelle sur format **A4 Paysage (297 × 210 mm)**.

### Nommage automatique des fichiers

Les fichiers sont nommés automatiquement selon le schéma :
```
attestation_[NOM]_[Prénom]_[Matricule].pdf
```

Exemple : `attestation_KOUAME_Jean-Baptiste_CERT-2026-001.pdf`

---

## 10. Étape 7 — Paramètres de l'établissement

Les paramètres définissent les informations de votre institution, utilisées dans les modèles et les en-têtes des attestations.

### Informations configurables

| Champ | Description |
|---|---|
| **Nom de l'établissement** | Affiché en haut de chaque attestation |
| **Adresse** | Adresse postale complète |
| **Téléphone** | Numéro de contact |
| **Email** | Email officiel de l'établissement |
| **Site web** | URL du site |
| **Slogan** | Devise ou accroche institutionnelle |
| **Nom du directeur** | Affiché dans la zone signature |
| **Signataires** | Personnes habilitées à signer (titre + nom) |

> 💡 Ces informations peuvent être utilisées dans les modèles avec les variables `{{etablissement}}`, `{{directeur}}`, etc.

---

## 11. Variables disponibles dans les modèles

Toutes ces variables sont remplacées automatiquement lors de la génération :

### Variables étudiant

| Variable | Exemple de valeur |
|---|---|
| `{{nom_complet}}` | Jean-Baptiste KOUAMÉ |
| `{{nom}}` | KOUAMÉ |
| `{{prenom}}` | Jean-Baptiste |
| `{{matricule}}` | CERT-2026-001 |
| `{{formation}}` | Développement Web & Intelligence Artificielle |
| `{{specialite}}` | Architecte Logiciel |
| `{{mention}}` | Très Bien avec Félicitations |
| `{{moyenne}}` | 18.5/20 |
| `{{rang}}` | 1er / 48 |
| `{{duree}}` | 600 heures |
| `{{annee}}` | 2026 |
| `{{annee_academique}}` | 2025-2026 |
| `{{date_obtention}}` | 15 Juin 2026 |
| `{{numero}}` | ATT-2026-001 |
| `{{email}}` | j.kouame@example.com |

### Comment insérer une variable dans le studio

1. Dans la **Bibliothèque d'éléments**, dépliez la section **Variables**
2. Cliquez sur la variable souhaitée (ex: `{{nom_complet}}`)
3. Elle est ajoutée au centre du canvas, prête à être positionnée
4. Le texte affiché est remplacé dynamiquement selon l'étudiant sélectionné

---

## 12. Format du fichier Excel attendu

### Structure recommandée (première ligne = en-têtes)

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| nom | prenom | formation | note | mention | date_obtention | email |
| KOUAMÉ | Jean-Baptiste | Dev Web | 18.5 | Très Bien | 15/06/2026 | j.k@ex.com |
| BERNARD | Sophie | Dev Web | 17.2 | Très Bien | 15/06/2026 | s.b@ex.com |

### Règles importantes

- ✅ La **première ligne** doit contenir les en-têtes de colonnes
- ✅ Les colonnes peuvent être dans **n'importe quel ordre**
- ✅ Les noms de colonnes sont **insensibles à la casse** (`NOM` = `nom` = `Nom`)
- ✅ Les colonnes non reconnues sont ignorées (sans erreur)
- ❌ Ne pas laisser de lignes vides entre les données
- ❌ Ne pas fusionner des cellules dans la plage de données

### Modèle Excel à télécharger

Un fichier modèle `.xlsx` sera bientôt disponible dans la section **Import** de l'application.

---

## 13. Questions fréquentes (FAQ)

**❓ Mes données sont-elles envoyées sur Internet ?**
> Non. CertiFlow fonctionne entièrement **dans votre navigateur**. Aucune donnée n'est envoyée vers un serveur externe. Tout est traité localement.

---

**❓ Puis-je utiliser mes propres polices de caractères ?**
> Actuellement, CertiFlow inclut les polices Google Fonts suivantes : Inter, Outfit, Cinzel, Playfair Display. Le support de polices personnalisées est prévu dans une future version.

---

**❓ Les attestations générées sont-elles imprimables ?**
> Oui. Les PDFs sont générés en format A4 Paysage avec une résolution adaptée à l'impression professionnelle. Réglez votre imprimante sur **A4 Paysage, sans marges**.

---

**❓ Mon fichier Excel n'est pas reconnu, que faire ?**
> Vérifiez que :
> 1. Le fichier est au format `.xlsx` (et non `.xls` ancien format ou `.ods`)
> 2. La première ligne contient bien les en-têtes
> 3. Il n'y a pas de colonnes entièrement fusionnées
> Si le problème persiste, exportez votre fichier en `.csv` depuis Excel (Fichier → Enregistrer sous → CSV UTF-8).

---

**❓ Comment exporter un seul étudiant ?**
> Dans le studio, sélectionnez l'étudiant dans le sélecteur en bas, puis cliquez sur **"Exporter ce PDF"**. Vous obtiendrez uniquement l'attestation de cet étudiant.

---

**❓ Les modèles sont perdus après un rechargement, que faire ?**
> Allez dans l'onglet **Modèles** et cliquez sur **"✦ Recharger Modèles Prestige"**. Cela restaure les modèles officiels de démonstration.

---

**❓ Puis-je utiliser CertiFlow hors ligne ?**
> Oui, une fois la page chargée, CertiFlow fonctionne sans connexion Internet (les polices Google Fonts nécessitent une connexion pour le premier chargement).

---

*Manuel rédigé pour CertiFlow V1 — Août 2026*
*Pour toute question, ouvrez une Issue sur [GitHub](https://github.com/KARIS747/CERTIFLOW/issues).*
