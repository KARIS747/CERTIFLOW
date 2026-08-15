import { Student, StudentColumnMapping } from './student';

export interface NumberingConfig {
  enabled: boolean;
  prefix: string;
  startNumber: number;
  digitsCount: number;
  year?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  fileName?: string;
  fileRawData?: any[]; // Raw excel sheet rows
  students: Student[];
  columnMappings: StudentColumnMapping[];
  templateId?: string;
  numberingConfig: NumberingConfig;
  outputNamingPattern: string; // e.g. "{{nom}}_{{prenom}}_attestation.pdf"
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'configured' | 'ready' | 'generated';
  generatedCount?: number;
}
