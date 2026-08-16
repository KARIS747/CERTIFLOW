import jsPDF, { GState } from 'jspdf';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Student } from '../types/student';
import { Template } from '../types/template';
import { Establishment } from '../types/establishment';
import { sanitizeFileName } from './utils';

export function resolveVariableText(
  rawText: string,
  student: Student,
  establishment?: Establishment
): string {
  let result = rawText;

  const vars: Record<string, string> = {
    '{{nom}}': student.nom || '',
    '{{prenom}}': student.prenom || '',
    '{{nom_complet}}': student.nom_complet || `${student.prenom || ''} ${student.nom || ''}`.trim(),
    '{{matricule}}': student.matricule || '',
    '{{formation}}': student.formation || 'Formation Générale',
    '{{specialite}}': student.specialite || '',
    '{{note}}': String(student.note || ''),
    '{{moyenne}}': String(student.moyenne || ''),
    '{{mention}}': student.mention || 'Satisfaisant',
    '{{rang}}': String(student.rang || ''),
    '{{duree}}': student.duree || '',
    '{{annee}}': String(student.annee || new Date().getFullYear()),
    '{{annee_academique}}': student.annee_academique || `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
    '{{date}}': new Date().toLocaleDateString('fr-FR'),
    '{{date_obtention}}': student.date_obtention || new Date().toLocaleDateString('fr-FR'),
    '{{numero}}': student.numero_attestation || student.matricule || 'CERT-2026-000',
    '{{etablissement_nom}}': establishment?.name || 'Établissement',
    '{{etablissement_adresse}}': establishment?.address || '',
    '{{directeur_nom}}': establishment?.directorName || '',
  };

  // Replace standard variables
  Object.entries(vars).forEach(([key, val]) => {
    result = result.replace(new RegExp(key.replace(/[{()}]/g, '\\$&'), 'g'), val);
  });

  // Replace custom data variables
  if (student.customData) {
    Object.entries(student.customData).forEach(([key, val]) => {
      const tag = `{{${key}}}`;
      result = result.replace(new RegExp(tag.replace(/[{()}]/g, '\\$&'), 'g'), String(val));
    });
  }

  return result;
}

export function generateSinglePDFBlob(
  template: Template,
  student: Student,
  establishment?: Establishment,
  fabricCanvasDataUrl?: string
): any {
  // A4 Landscape is 297mm x 210mm
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 297;
  const pageHeight = 210;

  if (fabricCanvasDataUrl) {
    // If a rendered canvas data URL is passed, draw high resolution image covering A4
    doc.addImage(fabricCanvasDataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
  } else {
    // Fallback: render template elements vectorially via jsPDF
    const scaleX = pageWidth / (template.dimensions.width || 1123);
    const scaleY = pageHeight / (template.dimensions.height || 794);

    // Default white background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    template.elements.forEach((el) => {
      const x = el.x * scaleX;
      const y = el.y * scaleY;
      const w = el.width * scaleX;
      const h = el.height * scaleY;

      if (el.type === 'rectangle' || (el.type as string) === 'rect') {
        if (el.backgroundColor && el.backgroundColor !== 'transparent') {
          doc.setFillColor(el.backgroundColor);
          doc.rect(x, y, w, h, 'F');
        }
        if (el.borderColor && el.borderWidth) {
          doc.setDrawColor(el.borderColor);
          doc.setLineWidth(el.borderWidth * scaleX);
          doc.rect(x, y, w, h, 'D');
        }
      } else if (el.type === 'line') {
        doc.setDrawColor(el.backgroundColor || '#000000');
        doc.setLineWidth((el.height || 2) * scaleY);
        doc.line(x, y, x + w, y);
      } else if (el.type === 'text' || el.type === 'variable') {
        const textContent = resolveVariableText(el.content || '', student, establishment);
        const lines = textContent.split('\n');

        const fw = el.fontWeight;
        const isBold =
          fw === 'bold' ||
          fw === '600' ||
          fw === '700' ||
          fw === '800' ||
          fw === 600 ||
          fw === 700 ||
          fw === 800;
        const isItalic = el.fontStyle === 'italic';

        // Map to a jsPDF core font: serif for prestige families, sans for the rest
        const baseFont = ['Cinzel', 'Playfair Display', 'Times'].includes(el.fontFamily || '')
          ? 'times'
          : 'helvetica';
        const fontStyle =
          isBold && isItalic ? 'bolditalic' : isBold ? 'bold' : isItalic ? 'italic' : 'normal';
        doc.setFont(baseFont, fontStyle);

        doc.setTextColor(el.color || '#000000');
        const fontSizePt = Math.max(8, Math.round((el.fontSize || 14) * 0.75 * scaleY));
        doc.setFontSize(fontSizePt);

        // Simple alignment calculation
        let alignOption: 'left' | 'center' | 'right' = el.textAlign || 'left';
        let posX = x;
        if (alignOption === 'center') posX = x;
        else if (alignOption === 'right') posX = x + w;

        lines.forEach((lineText, lineIdx) => {
          const lineY = y + lineIdx * (fontSizePt * 0.45 + 2);
          doc.text(lineText, posX, lineY, {
            align: alignOption,
          });
        });
      } else if (el.type === 'image' && el.src) {
        try {
          const flavor = (el.src.match(/data:(.*?)[;,]/) || [])[1];
          const format = flavor === 'image/jpeg' ? 'JPEG'
            : flavor === 'image/webp' ? 'WEBP'
            : 'PNG';
          const opacity = el.opacity ?? 1;
          if (opacity < 1) {
            doc.setGState(new GState({ opacity }));
          }
          doc.addImage(el.src, format, x, y, w, h);
          if (opacity < 1) {
            doc.setGState(new GState({ opacity: 1 }));
          }
        } catch (e) {
          console.warn('Could not add image element to PDF', e);
        }
      }
    });
  }

  return doc;
}

export function computeOutputFileName(pattern: string, student: Student): string {
  let fileName = resolveVariableText(pattern, student);
  if (!fileName.endsWith('.pdf')) {
    fileName += '.pdf';
  }
  return sanitizeFileName(fileName);
}

export async function createZipArchive(
  files: { fileName: string; pdfBytes: Uint8Array }[]
): Promise<Blob> {
  const zip = new JSZip();

  files.forEach((file) => {
    zip.file(file.fileName, file.pdfBytes);
  });

  return await zip.generateAsync({ type: 'blob' });
}

export function downloadZip(zipBlob: Blob, zipName: string = 'Attestations_CertiFlow.zip') {
  saveAs(zipBlob, zipName);
}
