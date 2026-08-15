import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { useProjectStore } from '../../store/useProjectStore';
import { 
  Sparkles, 
  FileSpreadsheet, 
  Layout, 
  Cpu, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  ArrowLeft 
} from 'lucide-react';
import { toast } from 'sonner';

export const OnboardingModal: React.FC = () => {
  const { showOnboardingModal, setShowOnboardingModal, setIsOnboardingCompleted, setActiveTab } = useUIStore();
  const { loadDemoProject } = useProjectStore();
  const [currentStep, setCurrentStep] = useState(0);

  if (!showOnboardingModal) return null;

  const onboardingSteps = [
    {
      title: 'Bienvenue dans CertiFlow 👋',
      subtitle: 'La solution professionnelle autonome de génération d\'attestations et certificats en masse.',
      icon: <Sparkles className="w-10 h-10 text-indigo-400" />,
      content: (
        <div className="space-y-4 text-slate-300 text-sm">
          <p>
            CertiFlow transforme vos listes d'étudiants sous Excel en <strong>centaines de documents PDF personnalisés haute définition</strong> en quelques clics.
          </p>
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200">
            ✨ <strong>100% Autonome & Hors Ligne</strong> : Vos données et listes d'étudiants ne quittent jamais votre ordinateur.
          </div>
        </div>
      ),
    },
    {
      title: 'Étape 1 : Importez votre fichier Excel',
      subtitle: 'Chargez simplement vos fichiers .XLSX ou .CSV',
      icon: <FileSpreadsheet className="w-10 h-10 text-emerald-400" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            Importez votre fichier contenant les noms, prénoms, notes et mentions.
          </p>
          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Détection automatique des en-têtes de colonnes.
            </li>
            <li className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mapping intelligent vers les variables <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">{"{{nom_complet}}"}</code>.
            </li>
            <li className="flex items-center gap-2 text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Validation instantanée des erreurs ou données manquantes.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Étape 2 : Personnalisez le Studio Graphique',
      subtitle: 'Concevez vos modèles d\'attestation A4 Paysage',
      icon: <Layout className="w-10 h-10 text-amber-400" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            Utilisez l'éditeur visuel Canvas Fabric.js pour positionner le texte, insérer des variables dynamiques, importer le logo de votre établissement et apposer des signatures électroniques.
          </p>
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-amber-300">
            🎨 Prévisualisez le rendu final en temps réel avec n'importe quel étudiant de votre liste !
          </div>
        </div>
      ),
    },
    {
      title: 'Étape 3 : Génération HD & Export ZIP',
      subtitle: 'Produisez 500+ attestations sans ralentissement',
      icon: <Cpu className="w-10 h-10 text-cyan-400" />,
      content: (
        <div className="space-y-3 text-slate-300 text-sm">
          <p>
            Lancez la génération en masse. Une file de traitement ultra-rapide crée chaque PDF avec numérotation automatique et empaquète le tout dans une archive ZIP téléchargeable.
          </p>
        </div>
      ),
    },
  ];

  const handleFinish = (loadDemo: boolean = false) => {
    setIsOnboardingCompleted(true);
    setShowOnboardingModal(false);
    if (loadDemo) {
      loadDemoProject();
      setActiveTab('editor');
      toast.success('Données de démonstration chargées ! Bienvenue dans CertiFlow.');
    } else {
      setActiveTab('import');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={() => handleFinish(false)}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Step Content */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-inner">
              {onboardingSteps[currentStep].icon}
            </div>
            <div>
              <h2 className="text-xl font-bold font-outfit text-white">
                {onboardingSteps[currentStep].title}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {onboardingSteps[currentStep].subtitle}
              </p>
            </div>
          </div>

          <div className="min-h-[140px] mb-6">
            {onboardingSteps[currentStep].content}
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              {onboardingSteps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentStep
                      ? 'w-7 bg-indigo-500'
                      : 'w-2 bg-slate-800'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Précédent
                </button>
              )}

              {currentStep < onboardingSteps.length - 1 ? (
                <button
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                >
                  Suivant <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFinish(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    Essayer avec la Démo
                  </button>
                  <button
                    onClick={() => handleFinish(false)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/30"
                  >
                    Démarrer
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
