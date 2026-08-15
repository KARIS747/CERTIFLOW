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
  ChevronRight,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { toast } from 'sonner';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, setShowOnboardingModal, theme, setTheme } = useUIStore();
  const { activeProject, projects, setActiveProjectId, createProject, loadDemoProject } = useProjectStore();

  const isLight = theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  const handleCreateNewProject = () => {
    createProject('Nouveau Projet Attestations');
    setActiveTab('import');
    toast.success('Nouveau projet créé ! Importez maintenant votre fichier Excel.');
  };

  const handleLoadDemo = () => {
    loadDemoProject();
    setActiveTab('editor');
    toast.success('Projet de démonstration chargé avec 10 étudiants !');
  };

  const cycleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
      toast.success('Mode clair activé ☀️');
    } else if (theme === 'light') {
      setTheme('system');
      toast.success('Thème système activé 🖥️');
    } else {
      setTheme('dark');
      toast.success('Mode sombre activé 🌙');
    }
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor;
  const themeLabel = theme === 'dark' ? 'Sombre' : theme === 'light' ? 'Clair' : 'Système';

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-3 transition-all duration-300 ${
      isLight
        ? 'bg-white/90 border-slate-200/80 shadow-sm shadow-slate-200'
        : 'bg-slate-900/80 border-slate-800/80'
    }`}>
      <div className="w-full max-w-[1800px] mx-auto flex items-center justify-between gap-4">

        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center ${isLight ? 'bg-white' : 'bg-slate-950'}`}>
                <GraduationCap className="w-5 h-5 text-indigo-500 group-hover:rotate-6 transition-transform duration-300" />
              </div>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-outfit font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent">
                  CertiFlow
                </span>
                <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  V1.0 PRO
                </span>
              </div>
              <p className={`text-[11px] font-medium hidden sm:block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Génération Automatisée d'Attestations
              </p>
            </div>
          </button>

          {/* Active Project Selector */}
          {activeProject && (
            <div className={`hidden xl:flex items-center gap-2 pl-4 border-l ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
              <ChevronRight className={`w-4 h-4 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} />
              <div className="relative">
                <select
                  value={activeProject.id}
                  onChange={(e) => setActiveProjectId(e.target.value)}
                  className={`text-xs font-medium rounded-lg px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer pr-7 appearance-none ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                  }`}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.students.length} étudiants)
                    </option>
                  ))}
                </select>
                <FolderOpen className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
              </div>
            </div>
          )}
        </div>

        {/* Center: Navigation Tabs */}
        <nav className={`hidden lg:flex items-center gap-1 p-1 rounded-xl border ${
          isLight
            ? 'bg-slate-100/80 border-slate-200'
            : 'bg-slate-950/60 border-slate-800/80'
        }`}>
          <NavTab isLight={isLight} active={activeTab === 'home'}      onClick={() => setActiveTab('home')}      icon={<Layout className="w-4 h-4" />}          label="Accueil" />
          <NavTab isLight={isLight} active={activeTab === 'projects'}  onClick={() => setActiveTab('projects')}  icon={<Layers className="w-4 h-4" />}          label="Projets" />
          <NavTab isLight={isLight} active={activeTab === 'import'}    onClick={() => setActiveTab('import')}    icon={<FileSpreadsheet className="w-4 h-4" />}  label="Import Excel"
            badge={activeProject?.students.length ? `${activeProject.students.length}` : undefined}
          />
          <NavTab isLight={isLight} active={activeTab === 'editor'}    onClick={() => setActiveTab('editor')}    icon={<Sparkles className="w-4 h-4" />}        label="Éditeur" />
          <NavTab isLight={isLight} active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon={<Layout className="w-4 h-4" />}          label="Modèles" />
          <NavTab isLight={isLight} active={activeTab === 'settings'}  onClick={() => setActiveTab('settings')}  icon={<Settings className="w-4 h-4" />}        label="Paramètres" />
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          {/* Demo button */}
          <button
            onClick={handleLoadDemo}
            className="hidden min-[1700px]:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all duration-200"
            title="Charger un jeu de données de test avec 10 étudiants"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            Démo (1Click)
          </button>

          {/* New Project */}
          <button
            onClick={handleCreateNewProject}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-md shadow-indigo-600/25 active:scale-[0.98] transition-all duration-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Nouveau Projet</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={cycleTheme}
            title={`Thème : ${themeLabel} — cliquer pour changer`}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all duration-200 group ${
              isLight
                ? 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200 hover:border-slate-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600'
            }`}
          >
            <ThemeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{themeLabel}</span>
          </button>

          {/* Help */}
          <button
            onClick={() => setShowOnboardingModal(true)}
            className={`p-2 rounded-xl transition-colors ${
              isLight
                ? 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
            }`}
            title="Guide & Tutoriel Rapide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

/* ── NavTab Component ── */
interface NavTabProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: string;
  isLight: boolean;
}

const NavTab: React.FC<NavTabProps> = ({ active, onClick, icon, label, badge, isLight }) => (
  <button
    onClick={onClick}
    title={label}
    className={`relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
      active
        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
        : isLight
          ? 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/80'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
    }`}
  >
    {icon}
    <span className="hidden 2xl:inline">{label}</span>
    {badge && (
      <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${
        active
          ? 'bg-white/20 text-white'
          : isLight
            ? 'bg-slate-200 text-indigo-600 border border-indigo-400/30'
            : 'bg-slate-800 text-indigo-400 border border-indigo-500/30'
      }`}>
        {badge}
      </span>
    )}
  </button>
);
