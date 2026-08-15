import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '../../store/useProjectStore';
import { useUIStore } from '../../store/useUIStore';
import { parseExcelFile, mapRowsToStudents } from '../../lib/excelParser';
import { AVAILABLE_VARIABLES } from '../../lib/utils';
import { StudentColumnMapping, Student } from '../../types/student';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Trash2, 
  Plus, 
  Edit3,
  Download,
  HelpCircle
} from 'lucide-react';
import { StepIndicator } from '../../components/common/StepIndicator';
import { useTheme } from '../../lib/useTheme';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export const ImportView: React.FC = () => {
  const { activeProject, setProjectStudents, setColumnMappings, createProject } = useProjectStore();
  const { setActiveTab } = useUIStore();
  const { isLight, t } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>(activeProject?.fileName || '');
  const [columns, setColumns] = useState<string[]>(
    activeProject?.columnMappings.map((m) => m.excelColumn) || []
  );
  const [rawRows, setRawRows] = useState<Record<string, any>[]>(
    activeProject?.fileRawData || []
  );
  const [mappings, setMappings] = useState<StudentColumnMapping[]>(
    activeProject?.columnMappings || []
  );
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const currentProject = activeProject || {
    id: 'temp-proj',
    name: 'Nouveau Projet',
    students: [],
    columnMappings: [],
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const result = parseExcelFile(buffer, file.name);

        setColumns(result.columns);
        setRawRows(result.rows);
        setMappings(result.suggestedMappings);

        // Map to student objects
        const students = mapRowsToStudents(
          result.rows,
          result.suggestedMappings,
          activeProject?.numberingConfig
        );

        let projId = activeProject?.id;
        if (!projId) {
          const newProj = createProject(file.name.replace(/\.[^/.]+$/, ''));
          projId = newProj.id;
        }

        setColumnMappings(projId, result.suggestedMappings);
        setProjectStudents(projId, students);

        toast.success(`Fichier "${file.name}" chargé avec ${students.length} étudiants !`);
      } catch (err) {
        console.error(err);
        toast.error('Erreur lors de la lecture du fichier Excel/CSV.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleMappingChange = (excelCol: string, targetVar: string) => {
    const updated = mappings.map((m) =>
      m.excelColumn === excelCol ? { ...m, targetVariable: targetVar } : m
    );
    setMappings(updated);

    if (activeProject && rawRows.length > 0) {
      setColumnMappings(activeProject.id, updated);
      const remappedStudents = mapRowsToStudents(
        rawRows,
        updated,
        activeProject.numberingConfig
      );
      setProjectStudents(activeProject.id, remappedStudents);
    }
  };

  const handleDownloadSampleExcel = () => {
    const sampleData = [
      { Nom: 'KOUAMÉ', Prénom: 'Jean-Baptiste', Formation: 'Développement Web & IA', Note: 18.5, Mention: 'Très Bien', Date: '15/06/2026' },
      { Nom: 'BERNARD', Prénom: 'Sophie', Formation: 'Développement Web & IA', Note: 17.2, Mention: 'Très Bien', Date: '15/06/2026' },
      { Nom: 'DIOP', Prénom: 'Mamadou', Formation: 'Cybersécurité & Cloud', Note: 16.0, Mention: 'Bien', Date: '20/06/2026' },
      { Nom: 'LEFEBVRE', Prénom: 'Camille', Formation: 'Management Digital', Note: 15.8, Mention: 'Bien', Date: '10/07/2026' },
      { Nom: 'BENALI', Prénom: 'Youssef', Formation: 'UX/UI Design', Note: 19.0, Mention: 'Très Bien', Date: '12/07/2026' },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Étudiants');
    XLSX.writeFile(wb, 'Exemple_Etudiants_CertiFlow.xlsx');
    toast.success('Exemple d\'Excel téléchargé !');
  };

  const invalidStudents = currentProject.students.filter((s) => !s.isValid);

  return (
    <div className="space-y-6 pb-12">
      {/* Step Workflow Header */}
      <StepIndicator currentStep={2} />

      {/* Upload Dropzone */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-8 rounded-3xl border-2 border-dashed transition-all duration-300 text-center relative overflow-hidden shadow-xl ${
          isLight
            ? 'bg-white border-indigo-300 hover:border-indigo-500 shadow-indigo-100/50'
            : 'bg-slate-900/60 border-indigo-500/30 hover:border-indigo-500/60'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx, .xls, .csv"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-inner">
            <UploadCloud className="w-8 h-8 animate-bounce" />
          </div>

          <div>
            <h3 className={`text-lg font-bold font-outfit ${t.textPrimary}`}>
              {fileName ? `Fichier chargé : ${fileName}` : 'Glissez-déposez votre fichier Excel / CSV ici'}
            </h3>
            <p className={`text-xs mt-1 ${t.textSecondary}`}>
              Supports pris en charge : <strong>.xlsx, .xls, .csv</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              Parcourir mes fichiers
            </button>
            <button
              onClick={handleDownloadSampleExcel}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs border transition-all ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              <Download className="w-3.5 h-3.5 text-amber-500" />
              Télécharger un modèle Excel exemple
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Column Mappings & Students Preview */}
      {currentProject.students.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Variable Mapping Configurator */}
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl border space-y-4 shadow-md ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-sm flex items-center gap-2 ${t.textPrimary}`}>
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                  Association des Colonnes
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                  {mappings.length} colonnes détectées
                </span>
              </div>

              <p className={`text-xs ${t.textSecondary}`}>
                Associez chaque colonne Excel à sa variable CertiFlow correspondante :
              </p>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {mappings.map((mapItem) => (
                  <div
                    key={mapItem.excelColumn}
                    className={`p-3 rounded-xl border space-y-1.5 ${
                      isLight
                        ? 'bg-slate-50 border-slate-200'
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-indigo-500">
                        {mapItem.excelColumn}
                      </span>
                      <span className={`text-[10px] ${t.textMuted}`}>Excel</span>
                    </div>

                    <select
                      value={mapItem.targetVariable}
                      onChange={(e) => handleMappingChange(mapItem.excelColumn, e.target.value)}
                      className={`w-full text-xs rounded-lg px-2.5 py-1.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isLight
                          ? 'bg-white border-slate-300 text-slate-800'
                          : 'bg-slate-900 text-slate-200 border-slate-700'
                      }`}
                    >
                      <option value="ignore">-- Ignorer cette colonne --</option>
                      <optgroup label="Variables standards">
                        <option value="nom">Nom ({'{{nom}}'})</option>
                        <option value="prenom">Prénom ({'{{prenom}}'})</option>
                        <option value="nom_complet">Nom & Prénom ({'{{nom_complet}}'})</option>
                        <option value="matricule">Matricule ({'{{matricule}}'})</option>
                        <option value="formation">Formation ({'{{formation}}'})</option>
                        <option value="specialite">Spécialité ({'{{specialite}}'})</option>
                        <option value="note">Note ({'{{note}}'})</option>
                        <option value="moyenne">Moyenne ({'{{moyenne}}'})</option>
                        <option value="mention">Mention ({'{{mention}}'})</option>
                        <option value="rang">Rang ({'{{rang}}'})</option>
                        <option value="duree">Durée ({'{{duree}}'})</option>
                        <option value="annee">Année ({'{{annee}}'})</option>
                        <option value="date_obtention">Date obtention ({'{{date_obtention}}'})</option>
                        <option value="email">Email ({'{{email}}'})</option>
                      </optgroup>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Students Data Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className={`p-5 rounded-2xl border space-y-4 shadow-md ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-bold text-sm flex items-center gap-2 ${t.textPrimary}`}>
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    Aperçu des Étudiants Importés
                  </h3>
                  <p className={`text-xs ${t.textSecondary}`}>
                    {currentProject.students.length} fiches d'étudiants enregistrées
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('editor')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
                >
                  Passer au Studio Canvas <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Warnings & Anomalies Banner */}
              {invalidStudents.length > 0 && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
                  isLight
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                }`}>
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <strong>⚠ {invalidStudents.length} étudiant(s) présentent des données incomplètes</strong>
                    <p className={`text-[11px] ${isLight ? 'text-amber-800' : 'text-amber-200'}`}>
                      Veuillez vérifier que le Nom et la Formation sont bien renseignés avant d'exporter.
                    </p>
                  </div>
                </div>
              )}

              {/* Data Table */}
              <div className={`overflow-x-auto border rounded-xl ${t.border}`}>
                <table className={`w-full text-left text-xs ${t.textPrimary}`}>
                  <thead className={`uppercase font-semibold text-[10px] tracking-wider ${
                    isLight ? 'bg-slate-100 text-slate-600' : 'bg-slate-950 text-slate-400'
                  }`}>
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Numéro</th>
                      <th className="p-3">Nom & Prénom</th>
                      <th className="p-3">Formation</th>
                      <th className="p-3">Note / Moy.</th>
                      <th className="p-3">Mention</th>
                      <th className="p-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.divide}`}>
                    {currentProject.students.slice(0, 10).map((std, idx) => (
                      <tr key={std.id} className={`transition-colors ${
                        isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-800/40'
                      }`}>
                        <td className={`p-3 font-mono ${t.textMuted}`}>{idx + 1}</td>
                        <td className="p-3 font-mono text-indigo-500 font-medium">
                          {std.numero_attestation || `ATT-00${idx + 1}`}
                        </td>
                        <td className={`p-3 font-bold ${t.textPrimary}`}>
                          {std.nom_complet || `${std.prenom} ${std.nom}`}
                        </td>
                        <td className={`p-3 max-w-[180px] truncate ${t.textSecondary}`}>
                          {std.formation || <span className="text-rose-500 italic">Non spécifié</span>}
                        </td>
                        <td className="p-3 font-mono">
                          {std.moyenne || std.note || '-'}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            {std.mention || 'Satisfaisant'}
                          </span>
                        </td>
                        <td className="p-3">
                          {std.isValid ? (
                            <span className="text-emerald-500 font-semibold flex items-center gap-1">
                              ✓ Valide
                            </span>
                          ) : (
                            <span className="text-rose-500 font-semibold flex items-center gap-1">
                              ⚠ Erreur
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {currentProject.students.length > 10 && (
                <p className={`text-[11px] text-center italic ${t.textMuted}`}>
                  + {currentProject.students.length - 10} autres étudiants chargés dans la file.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
