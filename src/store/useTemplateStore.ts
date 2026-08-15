import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Template, TemplateElement } from '../types/template';
import { DEFAULT_TEMPLATES } from '../lib/sampleData';

interface TemplateState {
  templates: Template[];
  activeTemplateId: string | null;
  activeTemplate: Template | null;
  setActiveTemplateId: (id: string | null) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, data: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => void;
  updateTemplateElements: (id: string, elements: TemplateElement[]) => void;
  resetTemplates: () => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: DEFAULT_TEMPLATES,
      activeTemplateId: DEFAULT_TEMPLATES[0].id,
      activeTemplate: DEFAULT_TEMPLATES[0],

      setActiveTemplateId: (id) => {
        const found = get().templates.find((t) => t.id === id) || null;
        set({ activeTemplateId: id, activeTemplate: found });
      },

      addTemplate: (newTmpl) => {
        set((state) => ({
          templates: [newTmpl, ...state.templates],
          activeTemplateId: newTmpl.id,
          activeTemplate: newTmpl,
        }));
      },

      updateTemplate: (id, data) => {
        set((state) => {
          const updated = state.templates.map((t) =>
            t.id === id ? { ...t, ...data, updatedAt: new Date().toISOString() } : t
          );
          const currentActive = state.activeTemplateId === id
            ? updated.find((t) => t.id === id) || null
            : state.activeTemplate;
          return { templates: updated, activeTemplate: currentActive };
        });
      },

      deleteTemplate: (id) => {
        set((state) => {
          const filtered = state.templates.filter((t) => t.id !== id);
          const nextActiveId = filtered[0]?.id || null;
          const nextActive = filtered[0] || null;
          return {
            templates: filtered,
            activeTemplateId: nextActiveId,
            activeTemplate: nextActive,
          };
        });
      },

      duplicateTemplate: (id) => {
        const target = get().templates.find((t) => t.id === id);
        if (!target) return;
        const duplicated: Template = {
          ...target,
          id: `tmpl-${Date.now()}`,
          name: `${target.name} (Copie)`,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          templates: [duplicated, ...state.templates],
          activeTemplateId: duplicated.id,
          activeTemplate: duplicated,
        }));
      },

      updateTemplateElements: (id, elements) => {
        get().updateTemplate(id, { elements });
      },

      resetTemplates: () => set({
        templates: DEFAULT_TEMPLATES,
        activeTemplateId: DEFAULT_TEMPLATES[0].id,
        activeTemplate: DEFAULT_TEMPLATES[0],
      }),
    }),
    {
      name: 'certiflow-templates-storage',
    }
  )
);
