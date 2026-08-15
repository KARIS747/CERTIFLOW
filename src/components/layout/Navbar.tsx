import React from 'react';
import { useUIStore, MainTab } from '../../store/useUIStore';
import { useProjectStore } from '../../store/useProjectStore';
import { 
  FileSpreadsheet, 
  Layout, 
  Sparkles, 
  PlusCircle, 
  Settings, 
  GraduationCap, 
  Layers, 
  HelpCircle,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, setShowOnboardingModal } = useUIStore();
  const { activeProject, projects, setActiveProjectId, createProject, loadDemoProject } = useProjectStore();

  const handleCreateNewProject = () => {
    const proj = createProject('Nouveau Projet Attestations');
    setActiveTab('import');
    toast.success('Nouveau projet créé ! Importez maintenant votre fichier Excel.');
  };

  const handleLoadDemo = () => {
    loadDemoProject();
    setActiveTab('editor');
    toast.success('Projet de démonstration chargé avec 10 étudiants !');
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-6 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400 group-hover:rotate-6 transition-transform duration-300" />
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-outfit font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  CertiFlow
                </span>
                <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  V1.0 PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Génération Automatisée d'Attestations
              </p>
            </div>
          </button>

          {/* Active Project Dropdown Pill */}
          {activeProject && (
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-slate-800">
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <div className="relative group">
                <select
                  value={activeProject.id}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-medium rounded-lg px-3 py-1.5 border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer pr-7 appearance-none"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                      {p.name} ({p.students.length} étudiants)
                    </option>
                  ))}
                </select>
                <FolderOpen className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Center: Main Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
          <NavTab 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={<Layout className="w-4 h-4" />}
            label="Accueil"
          />
          <NavTab 
            active={activeTab === 'projects'} 
            onClick={() => setActiveTab('projects')} 
            icon={<Layers className="w-4 h-4" />}
            label="Projets"
          />
          <NavTab 
            active={activeTab === 'import'} 
            onClick={() => setActiveTab('import')} 
            icon={<FileSpreadsheet className="w-4 h-4" />}
            label="Import Excel"
            badge={activeProject?.students.length ? `${activeProject.students.length}` : undefined}
          />
          <NavTab 
            active={activeTab === 'editor'} 
            onClick={() => setActiveTab('editor')} 
            icon={<Sparkles className="w-4 h-4" />}
            label="Éditeur Attestation"
          />
          <NavTab 
            active={activeTab === 'templates'} 
            onClick={() => setActiveTab('templates')} 
            icon={<Layout className="w-4 h-4" />}
            label="Modèles"
          />
          <NavTab 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<Settings className="w-4 h-4" />}
            label="Paramètres"
          />
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadDemo}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-200"
            title="Charger un jeu de données de test avec 10 étudiants"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Démo (1Click)
          </button>

          <button
            onClick={handleCreateNewProject}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 active:scale-[0.98] transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Projet</span>
          </button>

          <button
            onClick={() => setShowOnboardingModal(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
            title="Guide & Tutoriel Rapide"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};

interface NavTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
}

const NavTab: React.FC<NavTabProps> = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
      active
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`}
  >
    {icon}
    <span>{label}</span>
    {badge && (
      <span
        className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${
          active ? 'bg-white/20 text-white' : 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
        }`}
      >
        {badge}
      </span>
    )}
  </button>
);
