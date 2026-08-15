import * as XLSX from 'xlsx';
import { Student, StudentColumnMapping } from '../types/student';

export interface ParsedExcelResult {
  sheetNames: string[];
  activeSheet: string;
  columns: string[];
  rows: Record<string, any>[];
  suggestedMappings: StudentColumnMapping[];
}

export function parseExcelFile(fileBuffer: ArrayBuffer, fileName: string): ParsedExcelResult {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames;
  const firstSheet = sheetNames[0] || 'Feuille1';
  const worksheet = workbook.Sheets[firstSheet];

  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  let columns: string[] = [];
  if (rawRows.length > 0) {
    columns = Object.keys(rawRows[0]);
  }

  const suggestedMappings = autoDetectColumnMappings(columns);

  return {
    sheetNames,
    activeSheet: firstSheet,
    columns,
    rows: rawRows,
    suggestedMappings,
  };
}

export function autoDetectColumnMappings(columns: string[]): StudentColumnMapping[] {
  const mappings: StudentColumnMapping[] = [];

  columns.forEach((col) => {
    const colLower = col.toLowerCase().trim();
    let target = 'customData';

    if (colLower.includes('nom') && !colLower.includes('prenom') && !colLower.includes('prénom')) {
      target = 'nom';
    } else if (colLower.includes('prenom') || colLower.includes('prénom')) {
      target = 'prenom';
    } else if (colLower.includes('nom complet') || colLower.includes('etudiant') || colLower.includes('étudiant')) {
      target = 'nom_complet';
    } else if (colLower.includes('matricule') || colLower.includes('id') || colLower.includes('code')) {
      target = 'matricule';
    } else if (colLower.includes('formation') || colLower.includes('cours') || colLower.includes('programme')) {
      target = 'formation';
    } else if (colLower.includes('specialite') || colLower.includes('spécialité') || colLower.includes('option')) {
      target = 'specialite';
    } else if (colLower.includes('note')) {
      target = 'note';
    } else if (colLower.includes('moyenne')) {
      target = 'moyenne';
    } else if (colLower.includes('mention')) {
      target = 'mention';
    } else if (colLower.includes('rang') || colLower.includes('classement')) {
      target = 'rang';
    } else if (colLower.includes('duree') || colLower.includes('durée')) {
      target = 'duree';
    } else if (colLower.includes('annee') || colLower.includes('année')) {
      target = 'annee';
    } else if (colLower.includes('date')) {
      target = 'date_obtention';
    } else if (colLower.includes('email') || colLower.includes('courriel')) {
      target = 'email';
    }

    mappings.push({
      excelColumn: col,
      targetVariable: target,
    });
  });

  return mappings;
}

export function mapRowsToStudents(
  rows: Record<string, any>[],
  mappings: StudentColumnMapping[],
  numberingConfig?: { enabled: boolean; prefix: string; startNumber: number; digitsCount: number }
): Student[] {
  return rows.map((row, index) => {
    const student: Student = {
      id: `student-${Date.now()}-${index}`,
      nom: '',
      prenom: '',
      customData: {},
      isValid: true,
      errors: [],
    };

    mappings.forEach((m) => {
      const val = row[m.excelColumn] !== undefined ? String(row[m.excelColumn]).trim() : '';

      if (m.targetVariable === 'nom') {
        student.nom = val;
      } else if (m.targetVariable === 'prenom') {
        student.prenom = val;
      } else if (m.targetVariable === 'nom_complet') {
        student.nom_complet = val;
      } else if (m.targetVariable === 'matricule') {
        student.matricule = val;
      } else if (m.targetVariable === 'formation') {
        student.formation = val;
      } else if (m.targetVariable === 'specialite') {
        student.specialite = val;
      } else if (m.targetVariable === 'note') {
        student.note = val;
      } else if (m.targetVariable === 'moyenne') {
        student.moyenne = val;
      } else if (m.targetVariable === 'mention') {
        student.mention = val;
      } else if (m.targetVariable === 'rang') {
        student.rang = val;
      } else if (m.targetVariable === 'duree') {
        student.duree = val;
      } else if (m.targetVariable === 'annee') {
        student.annee = val;
      } else if (m.targetVariable === 'date_obtention') {
        student.date_obtention = val;
      } else if (m.targetVariable === 'email') {
        student.email = val;
      } else if (m.targetVariable && m.targetVariable !== 'ignore') {
        student.customData![m.targetVariable] = val;
      }
    });

    // Auto compute full name if missing
    if (!student.nom_complet) {
      if (student.prenom && student.nom) {
        student.nom_complet = `${student.prenom} ${student.nom.toUpperCase()}`;
      } else if (student.nom) {
        student.nom_complet = student.nom;
      } else {
        student.nom_complet = student.prenom || 'Étudiant Anonyme';
      }
    }

    // Assign automatic numbering if enabled
    if (numberingConfig && numberingConfig.enabled) {
      const numVal = numberingConfig.startNumber + index;
      const numPadded = String(numVal).padStart(numberingConfig.digitsCount || 3, '0');
      student.numero_attestation = `${numberingConfig.prefix || 'CERT-'}${numPadded}`;
    }

    // Validation
    const errors: string[] = [];
    if (!student.nom && !student.prenom && !student.nom_complet) {
      errors.push('Nom ou Prénom manquant');
    }
    if (!student.formation) {
      errors.push('Intitulé de formation manquant');
    }

    if (errors.length > 0) {
      student.isValid = false;
      student.errors = errors;
    } else {
      student.isValid = true;
    }

    return student;
  });
}
