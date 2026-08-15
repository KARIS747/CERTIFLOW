export interface Student {
  id: string;
  nom: string;
  prenom: string;
  nom_complet?: string;
  email?: string;
  matricule?: string;
  formation?: string;
  specialite?: string;
  note?: string | number;
  moyenne?: string | number;
  mention?: string;
  rang?: string | number;
  duree?: string;
  annee?: string | number;
  annee_academique?: string;
  date_obtention?: string;
  numero_attestation?: string;
  customData?: Record<string, string | number>;
  isValid?: boolean;
  errors?: string[];
}

export type StudentColumnMapping = {
  excelColumn: string;
  targetVariable: keyof Student | string;
};
