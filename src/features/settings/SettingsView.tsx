import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEstablishmentStore } from '../../store/useEstablishmentStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useUIStore } from '../../store/useUIStore';
import { 
  Building2, 
  FileText, 
  Settings, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsView: React.FC = () => {
  const { establishment, updateEstablishment, addSignature, removeSignature, resetToDefault } = useEstablishmentStore();
  const { activeProject, setNumberingConfig } = useProjectStore();
  const { theme, setTheme } = useUIStore();

  const [formEst, setFormEst] = useState(establishment);
  const [newSigTitle, setNewSigTitle] = useState('');
  const [newSigName, setNewSigName] = useState('');

  // Numbering config
  const numbering = activeProject?.numberingConfig || {
    enabled: true,
    prefix: 'CERT-2026-',
    startNumber: 1,
    digitsCount: 3,
  };

  const [numPrefix, setNumPrefix] = useState(numbering.prefix);
  const [numStart, setNumStart] = useState(numbering.startNumber);
  const [numDigits, setNumDigits] = useState(numbering.digitsCount);

  const handleSaveEstablishment = (e: React.FormEvent) => {
    e.preventDefault();
    updateEstablishment(formEst);
    if (activeProject) {
      setNumberingConfig(activeProject.id, {
        enabled: true,
        prefix: numPrefix,
        startNumber: numStart,
        digitsCount: numDigits,
      });
    }
    toast.success('Paramètres de l\'établissement enregistrés avec succès !');
  };

  const handleAddSig = () => {
    if (!newSigTitle || !newSigName) return;
    addSignature({
      id: `sig-${Date.now()}`,
      title: newSigTitle,
      signatoryName: newSigName,
    });
    setNewSigTitle('');
    setNewSigName('');
    toast.success('Signature ajoutée !');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-outfit text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Paramètres & Profil Établissement
        </h1>
        <p className="text-xs text-slate-400">
          Configurez les informations officielles de votre centre de formation et la numérotation
        </p>
      </div>

      <form onSubmit={handleSaveEstablishment} className="space-y-8">
        {/* Establishment Profile Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
          <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Informations sur l'Établissement
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nom de l'établissement *
              </label>
              <input
                type="text"
                required
                value={formEst.name}
                onChange={(e) => setFormEst({ ...formEst, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Slogan / Devise
              </label>
              <input
                type="text"
                value={formEst.slogan || ''}
                onChange={(e) => setFormEst({ ...formEst, slogan: e.target.value })}
                placeholder="ex: Excellence Pédagogique & Innovation Numérique"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Adresse officielle
              </label>
              <input
                type="text"
                value={formEst.address}
                onChange={(e) => setFormEst({ ...formEst, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email de contact
              </label>
              <input
                type="email"
                value={formEst.email}
                onChange={(e) => setFormEst({ ...formEst, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Téléphone
              </label>
              <input
                type="text"
                value={formEst.phone}
                onChange={(e) => setFormEst({ ...formEst, phone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Numbering Config Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
          <h2 className="text-sm font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            Numérotation Automatique des Attestations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Préfixe personnalisé
              </label>
              <input
                type="text"
                value={numPrefix}
                onChange={(e) => setNumPrefix(e.target.value)}
                placeholder="ex: CERT-2026-"
                className="w-full bg-slate-950 border border-slate-800 text-indigo-300 text-xs font-mono font-bold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Numéro de départ
              </label>
              <input
                type="number"
                value={numStart}
                onChange={(e) => setNumStart(parseInt(e.target.value) || 1)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Nombre de chiffres (remplissage 0)
              </label>
              <input
                type="number"
                value={numDigits}
                onChange={(e) => setNumDigits(parseInt(e.target.value) || 3)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
            Exemple de numéro généré :{' '}
            <strong className="text-amber-300 font-mono">
              {numPrefix}
              {String(numStart).padStart(numDigits, '0')}
            </strong>
          </div>
        </div>

        {/* Signatures & Stamp Card */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6 shadow-xl">
          <h2 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Signatures Électroniques Prédéfinies
          </h2>

          <div className="space-y-3">
            {establishment.signatures.map((sig) => (
              <div
                key={sig.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200">{sig.title}</div>
                  <div className="text-slate-400">{sig.signatoryName}</div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSignature(sig.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* Add Signature Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <input
                type="text"
                placeholder="Titre (ex: Le Directeur Général)"
                value={newSigTitle}
                onChange={(e) => setNewSigTitle(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nom complet du signataire"
                  value={newSigName}
                  onChange={(e) => setNewSigName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleAddSig}
                  className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Submit Footer */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Enregistrer tous les paramètres
          </button>
        </div>
      </form>
    </div>
  );
};
