export type ElementType = 'text' | 'variable' | 'image' | 'line' | 'rectangle' | 'circle' | 'signature' | 'badge';

export interface TemplateElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string; // Text content or variable tag e.g. "{{nom_complet}}"
  variableName?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontStyle?: 'normal' | 'italic';
  textAlign?: 'left' | 'center' | 'right';
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  opacity?: number;
  src?: string; // image src (data URL or path)
  isLocked?: boolean;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category?: 'attestation' | 'certificat' | 'diplome' | 'sur_mesure';
  pageSize: 'A4';
  orientation: 'landscape' | 'portrait';
  dimensions: {
    width: number; // e.g. 1123 px or 297 mm
    height: number; // e.g. 794 px or 210 mm
  };
  elements: TemplateElement[];
  fabricCanvasState?: string; // Fabric JSON representation
  previewUrl?: string;
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
  themeColor?: string;
}
