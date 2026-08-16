import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { motion } from 'framer-motion';
import { useTemplateStore } from '../../store/useTemplateStore';
import { useProjectStore } from '../../store/useProjectStore';
import { useEstablishmentStore } from '../../store/useEstablishmentStore';
import { useUIStore } from '../../store/useUIStore';
import { TemplateElement } from '../../types/template';
import { Student } from '../../types/student';
import { AVAILABLE_VARIABLES } from '../../lib/utils';
import { initSmartGuides } from '../../lib/canvasGuides';
import { 
  resolveVariableText, 
  generateSinglePDFBlob, 
  computeOutputFileName, 
  createZipArchive, 
  downloadZip 
} from '../../lib/pdfGenerator';
import { useTheme } from '../../lib/useTheme';
import { 
  Type, 
  Square, 
  Save, 
  Cpu, 
  Download, 
  User, 
  Trash2, 
  Palette, 
  Sparkles, 
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  Hand,
  Move,
  ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export const StudioCanvasEditor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { activeTemplate, updateTemplateElements, templates, setActiveTemplateId } = useTemplateStore();
  const { activeProject } = useProjectStore();
  const { establishment } = useEstablishmentStore();
  const { setActiveTab } = useUIStore();
  const { isLight, t } = useTheme();

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
  const [propOpacity, setPropOpacity] = useState<number>(1);

  // Generation Queue Modal State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedCount, setGeneratedCount] = useState(0);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  // Viewport & Pan/Navigation State (Left/Right & Top/Bottom scrolling)
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isPanMode, setIsPanMode] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number; scrollLeft: number; scrollTop: number } | null>(null);

  // Zoom & Workspace Expansion State
  const [zoomScale, setZoomScale] = useState<number>(0.65);
  const [isExpandedWorkspace, setIsExpandedWorkspace] = useState<boolean>(false);

  // Resizable Panels State (px widths, 0 = hidden)
  const studioContainerRef = useRef<HTMLDivElement>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(280);
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(300);
  const resizingRef = useRef<'left' | 'right' | null>(null);
  const resizeStartRef = useRef<{ x: number; leftW: number; rightW: number }>({ x: 0, leftW: 280, rightW: 300 });

  const handleResizerMouseDown = (side: 'left' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = side;
    resizeStartRef.current = { x: e.clientX, leftW: leftPanelWidth, rightW: rightPanelWidth };

    const onMouseMove = (ev: MouseEvent) => {
      if (!studioContainerRef.current) return;
      const containerWidth = studioContainerRef.current.getBoundingClientRect().width;
      const delta = ev.clientX - resizeStartRef.current.x;

      if (resizingRef.current === 'left') {
        const newW = Math.min(Math.max(resizeStartRef.current.leftW + delta, 180), containerWidth * 0.35);
        setLeftPanelWidth(newW);
      } else if (resizingRef.current === 'right') {
        const newW = Math.min(Math.max(resizeStartRef.current.rightW - delta, 200), containerWidth * 0.4);
        setRightPanelWidth(newW);
      }
    };

    const onMouseUp = () => {
      resizingRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const fitModeRef = useRef(false);

  const applyZoom = (scale: number, isFit = false) => {
    const clamped = Math.min(Math.max(scale, 0.35), 1.5);
    fitModeRef.current = isFit;
    setZoomScale(clamped);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(clamped);
      fabricCanvasRef.current.setDimensions({
        width: Math.round(1123 * clamped),
        height: Math.round(794 * clamped),
      });
      fabricCanvasRef.current.requestRenderAll();
    }
  };

  // Auto-fit the A4 canvas to the available viewport space
  const fitToView = () => {
    if (!viewportRef.current || !fabricCanvasRef.current) return;
    const vp = viewportRef.current;
    const availW = Math.max(vp.clientWidth - 80, 300);
    const availH = Math.max(vp.clientHeight - 56, 200);
    const scale = Math.min(availW / 1123, availH / 794, 1);
    applyZoom(Math.max(scale, 0.35), true);
  };

  // Directional Smooth Scroll Handler (Left, Right, Up, Down, Center)
  const scrollCanvas = (direction: 'left' | 'right' | 'up' | 'down' | 'center') => {
    if (!viewportRef.current) return;
    const vp = viewportRef.current;
    const step = 240;

    if (direction === 'left') {
      vp.scrollBy({ left: -step, behavior: 'smooth' });
    } else if (direction === 'right') {
      vp.scrollBy({ left: step, behavior: 'smooth' });
    } else if (direction === 'up') {
      vp.scrollBy({ top: -step, behavior: 'smooth' });
    } else if (direction === 'down') {
      vp.scrollBy({ top: step, behavior: 'smooth' });
    } else if (direction === 'center') {
      vp.scrollTo({
        left: Math.max(0, (vp.scrollWidth - vp.clientWidth) / 2),
        top: Math.max(0, (vp.scrollHeight - vp.clientHeight) / 2),
        behavior: 'smooth',
      });
    }
  };

  // Pan Handlers for Drag-to-Navigate
  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (isPanMode || e.button === 1) {
      if (!viewportRef.current) return;
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        scrollLeft: viewportRef.current.scrollLeft,
        scrollTop: viewportRef.current.scrollTop,
      };
    }
  };

  const handleViewportMouseMove = (e: React.MouseEvent) => {
    if (!panStartRef.current || !viewportRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    viewportRef.current.scrollLeft = panStartRef.current.scrollLeft - dx;
    viewportRef.current.scrollTop = panStartRef.current.scrollTop - dy;
  };

  const handleViewportMouseUp = () => {
    panStartRef.current = null;
  };

  // Keyboard shortcut for Spacebar Pan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.code === 'Space' &&
        (e.target as HTMLElement).tagName !== 'INPUT' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsPanMode(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsPanMode(false);
        panStartRef.current = null;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Canvas Initialization & High-DPI Rendering
  useEffect(() => {
    if (!canvasRef.current) return;

    // Force high devicePixelRatio (Retina supersampling at 2x minimum for crystal-sharp text)
    (fabric as any).devicePixelRatio = Math.max(window.devicePixelRatio || 1, 2);

    // Safely dispose previous instance if re-rendering
    if (fabricCanvasRef.current) {
      try {
        fabricCanvasRef.current.dispose();
      } catch (e) {
        // Ignore DOM unmount errors in Fabric.js
      }
      fabricCanvasRef.current = null;
    }

    // A4 Landscape Aspect Ratio: 1123 x 794 canvas size
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: Math.round(1123 * zoomScale),
      height: Math.round(794 * zoomScale),
      backgroundColor: '#ffffff',
      selection: true,
      enableRetinaScaling: true,
      imageSmoothingEnabled: true,
    });
    canvas.setZoom(zoomScale);

    fabricCanvasRef.current = canvas;

    // Enable Canva-style snapping & alignment/centering guidelines
    initSmartGuides(canvas);

    // Load initial elements from active template
    renderTemplateElements(canvas);

    // When web fonts are fully loaded, trigger a re-render for pixel-perfect typography
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (fabricCanvasRef.current) {
          fabricCanvasRef.current.requestRenderAll();
        }
      });
    }

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

  // Auto-fit canvas to viewport on mount and whenever the viewport resizes
  useEffect(() => {
    const t = setTimeout(() => fitToView(), 60);
    const vp = viewportRef.current;
    if (!vp) return () => clearTimeout(t);

    let raf = 0;
    const ro = new ResizeObserver(() => {
      if (!fitModeRef.current) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => fitToView());
    });
    ro.observe(vp);
    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [activeTemplate?.id]);

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
          originX: el.textAlign === 'center' ? 'center' : (el.textAlign === 'right' ? 'right' : 'left'),
          fontFamily: el.fontFamily || 'Inter',
          fontSize: el.fontSize || 18,
          fill: el.color || '#000000',
          fontWeight: el.fontWeight as any || 'normal',
          fontStyle: (el.fontStyle as any) || 'normal',
          textAlign: el.textAlign || 'center',
          opacity: el.opacity ?? 1,
          lockScalingX: false,
          lockScalingY: false,
        });

        // Attach custom ID tag
        (textObj as any).elementId = el.id;
        (textObj as any).rawTemplateContent = el.content;
        canvas.add(textObj);
      } else if (el.type === 'rectangle' || (el.type as string) === 'rect') {
const rectObj = new fabric.Rect({
      left: el.x,
      top: el.y,
      width: el.width,
      height: el.height,
      fill: el.backgroundColor || 'transparent',
      stroke: el.borderColor || '#000000',
      strokeWidth: el.borderWidth || 1,
      opacity: el.opacity ?? 1,
      selectable: !el.isLocked,
    });
        (rectObj as any).elementId = el.id;
        canvas.add(rectObj);
      } else if (el.type === 'line') {
const lineObj = new fabric.Line([el.x, el.y, el.x + el.width, el.y], {
      stroke: el.backgroundColor || '#000000',
      strokeWidth: el.height || 2,
      opacity: el.opacity ?? 1,
      selectable: !el.isLocked,
    });
        (lineObj as any).elementId = el.id;
        canvas.add(lineObj);
      } else if (el.type === 'image' && el.src) {
        fabric.Image.fromURL(el.src, (img) => {
          if (fabricCanvasRef.current !== canvas) return;
          img.set({
            left: el.x,
            top: el.y,
            originX: 'center',
            scaleX: el.width / (img.width || 1),
            scaleY: el.height / (img.height || 1),
            opacity: el.opacity ?? 1,
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

    setPropOpacity(obj.opacity ?? 1);
  };

  // Add Elements Handlers
  const handleAddText = () => {
    if (!fabricCanvasRef.current) return;
    const textObj = new fabric.IText('Nouveau texte d\'attestation', {
      left: 561.5,
      top: 300,
      originX: 'center',
      textAlign: 'center',
      fontFamily: 'Inter',
      fontSize: 20,
      fill: '#1e293b',
    });
    (textObj as any).elementId = `el-text-${Date.now()}`;
    (textObj as any).rawTemplateContent = 'Nouveau texte d\'attestation';
    fabricCanvasRef.current.add(textObj);
    fabricCanvasRef.current.setActiveObject(textObj);
    fabricCanvasRef.current.renderAll();
    toast.success('Bloc texte centré ajouté.');
  };

  const handleAddVariable = (variableKey: string) => {
    if (!fabricCanvasRef.current) return;
    const textContent = resolveVariableText(variableKey, currentStudent, establishment);
    const varObj = new fabric.IText(textContent, {
      left: 561.5,
      top: 350,
      originX: 'center',
      textAlign: 'center',
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
    toast.success(`Variable ${variableKey} insérée et centrée !`);
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

  const handleAddImage = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      fabric.Image.fromURL(dataUrl, (img) => {
        if (fabricCanvasRef.current !== canvas) return;
        const naturalW = img.width || 1;
        const naturalH = img.height || 1;
        const targetW = 360;
        const targetH = 240;
        const scale = Math.min(targetW / naturalW, targetH / naturalH, 1);
        img.set({
          left: 561.5,
          top: 180,
          originX: 'center',
          scaleX: scale,
          scaleY: scale,
        });
        (img as any).elementId = `el-img-${Date.now()}`;
        (img as any).src = dataUrl;
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        toast.success('Logo / Image importé(e) avec succès !');
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
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
    } else if (key === 'opacity') {
      selectedObject.set('opacity', value);
    }

    fabricCanvasRef.current.renderAll();
  };

  // Save current design state back to template
  const handleSaveTemplateState = () => {
    if (!fabricCanvasRef.current || !activeTemplate) return;

    const objects = fabricCanvasRef.current.getObjects();
    const updatedElements: TemplateElement[] = objects.map((obj) => {
      const itext = obj as fabric.IText;
      const isImage = obj.type === 'image';
      const isRect = obj.type === 'rectangle';
      const isLine = obj.type === 'line';
      return {
        id: (obj as any).elementId || `el-${Date.now()}`,
        type:
          obj.type === 'i-text' ? 'text'
          : obj.type === 'rect' ? 'rectangle'
          : (obj.type as any),
        x: Math.round(obj.left || 0),
        y: Math.round(obj.top || 0),
        width: Math.round((obj.width || 100) * (obj.scaleX || 1)),
        height: Math.round((obj.height || 50) * (obj.scaleY || 1)),
        content: (obj as any).rawTemplateContent || itext.text || '',
        fontFamily: itext.fontFamily,
        fontSize: itext.fontSize,
        fontWeight: itext.fontWeight as any,
        fontStyle: itext.fontStyle as any,
        color: itext.fill as string,
        textAlign: isImage ? undefined : itext.textAlign as any,
        backgroundColor:
          isRect || isLine
            ? ((obj as any).fill && (obj as any).fill !== 'transparent' ? (obj as any).fill : undefined)
            : undefined,
        borderColor: isRect ? ((obj as any).stroke || undefined) : undefined,
        borderWidth: isRect ? ((obj as any).strokeWidth || undefined) : undefined,
        opacity: obj.opacity ?? 1,
        ...(isImage ? { src: (obj as any).src } : {}),
      };
    });

    updateTemplateElements(activeTemplate.id, updatedElements);
    toast.success('Modèle d\'attestation sauvegardé avec succès !');
  };

  // Substitute a student's variable values onto the live canvas, then return a pixel-perfect snapshot.
  // This is the WYSIWYG source of truth for exported PDFs (same fonts, weights, borders and placement).
  const applyStudentSnapshot = (std: Student): string | undefined => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return undefined;

    canvas.getObjects().forEach((obj) => {
      if (obj.type !== 'i-text' && obj.type !== 'textbox') return;
      const raw = (obj as any).rawTemplateContent;
      if (typeof raw === 'string') {
        const resolved = resolveVariableText(raw, std, establishment);
        const itext = obj as fabric.IText;
        if (itext.text !== resolved) {
          itext.set('text', resolved);
        }
      }
    });
    canvas.renderAll();
    return canvas.toDataURL();
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

    try {
      for (let i = 0; i < listToGenerate.length; i++) {
        const std = listToGenerate[i];

        // Render the edited canvas with this student's data and embed it 1:1 in the PDF
        const canvasDataUrl = applyStudentSnapshot(std);

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
        await new Promise((res) => setTimeout(res, 30));
      }
    } finally {
      // Restore the editor preview to the originally selected student
      applyStudentSnapshot(currentStudent);
      fabricCanvasRef.current?.requestRenderAll();
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

    toast.success(`${generatedFiles.length} attestations PDF HD générées avec succès !`);
  };

  return (
    <div className="flex flex-col space-y-3" style={{ height: 'calc(100vh - 150px)', minHeight: 440 }}>
      {/* Top Action & Preview Controls */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3 rounded-2xl border backdrop-blur-md shadow-md ${
        isLight ? 'bg-white border-slate-200 shadow-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}>
        {/* Template Selector & Live Preview Student Dropdown */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${t.textSecondary}`}>Modèle actif :</span>
            <select
              value={activeTemplate?.id || ''}
              onChange={(e) => setActiveTemplateId(e.target.value)}
              className={`text-xs font-bold rounded-xl px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isLight ? 'bg-slate-100 border-slate-300 text-slate-900' : 'bg-slate-800 text-slate-100 border-slate-700'
              }`}
            >
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} ({tmpl.category || 'Attestation'})
                </option>
              ))}
            </select>
          </div>

          <div className={`flex items-center gap-2 border-l pl-4 ${t.border}`}>
            <User className="w-4 h-4 text-indigo-500" />
            <span className={`text-xs font-semibold ${t.textSecondary}`}>Aperçu avec :</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className={`text-xs font-bold rounded-xl px-3 py-1.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isLight ? 'bg-indigo-50/70 text-indigo-700 border-indigo-200' : 'bg-slate-800 text-indigo-300 border-indigo-500/30'
              }`}
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
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isLight
                ? 'text-slate-700 bg-slate-100 hover:bg-slate-200 border-slate-300'
                : 'text-slate-200 bg-slate-800 hover:bg-slate-700 border-slate-700'
            }`}
          >
            <Save className="w-4 h-4 text-emerald-500" />
            Enregistrer Modèle
          </button>

          <button
            onClick={handleStartBulkGeneration}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Cpu className="w-4 h-4" />
            Générer ({studentsList.length || 1} PDF)
          </button>
        </div>
      </div>

      {/* Main Studio Editor Workspace (Library - Canvas - Inspector) */}
      <div ref={studioContainerRef} className="flex gap-0 w-full flex-1 min-h-0">
        {/* Left Toolbar: Elements Library */}
        {!isExpandedWorkspace && (
          <div
            className="flex-shrink-0 overflow-y-auto"
            style={{ width: leftPanelWidth, minWidth: 180, maxWidth: '35%', transition: resizingRef.current === 'left' ? 'none' : 'width 0.05s' }}
          >
            <div className="pr-3 space-y-4 h-full">
            <div className={`p-4 rounded-2xl border space-y-4 shadow-md ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${t.textPrimary}`}>
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Bibliothèque d'Éléments
              </h3>

              <div className="space-y-2">
                <button
                  onClick={handleAddText}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold border transition-colors ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                  }`}
                >
                  <Type className="w-4 h-4 text-indigo-500" />
                  Ajouter un Bloc Texte
                </button>

                <button
                  onClick={handleAddBorderFrame}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold border transition-colors ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                  }`}
                >
                  <Square className="w-4 h-4 text-amber-500" />
                  Ajouter Cadre / Bordure
                </button>

                <button
                  onClick={handleAddImage}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-semibold border transition-colors ${
                    isLight
                      ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/80'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-sky-500" />
                  Importer un Logo / Image
                </button>

                {/* Hidden file input for image import */}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageFileSelected}
                />
              </div>

              {/* Dynamic Variables Quick Inserter */}
              <div className={`pt-3 border-t space-y-2 ${t.border}`}>
                <span className={`text-[11px] font-bold uppercase tracking-wider block ${t.textSecondary}`}>
                  Insérer une Variable
                </span>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <button
                      key={v.key}
                      onClick={() => handleAddVariable(v.key)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs border transition-colors text-left ${
                        isLight
                          ? 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                          : 'bg-slate-950/60 hover:bg-indigo-950/40 text-slate-300 border-slate-800 hover:border-indigo-500/30'
                      }`}
                    >
                      <span className="font-bold text-indigo-500">{v.key}</span>
                      <span className={`text-[10px] ${t.textMuted}`}>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* Left Resizer Divider */}
        {!isExpandedWorkspace && (
          <div
            onMouseDown={handleResizerMouseDown('left')}
            className="group flex-shrink-0 w-2 flex items-center justify-center cursor-col-resize relative z-10"
            title="Glisser pour redimensionner"
          >
            <div className={`w-0.5 h-full rounded-full transition-all group-hover:w-1 group-active:w-1 ${
              isLight ? 'bg-slate-200 group-hover:bg-indigo-400' : 'bg-slate-700 group-hover:bg-indigo-500'
            }`} />
            <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
              isLight ? 'bg-indigo-100 text-indigo-500' : 'bg-slate-700 text-slate-400'
            }`}>
              <span className="text-[9px] leading-none rotate-90 font-bold tracking-widest select-none">⋮⋮</span>
            </div>
          </div>
        )}

        {/* Center: Canvas A4 Landscape Representation */}
        <div className="flex-1 min-w-0 flex flex-col items-center justify-start space-y-2 overflow-hidden">
          
          {/* Zoom & Workspace Control Bar */}
          <div className={`w-full flex flex-wrap items-center justify-between gap-2 p-2 rounded-2xl border text-xs shadow-md ${
            isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-slate-900/80 border-slate-800 text-slate-300'
          }`}>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`font-semibold px-2 ${t.textSecondary}`}>Zoom :</span>
              <button
                onClick={() => applyZoom(zoomScale - 0.05)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Dézoomer (-5%)"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              <select
                value={zoomScale}
                onChange={(e) => applyZoom(parseFloat(e.target.value))}
                className={`font-bold rounded-lg px-2.5 py-1 border text-xs focus:outline-none ${
                  isLight
                    ? 'bg-slate-100 text-indigo-700 border-slate-300'
                    : 'bg-slate-950 text-indigo-300 border-slate-700'
                }`}
              >
                <option value={0.45}>45% (Aperçu global)</option>
                <option value={0.55}>55% (Compact)</option>
                <option value={0.65}>65% (Ajusté Écran)</option>
                <option value={0.75}>75% (HD Net)</option>
                <option value={0.85}>85% (Grand HD)</option>
                <option value={1.0}>100% (Taille Réelle A4 1:1 HD)</option>
                <option value={1.25}>125% (Zoom Précision)</option>
              </select>

              <button
                onClick={() => applyZoom(zoomScale + 0.05)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Zoomer (+5%)"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={fitToView}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] border transition-colors ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Ajuster
              </button>

              <button
                onClick={() => setIsPanMode(!isPanMode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors text-[11px] font-bold ${
                  isPanMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Activer le mode Main (Pan) pour glisser librement dans l'attestation (ou maintenez la touche Espace)"
              >
                <Hand className="w-3.5 h-3.5" />
                Mode Main (Pan)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const next = !isExpandedWorkspace;
                  setIsExpandedWorkspace(next);
                  if (next && zoomScale < 0.85) {
                    applyZoom(0.85);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors text-[11px] font-semibold ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
                title="Agrandir la zone d'édition pour une netteté maximale"
              >
                {isExpandedWorkspace ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 text-amber-500" />
                    Réduire Studio
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5 text-amber-500" />
                    Agrandir Studio (Plein Écran)
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Canvas Scrollable Viewport with Left/Right & Top/Bottom Navigation */}
          <div
            ref={viewportRef}
            onMouseDown={handleViewportMouseDown}
            onMouseMove={handleViewportMouseMove}
            onMouseUp={handleViewportMouseUp}
            onMouseLeave={handleViewportMouseUp}
            className={`studio-scroll-viewport relative w-full flex-1 min-h-0 border rounded-3xl shadow-2xl overflow-auto select-none transition-colors ${
              isPanMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            } ${isLight ? 'bg-slate-200/90 border-slate-300' : 'bg-slate-900 border-slate-800'}`}
          >
            {/* Inner Centered Container */}
            <div className="min-w-fit min-h-fit p-6 sm:p-10 flex items-center justify-center m-auto">
              <div
                className="border border-slate-300/40 shadow-2xl rounded-sm overflow-hidden bg-white transition-all duration-200"
                style={{ imageRendering: '-webkit-optimize-contrast' }}
              >
                <canvas ref={canvasRef} className="block" />
              </div>
            </div>

            {/* Floating Navigation D-Pad & Controls Overlay */}
            <div className="sticky bottom-4 left-4 z-20 inline-flex items-center gap-1.5 p-2 rounded-2xl bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700/80 backdrop-blur-md shadow-2xl text-slate-200">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-1.5 flex items-center gap-1">
                <Move className="w-3 h-3 text-indigo-400" />
                Naviguer :
              </span>

              {/* Directional Buttons (Left, Up, Down, Right, Center) */}
              <button
                onClick={() => scrollCanvas('left')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-300 transition-colors"
                title="Défiler vers la Gauche (⬅️)"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => scrollCanvas('up')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-300 transition-colors"
                title="Défiler vers le Haut (⬆️)"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => scrollCanvas('down')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-300 transition-colors"
                title="Défiler vers le Bas (⬇️)"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => scrollCanvas('right')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 text-slate-300 transition-colors"
                title="Défiler vers la Droite (➡️)"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-[1px] bg-slate-700 mx-1" />

              <button
                onClick={() => scrollCanvas('center')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] shadow-sm transition-colors"
                title="Recadrer et centrer l'attestation"
              >
                <Crosshair className="w-3.5 h-3.5" />
                Centrer
              </button>
            </div>
          </div>
        </div>

        {/* Right Resizer Divider */}
        <div
          onMouseDown={handleResizerMouseDown('right')}
          className="group flex-shrink-0 w-2 flex items-center justify-center cursor-col-resize relative z-10"
          title="Glisser pour redimensionner"
        >
          <div className={`w-0.5 h-full rounded-full transition-all group-hover:w-1 group-active:w-1 ${
            isLight ? 'bg-slate-200 group-hover:bg-indigo-400' : 'bg-slate-700 group-hover:bg-indigo-500'
          }`} />
          <div className={`absolute top-1/2 -translate-y-1/2 w-5 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${
            isLight ? 'bg-indigo-100 text-indigo-500' : 'bg-slate-700 text-slate-400'
          }`}>
            <span className="text-[9px] leading-none rotate-90 font-bold tracking-widest select-none">⋮⋮</span>
          </div>
        </div>

        {/* Right Inspector: Properties Panel */}
        <div
          className="flex-shrink-0 overflow-y-auto"
          style={{ width: rightPanelWidth, minWidth: 200, maxWidth: '40%', transition: resizingRef.current === 'right' ? 'none' : 'width 0.05s' }}
        >
          <div className="pl-3 space-y-4 h-full">
          <div className={`p-4 rounded-2xl border space-y-4 shadow-md ${
            isLight ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-bold text-xs uppercase tracking-wider flex items-center gap-2 ${t.textPrimary}`}>
                <Palette className="w-4 h-4 text-emerald-500" />
                Propriétés de l'Élément
              </h3>
              {selectedObject && (
                <button
                  onClick={handleDeleteSelected}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isLight ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-rose-400 hover:bg-rose-500/10'
                  }`}
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
                  <label className={`block text-[11px] font-semibold mb-1 ${t.textSecondary}`}>
                    Texte ou Variable
                  </label>
                  <textarea
                    rows={3}
                    value={propText}
                    onChange={(e) => {
                      setPropText(e.target.value);
                      updateSelectedProperty('text', e.target.value);
                    }}
                    className={`w-full text-xs rounded-xl p-2.5 border focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
                  />
                </div>

                {/* Font Family */}
                <div>
                  <label className={`block text-[11px] font-semibold mb-1 ${t.textSecondary}`}>
                    Police typographique
                  </label>
                  <select
                    value={propFontFamily}
                    onChange={(e) => {
                      setPropFontFamily(e.target.value);
                      updateSelectedProperty('fontFamily', e.target.value);
                    }}
                    className={`w-full text-xs rounded-xl p-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isLight
                        ? 'bg-slate-50 border-slate-300 text-slate-900'
                        : 'bg-slate-950 border-slate-800 text-slate-100'
                    }`}
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
                    <label className={`block text-[11px] font-semibold mb-1 ${t.textSecondary}`}>
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
                      className={`w-full text-xs rounded-xl p-2 border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isLight
                          ? 'bg-slate-50 border-slate-300 text-slate-900'
                          : 'bg-slate-950 border-slate-800 text-slate-100'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[11px] font-semibold mb-1 ${t.textSecondary}`}>
                      Couleur
                    </label>
                    <input
                      type="color"
                      value={propColor}
                      onChange={(e) => {
                        setPropColor(e.target.value);
                        updateSelectedProperty('color', e.target.value);
                      }}
                      className={`w-full h-9 rounded-xl border cursor-pointer ${
                        isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'
                      }`}
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
                      propBold
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
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
                      propItalic
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : isLight
                          ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    I (Italique)
                  </button>
                </div>

                {/* Opacity */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className={`block text-[11px] font-semibold ${t.textSecondary}`}>
                      Opacité
                    </label>
                    <span className="text-[11px] font-bold text-indigo-500 font-mono">
                      {Math.round(propOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={propOpacity}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setPropOpacity(val);
                      updateSelectedProperty('opacity', val);
                    }}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <p className={`text-xs text-center py-6 ${t.textMuted}`}>
                Cliquez sur n'importe quel élément de l'attestation pour le personnaliser.
              </p>
            )}
          </div>
          </div>
        </div>
      </div>

      {/* Generation Progress & ZIP Download Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-full max-w-lg border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mx-auto shadow-inner">
              <Cpu className="w-8 h-8 animate-spin" />
            </div>

            <div>
              <h3 className={`text-xl font-bold font-outfit ${t.textPrimary}`}>
                {generationProgress < 100
                  ? 'Génération des Attestations en cours...'
                  : 'Génération Terminée avec Succès ! 🎉'}
              </h3>
              <p className={`text-xs mt-1 ${t.textSecondary}`}>
                {generatedCount} / {studentsList.length || 1} attestations créées
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
                isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700'
              }`}>
                <motion.div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${generationProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <span className="text-xs font-bold text-indigo-500 font-mono">
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
                  className={`w-full sm:w-auto px-4 py-3 rounded-2xl font-semibold text-xs border transition-colors ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
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
