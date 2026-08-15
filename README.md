# 🎓 CertiFlow - Générateur Automatisé d'Attestations & Certificats

> **Logiciel professionnel desktop/web autonome de génération massive d'attestations et certificats de formation à partir de fichiers Excel.**

---

## 🌟 Fonctionnalités Principales

- ⚡ **Workflow Intuitif en 7 Étapes** : Importation Excel ➔ Mapping des colonnes ➔ Choix du Modèle ➔ Édition Studio ➔ Aperçu Étudiant ➔ Génération PDF HD ➔ Export ZIP.
- 🎨 **Éditeur Visuel Studio Canvas (Fabric.js)** : Rendu vectoriel A4 Paysage (297×210 mm) avec insertion de textes, cadres dorés, logos, cachets et signatures électroniques.
- 🔄 **Variables Dynamiques** : Remplacement instantané des balises `{{nom_complet}}`, `{{formation}}`, `{{moyenne}}`, `{{mention}}`, `{{numero}}` en temps réel.
- 📊 **Importation Excel & CSV (SheetJS)** : Détection automatique des colonnes, aperçu sous forme de tableau, validation des anomalies.
- 🔢 **Numérotation Automatique Configurable** : Préfixe personnalisable (`ATT-2026-001`, `CERT-2026-002`, etc.).
- 📦 **Génération HD & Archive ZIP** : Export multi-étudiants en haute résolution sans blocage de l'interface, téléchargement ZIP en 1 clic et confetti de célébration.
- 🔒 **100% Autonome & Hors Ligne** : Vos données restent confidentielles sur votre machine.

---

## 🚀 Prise en Main Rapide

### 1. Démarrage du projet en mode Développement
```bash
npm run dev
```

### 2. Tester avec les Données de Démonstration (1Click)
1. Lancez l'application.
2. Cliquez sur le bouton **"Démo (1Click)"** ou **"Essayer avec la Démo"** dans le bandeau d'accueil.
3. Un jeu de données de **10 étudiants fictifs** est automatiquement chargé.
4. Accédez au **Studio Canvas** pour apercevoir la génération dynamique des attestations.
5. Cliquez sur **"Générer"** pour télécharger l'archive ZIP complète.

---

## 🛠️ Stack Technique

- **Desktop Framework** : Tauri 2 (`src-tauri` Rust)
- **Frontend** : React 18, TypeScript, Vite
- **Styling & Theme** : Tailwind CSS, Glassmorphism, animations Framer Motion
- **Notifications** : Sonner (Toasts interactifs)
- **Studio Graphique** : Fabric.js (Canvas interactif A4)
- **Parsing & PDF** : SheetJS (`xlsx`), `jsPDF`, `jszip`
- **Gestion d'état** : Zustand avec persistance locale (`IndexedDB` / `localStorage`)
