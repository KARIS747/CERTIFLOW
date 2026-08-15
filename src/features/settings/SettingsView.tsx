import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEstablishmentStore } from '../../store/useEstablishmentStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useUIStore } from '../../store/useUIStore';
import { useTheme } from '../../lib/useTheme';
import { 
  Building2, 
  FileText, 
  Settings, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  ShieldCheck,
  CheckCircle2,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { toast } from 'sonner';

export const SettingsView: React.FC = () => {
  const { establishment, updateEstablishment, addSignature, removeSignature, resetToDefault } = useEstablishmentStore();
  const { activeProject, setNumberingConfig } = useProjectStore();
  const { theme, setTheme } = useUIStore();
  const { isLight, t } = useTheme();

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
        <h1 className={`text-2xl font-bold font-outfit tracking-tight flex items-center gap-2 ${t.textPrimary}`}>
          <Settings className="w-6 h-6 text-indigo-500" />
          Paramètres & Profil Établissement
        </h1>
        <p className={`text-xs ${t.textSecondary}`}>
          Configurez les informations officielles de votre centre de formation, l'apparence et la numérotation
        </p>
      </div>

      {/* Theme Appearance Selector Card */}
      <div className={`p-6 rounded-3xl border space-y-4 shadow-xl ${
        isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          Apparence & Mode d'affichage
        </h2>
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => {
              setTheme('light');
              toast.success('Mode clair activé ☀️');
            }}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/20'
                : isLight
                  ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold">Clair</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme('dark');
              toast.success('Mode sombre activé 🌙');
            }}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 ring-2 ring-indigo-500/20'
                : isLight
                  ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">Sombre</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setTheme('system');
              toast.success('Thème système activé 🖥️');
            }}
            className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              theme === 'system'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                : isLight
                  ? 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  : 'border-slate-800 hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Monitor className="w-5 h-5 text-slate-500" />
            <span className="text-xs font-bold">Système</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveEstablishment} className="space-y-8">
        {/* Establishment Profile Card */}
        <div className={`p-6 rounded-3xl border space-y-6 shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-500" />
            Informations sur l'Établissement
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                Nom de l'établissement *
              </label>
              <input
                type="text"
                required
                value={formEst.name}
                onChange={(e) => setFormEst({ ...formEst, name: e.target.value })}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                Slogan / Devise
              </label>
              <input
                type="text"
                value={formEst.slogan || ''}
                onChange={(e) => setFormEst({ ...formEst, slogan: e.target.value })}
                placeholder="ex: Excellence Pédagogique & Innovation Numérique"
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div className="md:col-span-2">
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                Adresse officielle
              </label>
              <input
                type="text"
                value={formEst.address}
                onChange={(e) => setFormEst({ ...formEst, address: e.target.value })}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                Email de contact
              </label>
              <input
                type="email"
                value={formEst.email}
                onChange={(e) => setFormEst({ ...formEst, email: e.target.value })}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                Téléphone
              </label>
              <input
                type="text"
                value={formEst.phone}
                onChange={(e) => setFormEst({ ...formEst, phone: e.target.value })}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Numbering Config Card */}
        <div className={`p-6 rounded-3xl border space-y-6 shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <h2 className="text-sm font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-500" />
            Numérotation Automatique des Attestations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                Préfixe personnalisé
              </label>
              <input
                type="text"
                value={numPrefix}
                onChange={(e) => setNumPrefix(e.target.value)}
                placeholder="ex: CERT-2026-"
                className={`w-full text-xs font-mono font-bold rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-indigo-700'
                    : 'bg-slate-950 border-slate-800 text-indigo-300'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                Numéro de départ
              </label>
              <input
                type="number"
                value={numStart}
                onChange={(e) => setNumStart(parseInt(e.target.value) || 1)}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${t.textSecondary}`}>
                Nombre de chiffres (remplissage 0)
              </label>
              <input
                type="number"
                value={numDigits}
                onChange={(e) => setNumDigits(parseInt(e.target.value) || 3)}
                className={`w-full text-xs rounded-xl px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-900'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              />
            </div>
          </div>

          <div className={`p-3 rounded-xl border text-xs ${
            isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-950/60 border-slate-800 text-slate-400'
          }`}>
            Exemple de numéro généré :{' '}
            <strong className="text-amber-500 font-mono font-bold">
              {numPrefix}
              {String(numStart).padStart(numDigits, '0')}
            </strong>
          </div>
        </div>

        {/* Signatures & Stamp Card */}
        <div className={`p-6 rounded-3xl border space-y-6 shadow-xl ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Signatures Électroniques Prédéfinies
          </h2>

          <div className="space-y-3">
            {establishment.signatures.map((sig) => (
              <div
                key={sig.id}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div>
                  <div className={`font-bold ${t.textPrimary}`}>{sig.title}</div>
                  <div className={t.textSecondary}>{sig.signatoryName}</div>
                </div>

                <button
                  type="button"
                  onClick={() => removeSignature(sig.id)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-500 hover:text-rose-400 hover:bg-slate-800'
                  }`}
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
                className={`text-xs rounded-xl px-3 py-2 border ${
                  isLight
                    ? 'bg-slate-50 border-slate-300 text-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nom complet du signataire"
                  value={newSigName}
                  onChange={(e) => setNewSigName(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3 py-2 border ${
                    isLight
                      ? 'bg-slate-50 border-slate-300 text-slate-800'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
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
