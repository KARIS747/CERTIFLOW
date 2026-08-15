import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return new Date().toLocaleDateString('fr-FR');
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
}

export const AVAILABLE_VARIABLES = [
  { key: '{{nom}}', label: 'Nom de famille', example: 'DUPONT' },
  { key: '{{prenom}}', label: 'Prénom', example: 'Jean-Pierre' },
  { key: '{{nom_complet}}', label: 'Nom & Prénom', example: 'Jean-Pierre DUPONT' },
  { key: '{{matricule}}', label: 'Matricule / Identifiant', example: 'MAT-2026-889' },
  { key: '{{formation}}', label: 'Intitulé Formation', example: 'Développement Web & IA' },
  { key: '{{specialite}}', label: 'Spécialité / Option', example: 'Génie Logiciel' },
  { key: '{{note}}', label: 'Note finale (/20)', example: '17.5' },
  { key: '{{moyenne}}', label: 'Moyenne générale', example: '16.8/20' },
  { key: '{{mention}}', label: 'Mention attribuée', example: 'Très Bien' },
  { key: '{{rang}}', label: 'Rang de classement', example: '1er / 45' },
  { key: '{{duree}}', label: 'Durée de formation', example: '450 heures (6 mois)' },
  { key: '{{annee}}', label: 'Année civile', example: '2026' },
  { key: '{{annee_academique}}', label: 'Année académique', example: '2025-2026' },
  { key: '{{date}}', label: 'Date du jour', example: '15 août 2026' },
  { key: '{{date_obtention}}', label: 'Date d\'obtention', example: '30 juin 2026' },
  { key: '{{numero}}', label: 'Numéro d\'attestation', example: 'CERT-2026-001' },
];
