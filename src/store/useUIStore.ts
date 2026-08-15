import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MainTab = 'home' | 'projects' | 'import' | 'editor' | 'templates' | 'settings';

interface UIState {
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  
  isOnboardingCompleted: boolean;
  setIsOnboardingCompleted: (completed: boolean) => void;
  showOnboardingModal: boolean;
  setShowOnboardingModal: (show: boolean) => void;

  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => void;

  isGenerationModalOpen: boolean;
  setIsGenerationModalOpen: (open: boolean) => void;

  wizardStep: number;
  setWizardStep: (step: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      isOnboardingCompleted: false,
      setIsOnboardingCompleted: (completed) => set({ isOnboardingCompleted: completed }),
      showOnboardingModal: false,
      setShowOnboardingModal: (show) => set({ showOnboardingModal: show }),

      theme: 'dark',
      setTheme: (theme) => set({ theme }),

      isGenerationModalOpen: false,
      setIsGenerationModalOpen: (open) => set({ isGenerationModalOpen: open }),

      wizardStep: 1,
      setWizardStep: (step) => set({ wizardStep: step }),
    }),
    {
      name: 'certiflow-ui-storage',
    }
  )
);
