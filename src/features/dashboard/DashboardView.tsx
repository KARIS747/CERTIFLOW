import React from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '../../store/useProjectStore';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useEstablishmentStore } from '../../store/useEstablishmentStore';
import { useUIStore } from '../../store/useUIStore';
import { useTheme } from '../../lib/useTheme';
import { 
  PlusCircle, 
  FileSpreadsheet, 
  Sparkles, 
  Users, 
  FileText, 
  ArrowRight, 
  Clock, 
  Building2, 
  Layers, 
  CheckCircle2
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';

export const DashboardView: React.FC = () => {
  const { projects, setActiveProjectId, createProject, loadDemoProject } = useProjectStore();
  const { templates, setActiveTemplateId } = useTemplateStore();
  const { establishment } = useEstablishmentStore();
  const { setActiveTab, setShowOnboardingModal } = useUIStore();
  const { isLight, t } = useTheme();

  const handleNewProject = () => {
    const proj = createProject('Nouveau Projet Attestations');
    setActiveTab('import');
    toast.success('Projet créé avec succès ! Importez votre fichier Excel.');
  };

  const handleOpenProject = (id: string) => {
    setActiveProjectId(id);
    setActiveTab('import');
  };

  const handleOpenDemo = () => {
    loadDemoProject();
    setActiveTab('editor');
    toast.success('Données de démonstration chargées !');
  };

  const totalStudentsGenerated = projects.reduce((acc, p) => acc + (p.students?.length || 0), 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-500/20 p-8 shadow-2xl"
      >
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Bonjour 👋
              </span>
              <span className="text-xs text-slate-400">
                {establishment.name}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white tracking-tight leading-tight">
              Bienvenue sur <span className="bg-gradient-to-r from-indigo-400 via-indigo-200 to-amber-300 bg-clip-text text-transparent">CertiFlow</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Générez et automatisez vos attestations et certificats de formation en masse à partir de vos fichiers Excel.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleNewProject}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              Nouveau Projet
            </button>
            <button
              onClick={handleOpenDemo}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-xs border shadow-lg transition-all duration-200 active:scale-95 ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-amber-300 border-amber-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              Charger la Démo (10 étudiants)
            </button>
          </div>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard isLight={isLight}
          icon={<Layers className="w-5 h-5 text-indigo-500" />}
          label="Projets Actifs"
          value={`${projects.length}`}
          subtext="Enregistrés localement"
        />
        <MetricCard isLight={isLight}
          icon={<Users className="w-5 h-5 text-emerald-500" />}
          label="Étudiants Importés"
          value={`${totalStudentsGenerated}`}
          subtext="Prêts pour génération"
        />
        <MetricCard isLight={isLight}
          icon={<FileText className="w-5 h-5 text-amber-500" />}
          label="Modèles Disponibles"
          value={`${templates.length}`}
          subtext="Design A4 Paysage"
        />
        <MetricCard isLight={isLight}
          icon={<Building2 className="w-5 h-5 text-cyan-500" />}
          label="Établissement"
          value={establishment.directorName ? 'Profil Configuré' : 'À Compléter'}
          subtext={establishment.name.slice(0, 24) + '...'}
        />
      </div>

      {/* Main Grid: Recent Projects & Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold font-outfit flex items-center gap-2 ${t.textPrimary}`}>
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                Projets Récents
              </h2>
              <p className={`text-xs ${t.textSecondary}`}>Vos sessions de génération en cours ou terminées</p>
            </div>
            {projects.length > 0 && (
              <button
                onClick={() => setActiveTab('projects')}
                className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              >
                Voir tout ({projects.length}) <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="Aucun projet pour le moment"
              description="Créez votre premier projet de génération d'attestations ou essayez le mode démonstration avec 10 étudiants."
              actionLabel="+ Créer un Projet"
              onAction={handleNewProject}
              secondaryActionLabel="Charger la Démo"
              onSecondaryAction={handleOpenDemo}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((proj) => (
                <motion.div
                  key={proj.id}
                  whileHover={{ y: -3 }}
                  onClick={() => handleOpenProject(proj.id)}
                  className={`group cursor-pointer p-5 rounded-2xl border transition-all duration-300 shadow-md relative overflow-hidden ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-indigo-100'
                      : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 group-hover:scale-110 transition-transform">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${t.pill} border`}>
                      <Clock className="w-2.5 h-2.5 text-indigo-500" />
                      {formatDate(proj.updatedAt)}
                    </span>
                  </div>

                  <h3 className={`font-bold text-sm mb-1 line-clamp-1 transition-colors group-hover:text-indigo-500 ${t.textPrimary}`}>
                    {proj.name}
                  </h3>
                  <p className={`text-xs line-clamp-2 mb-4 h-8 ${t.textSecondary}`}>
                    {proj.description || 'Aucune description fournie'}
                  </p>

                  <div className={`flex items-center justify-between pt-3 border-t text-xs ${t.border} ${t.textSecondary}`}>
                    <span className={`flex items-center gap-1 font-medium ${t.textPrimary}`}>
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {proj.students.length} étudiant{proj.students.length > 1 ? 's' : ''}
                    </span>
                    <span className="text-indigo-500 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Ouvrir <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Templates Gallery Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold font-outfit flex items-center gap-2 ${t.textPrimary}`}>
                <Sparkles className="w-5 h-5 text-amber-500" />
                Modèles d'Attestation
              </h2>
              <p className={`text-xs ${t.textSecondary}`}>Designs prêts à l'emploi A4</p>
            </div>
            <button
              onClick={() => setActiveTab('templates')}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
            >
              Gérer <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {templates.slice(0, 3).map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => {
                  setActiveTemplateId(tmpl.id);
                  setActiveTab('editor');
                }}
                className={`group cursor-pointer p-4 rounded-2xl border transition-all duration-300 shadow-md flex items-center gap-4 ${
                  isLight
                    ? 'bg-white hover:bg-amber-50/50 border-slate-200 hover:border-amber-300'
                    : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-amber-500/30'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-amber-500 font-extrabold text-sm shrink-0 group-hover:scale-105 transition-transform ${
                  isLight ? 'bg-slate-100 border-slate-200' : 'bg-gradient-to-tr from-slate-800 to-slate-700 border-slate-700'
                }`}>
                  A4
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className={`text-xs font-bold truncate transition-colors group-hover:text-amber-600 ${t.textPrimary}`}>
                      {tmpl.name}
                    </h4>
                    {tmpl.isDefault && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                        Pro
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] truncate ${t.textSecondary}`}>
                    {tmpl.elements.length} éléments • {tmpl.orientation === 'landscape' ? 'Paysage' : 'Portrait'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Tip Box */}
          <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
            isLight
              ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-200'
          }`}>
            <div className={`flex items-center gap-2 font-semibold ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              Astuce Secrétariat
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-indigo-800' : 'text-slate-300'}`}>
              Insérez les balises comme <code className={`px-1 py-0.5 rounded font-mono text-amber-600 ${isLight ? 'bg-indigo-100' : 'bg-indigo-950'}`}>{`{{nom_complet}}`}</code> dans votre modèle. Elles seront automatiquement remplacées pour chaque étudiant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
  isLight: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, subtext, isLight }) => (
  <div className={`p-5 rounded-2xl border backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-200 ${
    isLight
      ? 'bg-white border-slate-200 hover:border-slate-300'
      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
  }`}>
    <div className="flex items-center justify-between mb-2">
      <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{label}</span>
      <div className={`p-2 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/80 border-slate-700'}`}>
        {icon}
      </div>
    </div>
    <div className={`text-2xl font-extrabold font-outfit tracking-tight mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
      {value}
    </div>
    <div className={`text-[11px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{subtext}</div>
  </div>
);
