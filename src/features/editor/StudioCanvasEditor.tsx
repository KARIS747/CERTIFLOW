import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { motion, AnimatePresence } from 'framer-motion';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useEstablishmentStore } from '../../store/useEstablishmentStore';
import { useUIStore } from '../../store/useUIStore';
import { TemplateElement } from '../../types/template';
import { Student } from '../../types/student';
import { AVAILABLE_VARIABLES } from '../../lib/utils';
import { 
  resolveVariableText, 
  generateSinglePDFBlob, 
  computeOutputFileName, 
  createZipArchive, 
  downloadZip 
} from '../../lib/pdfGenerator';
import { StepIndicator } from '../../components/common/StepIndicator';
import { 
  Type, 
  Variable, 
  Image as ImageIcon, 
  Square, 
  Minus, 
  Save, 
  Cpu, 
  Download, 
  User, 
  Trash2, 
  Lock, 
  Unlock, 
  Palette, 
  CheckCircle2, 
  Sparkles, 
  RefreshCw,
  Award,
  Stamp,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export const StudioCanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  const { activeTemplate, updateTemplateElements, templates, setActiveTemplateId } = useTemplateStore();
  const { activeProject } = useProjectStore();
  const { establishment } = useEstablishmentStore();
  const { setActiveTab } = useUIStore();

  const studentsList = activeProject?.students && activeProject.students.length > 0
    ? activeProject.students
    : [];

  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    studentsList[0]?.id || ''
  );

  const currentStudent = studentsList.find((s) => s.id === selectedStudentId) || {
    id: 'demo-student',
    nom: 'DUPONT',
    prenom: 'Jean-Pierre',
    nom_complet: 'Jean-Pierre DUPONT',
    formation: 'Développement Web & Intelligence Artificielle',
    specialite: 'Architecte Logiciel',
    note: '18.5',
    moyenne: '18.5/20',
    mention: 'Très Bien avec Félicitations',
    rang: '1er / 45',
    duree: '600 heures',
    annee: '2026',
    annee_academique: '2025-2026',
    date_obtention: '15 Juin 2026',
    numero_attestation: 'ATT-2026-001',
  };

  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);

  // Inspector Properties State
  const [propText, setPropText] = useState<string>('');
  const [propFontSize, setPropFontSize] = useState<number>(20);
  const [propFontFamily, setPropFontFamily] = useState<string>('Inter');
  const [propColor, setPropColor] = useState<string>('#000000');
  const [propBold, setPropBold] = useState<boolean>(false);
  const [propItalic, setPropItalic] = useState<boolean>(false);
  const [propTextAlign, setPropTextAlign] = useState<string>('left');

  // Generation Queue Modal State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  // Zoom & Workspace Expansion State (Default 55% scale fits A4 Landscape 1123x794 completely)
  const [zoomScale, setZoomScale] = useState<number>(0.55);
  const [isExpandedWorkspace, setIsExpandedWorkspace] = useState<boolean>(false);

  const applyZoom = (scale: number) => {
    const clamped = Math.min(Math.max(scale, 0.35), 1.5);
    setZoomScale(clamped);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(clamped);
      fabricCanvasRef.current.setDimensions({
        width: Math.round(1123 * clamped),
        height: Math.round(794 * clamped),
      });
      fabricCanvasRef.current.renderAll();
    }
  };

  // Canvas Initialization & Rendering
  useEffect(() => {
    if (!canvasRef.current) return;

    // Safely dispose previous instance if re-rendering
    if (fabricCanvasRef.current) {
      try {
        fabricCanvasRef.current.dispose();
      } catch (e) {
        // Ignore DOM unmount errors in Fabric.js
      }
      fabricCanvasRef.current = null;
    }

    // A4 Landscape Aspect Ratio: 1123 x 794 canvas size (scaled to zoomScale for perfect fit)
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: Math.round(1123 * zoomScale),
      height: Math.round(794 * zoomScale),
      backgroundColor: '#ffffff',
      selection: true,
    });
    canvas.setZoom(zoomScale);

    fabricCanvasRef.current = canvas;

    // Load initial elements from active template
    renderTemplateElements(canvas);

    // Event Listeners for Object Selection
    canvas.on('selection:created', (e) => handleObjectSelected(e.selected?.[0] || null));
    canvas.on('selection:updated', (e) => handleObjectSelected(e.selected?.[0] || null));
    canvas.on('selection:cleared', () => setSelectedObject(null));

    return () => {
      try {
        canvas.dispose();
      } catch (e) {
        // Safe cleanup
      }
      fabricCanvasRef.current = null;
    };
  }, [activeTemplate?.id, selectedStudentId]);

  const renderTemplateElements = (canvas: fabric.Canvas) => {
    if (!activeTemplate) return;
    canvas.clear();
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

    activeTemplate.elements.forEach((el) => {
      if (el.type === 'text' || el.type === 'variable') {
        const textContent = resolveVariableText(el.content || '', currentStudent, establishment);
        
        const textObj = new fabric.IText(textContent, {
          left: el.x,
          top: el.y,
          width: el.width,
          fontFamily: el.fontFamily || 'Inter',
          fontSize: el.fontSize || 18,
          fill: el.color || '#000000',
          fontWeight: el.fontWeight as any || 'normal',
          fontStyle: (el.fontStyle as any) || 'normal',
          textAlign: el.textAlign || 'left',
          lockScalingX: false,
          lockScalingY: false,
        });

        // Attach custom ID tag
        (textObj as any).elementId = el.id;
        (textObj as any).rawTemplateContent = el.content;
        canvas.add(textObj);
      } else if (el.type === 'rectangle') {
        const rectObj = new fabric.Rect({
          left: el.x,
          top: el.y,
          width: el.width,
          height: el.height,
          fill: el.backgroundColor || 'transparent',
          stroke: el.borderColor || '#000000',
          strokeWidth: el.borderWidth || 1,
          selectable: !el.isLocked,
        });
        (rectObj as any).elementId = el.id;
        canvas.add(rectObj);
      } else if (el.type === 'line') {
        const lineObj = new fabric.Line([el.x, el.y, el.x + el.width, el.y], {
          stroke: el.backgroundColor || '#000000',
          strokeWidth: el.height || 2,
          selectable: !el.isLocked,
        });
        (lineObj as any).elementId = el.id;
        canvas.add(lineObj);
      } else if (el.type === 'image' && el.src) {
        fabric.Image.fromURL(el.src, (img) => {
          img.set({
            left: el.x,
            top: el.y,
            scaleX: el.width / (img.width || 1),
            scaleY: el.height / (img.height || 1),
          });
          (img as any).elementId = el.id;
          canvas.add(img);
          canvas.renderAll();
        });
      }
    });

    canvas.renderAll();
  };

  const handleObjectSelected = (obj: fabric.Object | null) => {
    setSelectedObject(obj);
    if (!obj) return;

    if (obj.type === 'i-text' || obj.type === 'text') {
      const itext = obj as fabric.IText;
      setPropText((obj as any).rawTemplateContent || itext.text || '');
      setPropFontSize(itext.fontSize || 18);
      setPropFontFamily(itext.fontFamily || 'Inter');
      setPropColor(itext.fill as string || '#000000');
      setPropBold(itext.fontWeight === 'bold' || itext.fontWeight === 700);
      setPropItalic(itext.fontStyle === 'italic');
      setPropTextAlign(itext.textAlign || 'left');
    }
  };

  // Add Elements Handlers
  const handleAddText = () => {
    if (!fabricCanvasRef.current) return;
    const textObj = new fabric.IText('Nouveau texte d\'attestation', {
      left: 300,
      top: 300,
      fontFamily: 'Inter',
      fontSize: 20,
      fill: '#1e293b',
    });
    (textObj as any).elementId = `el-text-${Date.now()}`;
    (textObj as any).rawTemplateContent = 'Nouveau texte d\'attestation';
    fabricCanvasRef.current.add(textObj);
    fabricCanvasRef.current.setActiveObject(textObj);
    fabricCanvasRef.current.renderAll();
    toast.success('Bloc texte ajouté.');
  };

  const handleAddVariable = (variableKey: string) => {
    if (!fabricCanvasRef.current) return;
    const textContent = resolveVariableText(variableKey, currentStudent, establishment);
    const varObj = new fabric.IText(textContent, {
      left: 350,
      top: 350,
      fontFamily: 'Outfit',
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#4338ca',
    });
    (varObj as any).elementId = `el-var-${Date.now()}`;
    (varObj as any).rawTemplateContent = variableKey;
    fabricCanvasRef.current.add(varObj);
    fabricCanvasRef.current.setActiveObject(varObj);
    fabricCanvasRef.current.renderAll();
    toast.success(`Variable ${variableKey} insérée !`);
  };

  const handleAddBorderFrame = () => {
    if (!fabricCanvasRef.current) return;
    const rect = new fabric.Rect({
      left: 20,
      top: 20,
      width: 1083,
      height: 754,
      fill: 'transparent',
      stroke: '#d97706',
      strokeWidth: 3,
    });
    (rect as any).elementId = `el-frame-${Date.now()}`;
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.renderAll();
    toast.success('Bordure dorée insérée.');
  };

  const handleDeleteSelected = () => {
    if (!fabricCanvasRef.current || !selectedObject) return;
    fabricCanvasRef.current.remove(selectedObject);
    fabricCanvasRef.current.renderAll();
    setSelectedObject(null);
    toast.success('Élément supprimé.');
  };

  // Property Update Callbacks
  const updateSelectedProperty = (key: string, value: any) => {
    if (!selectedObject || !fabricCanvasRef.current) return;

    if (key === 'text') {
      (selectedObject as any).rawTemplateContent = value;
      const resolved = resolveVariableText(value, currentStudent, establishment);
      (selectedObject as fabric.IText).set('text', resolved);
    } else if (key === 'fontSize') {
      selectedObject.set('fontSize' as any, value);
    } else if (key === 'fontFamily') {
      selectedObject.set('fontFamily' as any, value);
    } else if (key === 'color') {
      selectedObject.set('fill', value);
    } else if (key === 'fontWeight') {
      selectedObject.set('fontWeight' as any, value);
    } else if (key === 'fontStyle') {
      selectedObject.set('fontStyle' as any, value);
    } else if (key === 'textAlign') {
      selectedObject.set('textAlign' as any, value);
    }

    fabricCanvasRef.current.renderAll();
  };

  // Save current design state back to template
  const handleSaveTemplateState = () => {
    if (!fabricCanvasRef.current || !activeTemplate) return;

    const objects = fabricCanvasRef.current.getObjects();
    const updatedElements: TemplateElement[] = objects.map((obj) => {
      const itext = obj as fabric.IText;
      return {
        id: (obj as any).elementId || `el-${Date.now()}`,
        type: obj.type === 'i-text' ? 'text' : (obj.type as any),
        x: Math.round(obj.left || 0),
        y: Math.round(obj.top || 0),
        width: Math.round(obj.width || 100),
        height: Math.round(obj.height || 50),
        content: (obj as any).rawTemplateContent || itext.text || '',
        fontFamily: itext.fontFamily,
        fontSize: itext.fontSize,
        fontWeight: itext.fontWeight as any,
        fontStyle: itext.fontStyle as any,
        color: itext.fill as string,
        textAlign: itext.textAlign as any,
      };
    });

    updateTemplateElements(activeTemplate.id, updatedElements);
    toast.success('Modèle d\'attestation sauvegardé avec succès !');
  };

  // Bulk PDF Generation Handler
  const handleStartBulkGeneration = async () => {
    if (!activeTemplate) {
      toast.error('Veuillez d\'abord sélectionner un modèle d\'attestation.');
      return;
    }

    const listToGenerate = studentsList.length > 0 ? studentsList : [currentStudent];

    setIsGenerating(true);
    setGenerationProgress(0);
    setGeneratedCount(0);

    const generatedFiles: { fileName: string; pdfBytes: Uint8Array }[] = [];

    // Fabric Canvas High DPI Render URL
    const canvasDataUrl = fabricCanvasRef.current
      ? fabricCanvasRef.current.toDataURL({ format: 'png', multiplier: (1 / zoomScale) * 2 })
      : undefined;

    for (let i = 0; i < listToGenerate.length; i++) {
      const std = listToGenerate[i];

      // Single PDF doc
      const pdfDoc = generateSinglePDFBlob(
        activeTemplate,
        std,
        establishment,
        canvasDataUrl
      );

      const pdfArrayBuffer = pdfDoc.output('arraybuffer');
      const pdfBytes = new Uint8Array(pdfArrayBuffer);
      const fileName = computeOutputFileName(
        activeProject?.outputNamingPattern || '{{nom}}_{{prenom}}_attestation.pdf',
        std
      );

      generatedFiles.push({ fileName, pdfBytes });

      // Async step to prevent freezing UI
      setGeneratedCount(i + 1);
      setGenerationProgress(Math.round(((i + 1) / listToGenerate.length) * 100));
      await new Promise((res) => setTimeout(res, 50));
    }

    // Zip archive creation
    const zip = await createZipArchive(generatedFiles);
    setZipBlob(zip);

    // Confetti celebration animation!
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast.success(`${generatedFiles.length} attestations PDF générées avec succès !`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Workflow Step Header */}
      <StepIndicator currentStep={4} />

      {/* Top Action & Preview Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
        {/* Template Selector & Live Preview Student Dropdown */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Modèle actif :</span>
            <select
              value={activeTemplate?.id || ''}
              onChange={(e) => setActiveTemplateId(e.target.value)}
              className="bg-slate-800 text-slate-100 text-xs font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} ({tmpl.category || 'Attestation'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <User className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-slate-400">Aperçu avec :</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-slate-800 text-indigo-300 text-xs font-bold rounded-xl px-3 py-2 border border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {studentsList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom_complet || `${s.prenom} ${s.nom}`} ({s.formation?.slice(0, 20)}...)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveTemplateState}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            Enregistrer Modèle
          </button>

          <button
            onClick={handleStartBulkGeneration}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Cpu className="w-4 h-4" />
            Générer ({studentsList.length || 1} PDF)
          </button>
        </div>
      </div>

      {/* Main Studio Editor Workspace (Library - Canvas - Inspector) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Toolbar: Elements Library (3 Cols, Hidden if expanded) */}
        {!isExpandedWorkspace && (
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Bibliothèque d'Éléments
              </h3>

              <div className="space-y-2">
                <button
                  onClick={handleAddText}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors"
                >
                  <Type className="w-4 h-4 text-indigo-400" />
                  Ajouter un Bloc Texte
                </button>

                <button
                  onClick={handleAddBorderFrame}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700/80 transition-colors"
                >
                  <Square className="w-4 h-4 text-amber-400" />
                  Ajouter Cadre / Bordure
                </button>
              </div>

              {/* Dynamic Variables Quick Inserter */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Insérer une Variable
                </span>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => handleAddVariable(v.key)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-950/60 hover:bg-indigo-950/40 text-slate-300 text-xs border border-slate-800 hover:border-indigo-500/30 transition-colors text-left"
                    >
                      <span className="font-bold text-indigo-300">{v.key}</span>
                      <span className="text-[10px] text-slate-500">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Center: Canvas A4 Landscape Representation (6 Cols or 9 Cols if Expanded) */}
        <div className={`${isExpandedWorkspace ? 'lg:col-span-9' : 'lg:col-span-6'} flex flex-col items-center justify-center space-y-3 transition-all duration-300`}>
          
          {/* Zoom & Workspace Control Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs shadow-md">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-semibold px-2">Zoom :</span>
              <button
                onClick={() => applyZoom(zoomScale - 0.05)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Dézoomer (-5%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <select
                value={zoomScale}
                onChange={(e) => applyZoom(parseFloat(e.target.value))}
                className="bg-slate-950 text-indigo-300 font-bold rounded-lg px-2.5 py-1 border border-slate-700 text-xs focus:outline-none"
              >
                <option value={0.35}>35% (Très petit)</option>
                <option value={0.45}>45% (Aperçu global)</option>
                <option value={0.55}>55% (Ajusté Écran)</option>
                <option value={0.65}>65% (Grand)</option>
                <option value={0.75}>75% (Très Grand)</option>
                <option value={1.0}>100% (Taille Réelle A4)</option>
                <option value={1.25}>125% (Zoom +)</option>
              </select>

              <button
                onClick={() => applyZoom(zoomScale + 0.05)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                title="Zoomer (+5%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => applyZoom(0.55)}
                className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20 hover:bg-indigo-500/20 text-[11px] transition-colors"
              >
                Ajuster (100% visible)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExpandedWorkspace(!isExpandedWorkspace)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors text-[11px] font-semibold"
                title="Agrandir la zone d'édition"
              >
                {isExpandedWorkspace ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-amber-400" />
                    Réduire Studio
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                    Agrandir Studio
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Canvas Wrapper Box */}
          <div className="relative p-3 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-auto max-w-full flex justify-center">
            <div className="border border-slate-300/20 shadow-2xl rounded-sm overflow-hidden bg-white transition-all duration-300">
              <canvas ref={canvasRef} className="block" />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 text-center font-medium">
            Format A4 Paysage (297 x 210 mm) • Zoom actuel : <strong className="text-indigo-300">{Math.round(zoomScale * 100)}%</strong> • Double-cliquez pour éditer.
          </p>
        </div>

        {/* Right Inspector: Properties Panel (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-400" />
                Propriétés de l'Élément
              </h3>
              {selectedObject && (
                <button
                  onClick={handleDeleteSelected}
                  className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {selectedObject ? (
              <div className="space-y-4">
                {/* Text Content */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Texte ou Variable
                  </label>
                  <textarea
                    rows={3}
                    value={propText}
                    onChange={(e) => {
                      setPropText(e.target.value);
                      updateSelectedProperty('text', e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Police typographique
                  </label>
                  <select
                    value={propFontFamily}
                    onChange={(e) => {
                      setPropFontFamily(e.target.value);
                      updateSelectedProperty('fontFamily', e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Inter">Inter (Standard Modern)</option>
                    <option value="Outfit">Outfit (Moderne H1)</option>
                    <option value="Cinzel">Cinzel (Académique Prestigieux)</option>
                    <option value="Playfair Display">Playfair Display (Classique Serif)</option>
                    <option value="Montserrat">Montserrat (Contemporain)</option>
                  </select>
                </div>

                {/* Font Size & Color */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Taille (pt)
                    </label>
                    <input
                      type="number"
                      value={propFontSize}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 12;
                        setPropFontSize(val);
                        updateSelectedProperty('fontSize', val);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Couleur
                    </label>
                    <input
                      type="color"
                      value={propColor}
                      onChange={(e) => {
                        setPropColor(e.target.value);
                        updateSelectedProperty('color', e.target.value);
                      }}
                      className="w-full h-9 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>

                {/* Formatting Toggles */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      const next = !propBold;
                      setPropBold(next);
                      updateSelectedProperty('fontWeight', next ? 'bold' : 'normal');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      propBold ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    B (Gras)
                  </button>

                  <button
                    onClick={() => {
                      const next = !propItalic;
                      setPropItalic(next);
                      updateSelectedProperty('fontStyle', next ? 'italic' : 'normal');
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs italic border transition-colors ${
                      propItalic ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    I (Italique)
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                Cliquez sur n'importe quel element de l'attestation pour le personnaliser.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Generation Progress & ZIP Download Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
              <Cpu className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className="text-xl font-bold font-outfit text-white">
                {generationProgress < 100
                  ? 'Génération des Attestations en cours...'
                  : 'Génération Terminée avec Succès ! 🎉'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {generatedCount} / {studentsList.length || 1} attestations créées
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <motion.div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-bold text-indigo-300 font-mono">
                {generationProgress}%
              </span>
            </div>

            {/* Finished Zip Action Buttons */}
            {generationProgress === 100 && zipBlob && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => downloadZip(zipBlob)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-xl shadow-emerald-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Télécharger l'Archive ZIP (Toutes les Attestations)
                </button>
                <button
                  onClick={() => setIsGenerating(false)}
                  className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
                >
                  Fermer
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};
