<div align="center">

# 🎓 CertiFlow

### Générateur Automatisé d'Attestations & Certificats Académiques

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

*Créez, personnalisez et générez des centaines d'attestations professionnelles en quelques clics.*

</div>

---

## ✨ Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 📥 **Import Excel / CSV** | Importez votre liste d'étudiants depuis un fichier `.xlsx` ou `.csv` |
| 🎨 **Studio Visuel** | Éditeur canvas interactif (Fabric.js) avec zoom, glisser-déposer et inspecteur de propriétés |
| 🔤 **Variables Dynamiques** | Substitution automatique des champs `{{nom_complet}}`, `{{formation}}`, `{{mention}}`, etc. |
| 📄 **Export PDF** | Génération PDF haute résolution (jsPDF) — un par étudiant ou tout en ZIP |
| 🏛️ **Modèles Prestige** | Modèles royaux prêts à l'emploi (Or & Marine, Moderne Cyan) |
| ✅ **Validation des données** | Détection automatique des anomalies (champs manquants, notes invalides) |
| 🔔 **Notifications** | Feedback visuel en temps réel (Sonner toasts + animations Framer Motion) |
| 💾 **Persistance locale** | Projets et modèles sauvegardés dans le navigateur (Zustand + localStorage) |

---

## 🚀 Installation & Démarrage

### Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/KARIS747/CERTIFLOW.git
cd CERTIFLOW

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur **http://localhost:1420**

### Build production

```bash
npm run build
```

---

## 🗂️ Structure du projet

```
CERTIFLOW/
├── src/
│   ├── components/
│   │   ├── common/         # EmptyState, StepIndicator
│   │   └── layout/         # Navbar principale
│   ├── features/
│   │   ├── dashboard/      # Vue tableau de bord
│   │   ├── editor/         # StudioCanvasEditor (Fabric.js)
│   │   ├── import/         # Import Excel/CSV
│   │   ├── onboarding/     # Modal de bienvenue
│   │   ├── projects/       # Gestion des projets
│   │   ├── settings/       # Paramètres établissement
│   │   └── templates/      # Galerie de modèles
│   ├── lib/
│   │   ├── excelParser.ts  # Parsing SheetJS + validation Zod
│   │   ├── pdfGenerator.ts # Génération jsPDF + JSZip
│   │   ├── sampleData.ts   # Données & modèles de démonstration
│   │   └── utils.ts        # Utilitaires
│   ├── store/              # Zustand stores (projet, templates, UI)
│   ├── types/              # Types TypeScript (Student, Template, etc.)
│   ├── App.tsx             # Routing & layout principal
│   └── main.tsx            # Point d'entrée React
├── src-tauri/              # Configuration Tauri (app desktop future)
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🛠️ Stack Technique

| Domaine | Technologie |
|---|---|
| Framework UI | React 18 + TypeScript |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS 3 + CSS Variables |
| Animations | Framer Motion |
| Canvas Editor | Fabric.js 5 |
| State Management | Zustand (+ persist middleware) |
| Notifications | Sonner |
| Import Excel | SheetJS (xlsx) |
| Export PDF | jsPDF |
| Export ZIP | JSZip |
| Validation | Zod |
| Icons | Lucide React |

---

## 📋 Variables de modèle disponibles

Les modèles utilisent des variables au format `{{variable}}` :

| Variable | Description |
|---|---|
| `{{nom_complet}}` | Nom et prénom complets de l'étudiant |
| `{{nom}}` | Nom de famille |
| `{{prenom}}` | Prénom |
| `{{formation}}` | Intitulé de la formation |
| `{{specialite}}` | Spécialité ou parcours |
| `{{mention}}` | Mention obtenue (Très Bien, Bien, etc.) |
| `{{moyenne}}` | Moyenne générale (ex: 17.5/20) |
| `{{rang}}` | Classement (ex: 3ème / 48) |
| `{{duree}}` | Durée de la formation (ex: 600 heures) |
| `{{date_obtention}}` | Date de délivrance du certificat |
| `{{annee_academique}}` | Année académique (ex: 2025-2026) |
| `{{matricule}}` | Numéro de matricule étudiant |
| `{{numero}}` | Numéro d'attestation unique |

---

## 📖 Documentation

Consultez le **[Manuel Utilisateur](MANUEL_UTILISATEUR.md)** pour un guide complet pas à pas.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une **Issue** ou une **Pull Request**.

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m 'feat: ajout de ma fonctionnalité'`)
4. Pushez sur la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

---

## 📄 Licence

Ce projet est distribué sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">

Fait avec ❤️ pour les établissements d'enseignement supérieur

**[Star ce projet sur GitHub](https://github.com/KARIS747/CERTIFLOW)**

</div>
