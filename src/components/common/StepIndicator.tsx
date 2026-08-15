import React from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  Layout, 
  Edit3, 
  Eye, 
  Cpu, 
  Download 
} from 'lucide-react';
import { useUIStore, MainTab } from '../../store/useUIStore';
import { useTheme } from '../../lib/useTheme';

interface Step {
  id: number;
  title: string;
  tab: MainTab;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { id: 1, title: '1. Import Excel', tab: 'import', icon: <FileSpreadsheet className="w-3.5 h-3.5" /> },
  { id: 2, title: '2. Mapping', tab: 'import', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  { id: 3, title: '3. Modèle', tab: 'templates', icon: <Layout className="w-3.5 h-3.5" /> },
  { id: 4, title: '4. Éditeur Studio', tab: 'editor', icon: <Edit3 className="w-3.5 h-3.5" /> },
  { id: 5, title: '5. Aperçu & Test', tab: 'editor', icon: <Eye className="w-3.5 h-3.5" /> },
  { id: 6, title: '6. Génération', tab: 'editor', icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: 7, title: '7. Export ZIP', tab: 'editor', icon: <Download className="w-3.5 h-3.5" /> },
];

interface StepIndicatorProps {
  currentStep: number;
  onSelectStep?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onSelectStep }) => {
  const { setActiveTab } = useUIStore();
  const { isLight } = useTheme();

  const handleStepClick = (step: Step) => {
    setActiveTab(step.tab);
    if (onSelectStep) onSelectStep(step.id);
  };

  return (
    <div className={`w-full rounded-2xl p-3 shadow-sm my-4 border ${
      isLight ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
    }`}>
      <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => handleStepClick(step)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30 scale-105'
                    : isCompleted
                    ? isLight
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                      : 'bg-slate-800/80 text-emerald-400 border border-emerald-500/30 hover:bg-slate-800'
                    : isLight
                      ? 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-white text-indigo-600'
                      : isCompleted
                      ? isLight ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
                      : isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.id}
                </div>
                <span>{step.title}</span>
              </button>

              {idx < STEPS.length - 1 && (
                <div
                  className={`h-0.5 min-w-[12px] flex-1 rounded-full transition-colors ${
                    isCompleted ? 'bg-emerald-500/40' : isLight ? 'bg-slate-200' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
