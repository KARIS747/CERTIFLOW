export interface Signature {
  id: string;
  title: string; // e.g. "Le Directeur Général"
  signatoryName: string; // e.g. "Dr. Alexandre Vance"
  imageDataUrl?: string;
}

export interface Establishment {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logoDataUrl?: string;
  stampDataUrl?: string;
  slogan?: string;
  directorName?: string;
  signatures: Signature[];
}
