import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '../../store/useProjectStore';
import { useUIStore } from '../../store/useUIStore';
import { useTheme } from '../../lib/useTheme';
import { 
  PlusCircle, 
  Search, 
  FileSpreadsheet, 
  Trash2, 
  FolderOpen, 
  Edit2, 
  Users, 
  Clock, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { EmptyState } from '../../components/common/EmptyState';
import { formatDate } from '../../lib/utils';
import { toast } from 'sonner';

export const ProjectsView: React.FC = () => {
  const { projects, setActiveProjectId, createProject, deleteProject, updateProject, loadDemoProject } = useProjectStore();
  const { setActiveTab } = useUIStore();
  const { isLight, t } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const proj = createProject(newProjectName, newProjectDesc);
    setIsModalOpen(false);
    setNewProjectName('');
    setNewProjectDesc('');
    setActiveTab('import');
    toast.success(`Projet "${proj.name}" créé avec succès !`);
  };

  const handleSelect = (id: string) => {
    setActiveProjectId(id);
    setActiveTab('import');
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${name}" ?`)) {
      deleteProject(id);
      toast.success('Projet supprimé.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold font-outfit tracking-tight flex items-center gap-2 ${t.textPrimary}`}>
            <FileSpreadsheet className="w-6 h-6 text-indigo-500" />
            Gestion des Projets
          </h1>
          <p className={`text-xs ${t.textSecondary}`}>
            Créez ou gérez vos sessions de génération d'attestations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              loadDemoProject();
              setActiveTab('editor');
              toast.success('Projet démo chargé !');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              isLight
                ? 'text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100'
                : 'text-amber-300 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Charger Démo
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Nouveau Projet
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${t.textMuted}`} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un projet par nom ou description..."
          className={`w-full text-xs rounded-xl pl-10 pr-4 py-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
            isLight
              ? 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 shadow-sm'
              : 'bg-slate-900/80 border-slate-800 text-slate-200 placeholder:text-slate-500'
          }`}
        />
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title={searchTerm ? 'Aucun résultat' : 'Aucun projet créé'}
          description={
            searchTerm
              ? `Aucun projet ne correspond à "${searchTerm}"`
              : 'Commencez par créer votre premier projet ou chargez des données de démo.'
          }
          actionLabel="+ Créer un Projet"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((proj) => (
            <motion.div
              key={proj.id}
              whileHover={{ y: -4 }}
              onClick={() => handleSelect(proj.id)}
              className={`group cursor-pointer p-6 rounded-2xl border transition-all duration-300 shadow-md flex flex-col justify-between ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-indigo-100'
                  : 'bg-slate-900/60 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 group-hover:scale-105 transition-transform">
                    <FolderOpen className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleDelete(e, proj.id, proj.name)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isLight
                          ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                          : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'
                      }`}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className={`font-bold text-base group-hover:text-indigo-500 mb-1 line-clamp-1 ${t.textPrimary}`}>
                  {proj.name}
                </h3>
                <p className={`text-xs line-clamp-2 mb-4 h-8 ${t.textSecondary}`}>
                  {proj.description || 'Aucune description'}
                </p>
              </div>

              <div className={`pt-4 border-t space-y-2 ${t.border}`}>
                <div className="flex items-center justify-between text-xs">
                  <span className={`flex items-center gap-1 font-medium ${t.textPrimary}`}>
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    {proj.students.length} étudiant{proj.students.length > 1 ? 's' : ''}
                  </span>
                  <span className={`flex items-center gap-1 text-[11px] ${t.textMuted}`}>
                    <Clock className="w-3 h-3" />
                    {formatDate(proj.updatedAt)}
                  </span>
                </div>

                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`}>
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: proj.students.length > 0 ? '100%' : '20%',
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-md border rounded-3xl p-6 shadow-2xl space-y-4 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-900'
                : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className={`flex items-center justify-between pb-3 border-b ${t.border}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${t.textPrimary}`}>
                <PlusCircle className="w-5 h-5 text-indigo-500" />
                Nouveau Projet
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className={`p-1.5 rounded-lg transition-colors ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                  Nom du projet *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="ex: Promotion Informatique 2026"
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      : 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                  Description (Optionnelle)
                </label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="ex: Attestations de réussite pour les étudiants de fin d'année..."
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isLight
                      ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder:text-slate-400'
                      : 'bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    isLight ? 'text-slate-600 hover:bg-slate-100' : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
                >
                  Créer et Importer
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
