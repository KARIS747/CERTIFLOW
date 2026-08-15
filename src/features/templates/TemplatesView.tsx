import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useUIStore } from '../../store/useUIStore';
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
          <h1 className="text-2xl font-bold font-outfit text-white tracking-tight flex items-center gap-2">
            <Layout className="w-6 h-6 text-amber-400" />
            Galerie de Modèles d'Attestation
          </h1>
          <p className="text-xs text-slate-400">
            Sélectionnez, personnalisez ou dupliquez un modèle A4 Paysage
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
            title="Recharger les modèles de démonstration royaux parfaitement centrés"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
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
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {['all', 'attestation', 'certificat', 'diplome'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
              filterCategory === cat
                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
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
              className={`p-6 rounded-3xl bg-slate-900/60 border transition-all duration-300 shadow-xl relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-slate-900'
                  : 'border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div>
                {/* Badge top */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
                      {tmpl.category || 'Attestation'}
                    </span>
                    {tmpl.isDefault && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Officiel Pro
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleDuplicate(tmpl.id, tmpl.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                      title="Dupliquer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    {!tmpl.isDefault && (
                      <button
                        onClick={() => handleDelete(tmpl.id, tmpl.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Card Title & Desc */}
                <h3 className="font-bold text-slate-100 text-base mb-1 line-clamp-1">
                  {tmpl.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8">
                  {tmpl.description || 'Design A4 Paysage pour attestations'}
                </p>

                {/* Element Count Specs */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 space-y-1 mb-4">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Format :</span>
                    <span className="font-mono font-semibold text-slate-200">A4 Paysage (297×210 mm)</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Éléments graphiques :</span>
                    <span className="font-mono font-semibold text-indigo-400">{tmpl.elements.length} objets</span>
                  </div>
                </div>
              </div>

              {/* Select & Edit Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={() => {
                    setActiveTemplateId(tmpl.id);
                    setActiveTab('editor');
                    toast.success(`Modèle "${tmpl.name}" sélectionné pour édition.`);
                  }}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
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
