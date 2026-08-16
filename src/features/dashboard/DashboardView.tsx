import React from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '../../store/useProjectStore';
import { useEstablishmentStore } from '../../store/useEstablishmentStore';
import { useUIStore } from '../../store/useUIStore';
import { useTheme } from '../../lib/useTheme';
import {
  PlusCircle,
  FileSpreadsheet,
  Sparkles,
  ArrowRight,
  Users,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';

const STATUS_META: Record<string, { label: string; className: string }> = {
  draft: { label: 'Brouillon', className: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
  configured: { label: 'Configuré', className: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/25' },
  ready: { label: 'Prêt', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/25' },
  generated: { label: 'Généré', className: 'bg-amber-500/10 text-amber-500 border-amber-500/25' },
};

export const DashboardView: React.FC = () => {
  const { projects, setActiveProjectId, createProject, loadDemoProject } = useProjectStore();
  const { establishment } = useEstablishmentStore();
  const { setActiveTab } = useUIStore();
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

  const totalStudents = projects.reduce((acc, p) => acc + (p.students?.length || 0), 0);
  const establishmentIncomplete = !establishment.directorName;

  return (
    <div className="space-y-6 pb-12">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-extrabold font-outfit tracking-tight">
            Tableau de bord
          </h1>
          <p className={`text-xs flex items-center gap-1.5 ${t.textSecondary}`}>
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            {establishment.name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {projects.length === 0 && (
            <button
              onClick={handleOpenDemo}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs border transition-all duration-200 active:scale-95 ${
                isLight
                  ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-amber-300 border-amber-500/30'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Charger la démo
            </button>
          )}
          <button
            onClick={handleNewProject}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau Projet
          </button>
        </div>
      </div>

      {/* Establishment Alert */}
      {establishmentIncomplete && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex flex-wrap items-center gap-3 px-4 py-3 rounded-2xl border ${
            isLight
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-amber-500/10 border-amber-500/25 text-amber-200'
          }`}
        >
          <AlertTriangle className={`w-4 h-4 shrink-0 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
          <p className={`text-xs flex-1 min-w-[200px] ${isLight ? 'text-amber-700' : 'text-amber-200/80'}`}>
            Profil établissement incomplet : ajoutez le nom du directeur pour signer vos attestations.
          </p>
          <button
            onClick={() => setActiveTab('settings')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
              isLight
                ? 'bg-white hover:bg-amber-100 text-amber-700 border-amber-300'
                : 'bg-slate-900/60 hover:bg-slate-800 text-amber-300 border-amber-500/30'
            }`}
          >
            Configurer
          </button>
        </motion.div>
      )}

      {/* Recent Projects */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-base font-bold font-outfit flex items-center gap-2 ${t.textPrimary}`}>
              <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
              Projets récents
            </h2>
            <p className={`text-xs ${t.textSecondary}`}>
              {projects.length > 0
                ? `${projects.length} projet${projects.length > 1 ? 's' : ''} • ${totalStudents} étudiant${totalStudents > 1 ? 's' : ''}`
                : 'Aucun projet pour le moment'}
            </p>
          </div>
          {projects.length > 0 && (
            <button
              onClick={() => setActiveTab('projects')}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 transition-colors"
            >
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <EmptyState
            icon={FileSpreadsheet}
            title="Commencez votre premier projet"
            description="Importez une liste d'étudiants Excel, choisissez un modèle, et générez toutes vos attestations en quelques clics."
            actionLabel="+ Créer un Projet"
            onAction={handleNewProject}
            secondaryActionLabel="Charger la Démo"
            onSecondaryAction={handleOpenDemo}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-2xl border shadow-md overflow-hidden ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            {projects.slice(0, 5).map((proj, idx) => {
              const status = STATUS_META[proj.status] || STATUS_META.draft;
              return (
                <button
                  key={proj.id}
                  onClick={() => handleOpenProject(proj.id)}
                  className={`group w-full flex items-center gap-3 sm:gap-4 px-4 py-3 text-left transition-colors hover:bg-indigo-500/5 ${
                    idx > 0 ? (isLight ? 'border-t border-slate-100' : 'border-t border-slate-800/60') : ''
                  }`}
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-xs truncate ${t.textPrimary}`}>{proj.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${status.className}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-xs flex items-center gap-1 ${t.textSecondary}`}>
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {proj.students.length}
                    </span>
                    <span className={`text-[11px] hidden md:inline ${t.textMuted}`}>
                      {formatDate(proj.updatedAt)}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default DashboardView;
