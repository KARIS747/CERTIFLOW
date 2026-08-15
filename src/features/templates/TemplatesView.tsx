import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useUIStore } from '../../store/useUIStore';
import { useTheme } from '../../lib/useTheme';
import { Template } from '../../types/template';
import { 
  Layout, 
  PlusCircle, 
  Copy, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Sparkles,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';

export const TemplatesView: React.FC = () => {
  const { templates, activeTemplateId, setActiveTemplateId, duplicateTemplate, deleteTemplate, addTemplate, resetTemplates } = useTemplateStore();
  const { setActiveTab } = useUIStore();
  const { isLight, t } = useTheme();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTemplates = templates.filter((t) =>
    filterCategory === 'all' ? true : t.category === filterCategory
  );

  const handleResetDefaults = () => {
    if (confirm('Voulez-vous recharger les modèles officiels Prestige Or & Marine ?')) {
      resetTemplates();
      toast.success('Modèles officiels Prestige rechargés avec succès !');
    }
  };

  const handleDuplicate = (id: string, name: string) => {
    duplicateTemplate(id);
    toast.success(`Modèle "${name}" dupliqué avec succès !`);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le modèle "${name}" ?`)) {
      deleteTemplate(id);
      toast.success('Modèle supprimé.');
    }
  };

  const handleCreateNewTemplate = () => {
    const newTmpl: Template = {
      id: `tmpl-${Date.now()}`,
      name: 'Nouveau Modèle Attestation A4',
      description: 'Modèle vierge personnalisé',
      category: 'attestation',
      pageSize: 'A4',
      orientation: 'landscape',
      dimensions: { width: 1123, height: 794 },
      elements: [
        {
          id: 'el-title-default',
          type: 'text',
          x: 560,
          y: 120,
          width: 800,
          height: 50,
          content: 'ATTESTATION DE RÉUSSITE',
          fontFamily: 'Outfit',
          fontSize: 34,
          fontWeight: 'bold',
          color: '#1e1b4b',
          textAlign: 'center',
        },
        {
          id: 'el-name-default',
          type: 'variable',
          variableName: '{{nom_complet}}',
          x: 560,
          y: 280,
          width: 800,
          height: 50,
          content: '{{nom_complet}}',
          fontFamily: 'Outfit',
          fontSize: 30,
          fontWeight: 'bold',
          color: '#4338ca',
          textAlign: 'center',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addTemplate(newTmpl);
    setActiveTab('editor');
    toast.success('Nouveau modèle vierge créé ! Ouvrez le Studio pour le modifier.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold font-outfit tracking-tight flex items-center gap-2 ${t.textPrimary}`}>
            <Layout className="w-6 h-6 text-amber-500" />
            Galerie de Modèles d'Attestation
          </h1>
          <p className={`text-xs ${t.textSecondary}`}>
            Sélectionnez, personnalisez ou dupliquez un modèle A4 Paysage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isLight
                ? 'text-amber-700 bg-amber-50 border-amber-300 hover:bg-amber-100'
                : 'text-amber-300 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20'
            }`}
            title="Recharger les modèles de démonstration royaux parfaitement centrés"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Recharger Modèles Prestige
          </button>

          <button
            onClick={handleCreateNewTemplate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Créer un Nouveau Modèle
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className={`flex items-center gap-2 border-b pb-3 ${t.border}`}>
        {['all', 'attestation', 'certificat', 'diplome'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filterCategory === cat
                ? isLight
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat === 'all' ? 'Tous les modèles' : cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tmpl) => {
          const isActive = activeTemplateId === tmpl.id;

          return (
            <motion.div
              key={tmpl.id}
              whileHover={{ y: -4 }}
              className={`p-6 rounded-3xl border transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? isLight
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-indigo-100'
                    : 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-900'
                  : isLight
                    ? 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-lg'
                    : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div>
                {/* Badge top */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 uppercase">
                      {tmpl.category || 'Attestation'}
                    </span>
                    {tmpl.isDefault && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isLight ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                      }`}>
                        Officiel Pro
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(tmpl.id, tmpl.name)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isLight ? 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100' : 'text-slate-400 hover:text-indigo-300 hover:bg-slate-800'
                      }`}
                      title="Dupliquer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {!tmpl.isDefault && (
                      <button
                        onClick={() => handleDelete(tmpl.id, tmpl.name)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                        }`}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Title & Desc */}
                <h3 className={`font-bold text-base mb-1 line-clamp-1 ${t.textPrimary}`}>
                  {tmpl.name}
                </h3>
                <p className={`text-xs line-clamp-2 mb-4 h-8 ${t.textSecondary}`}>
                  {tmpl.description || 'Design A4 Paysage pour attestations'}
                </p>

                {/* Element Count Specs */}
                <div className={`p-3 rounded-xl border text-xs space-y-1 mb-4 ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                }`}>
                  <div className="flex justify-between text-[11px]">
                    <span className={t.textMuted}>Format :</span>
                    <span className={`font-mono font-semibold ${t.textPrimary}`}>A4 Paysage (297×210 mm)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className={t.textMuted}>Éléments graphiques :</span>
                    <span className="font-mono font-semibold text-indigo-500">{tmpl.elements.length} objets</span>
                  </div>
                </div>
              </div>

              {/* Select & Edit Actions */}
              <div className={`flex items-center gap-2 pt-2 border-t ${t.border}`}>
                <button
                  onClick={() => {
                    setActiveTemplateId(tmpl.id);
                    setActiveTab('editor');
                    toast.success(`Modèle "${tmpl.name}" sélectionné pour édition.`);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : isLight
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isActive ? 'En cours dans le Studio' : 'Choisir & Éditer'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
