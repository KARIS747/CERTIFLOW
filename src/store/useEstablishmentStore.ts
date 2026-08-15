import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Establishment, Signature } from '../types/establishment';
import { DEFAULT_ESTABLISHMENT } from '../lib/sampleData';

interface EstablishmentState {
  establishment: Establishment;
  updateEstablishment: (data: Partial<Establishment>) => void;
  addSignature: (sig: Signature) => void;
  removeSignature: (id: string) => void;
  resetToDefault: () => void;
}

export const useEstablishmentStore = create<EstablishmentState>()(
  persist(
    (set) => ({
      establishment: DEFAULT_ESTABLISHMENT,
      updateEstablishment: (data) =>
        set((state) => ({
          establishment: { ...state.establishment, ...data },
        })),
      addSignature: (sig) =>
        set((state) => ({
          establishment: {
            ...state.establishment,
            signatures: [...state.establishment.signatures, sig],
          },
        })),
      removeSignature: (id) =>
        set((state) => ({
          establishment: {
            ...state.establishment,
            signatures: state.establishment.signatures.filter((s) => s.id !== id),
          },
        })),
      resetToDefault: () => set({ establishment: DEFAULT_ESTABLISHMENT }),
    }),
    {
      name: 'certiflow-establishment-storage',
    }
  )
);
