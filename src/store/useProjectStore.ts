import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, NumberingConfig } from '../types/project';
import { Student, StudentColumnMapping } from '../types/student';
import { SAMPLE_STUDENTS } from '../lib/sampleData';

interface ProjectState {
  projects: Project[];
  activeProjectId: string | null;
  activeProject: Project | null;
  
  setActiveProjectId: (id: string | null) => void;
  createProject: (name: string, description?: string) => Project;
  loadDemoProject: () => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  setProjectStudents: (projectId: string, students: Student[]) => void;
  updateStudent: (projectId: string, studentId: string, data: Partial<Student>) => void;
  deleteStudent: (projectId: string, studentId: string) => void;
  setColumnMappings: (projectId: string, mappings: StudentColumnMapping[]) => void;
  setNumberingConfig: (projectId: string, config: NumberingConfig) => void;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      activeProjectId: null,
      activeProject: null,

      setActiveProjectId: (id) => {
        const found = get().projects.find((p) => p.id === id) || null;
        set({ activeProjectId: id, activeProject: found });
      },

      createProject: (name, description) => {
        const newProj: Project = {
          id: `proj-${Date.now()}`,
          name: name.trim() || 'Nouveau Projet',
          description,
          students: [],
          columnMappings: [],
          numberingConfig: {
            enabled: true,
            prefix: 'CERT-2026-',
            startNumber: 1,
            digitsCount: 3,
          },
          outputNamingPattern: '{{nom}}_{{prenom}}_attestation.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'draft',
        };

        set((state) => ({
          projects: [newProj, ...state.projects],
          activeProjectId: newProj.id,
          activeProject: newProj,
        }));

        return newProj;
      },

      loadDemoProject: () => {
        const existing = get().projects.find((p) => p.name.includes('Promotion Informatique 2026'));
        if (existing) {
          get().setActiveProjectId(existing.id);
          return existing;
        }

        const demoProj: Project = {
          id: `proj-demo-2026`,
          name: 'Promotion Informatique 2026 (Démo)',
          description: 'Projet de démonstration pré-chargé avec 10 étudiants qualifiés.',
          students: SAMPLE_STUDENTS,
          columnMappings: [
            { excelColumn: 'Nom', targetVariable: 'nom' },
            { excelColumn: 'Prénom', targetVariable: 'prenom' },
            { excelColumn: 'Formation', targetVariable: 'formation' },
            { excelColumn: 'Moyenne', targetVariable: 'moyenne' },
            { excelColumn: 'Mention', targetVariable: 'mention' },
          ],
          templateId: 'tmpl-excellence-gold',
          numberingConfig: {
            enabled: true,
            prefix: 'ATT-2026-',
            startNumber: 1,
            digitsCount: 3,
          },
          outputNamingPattern: '{{nom}}_{{prenom}}_attestation.pdf',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'ready',
        };

        set((state) => ({
          projects: [demoProj, ...state.projects],
          activeProjectId: demoProj.id,
          activeProject: demoProj,
        }));

        return demoProj;
      },

      updateProject: (id, data) => {
        set((state) => {
          const updated = state.projects.map((p) =>
            p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
          );
          const currentActive = state.activeProjectId === id
            ? updated.find((p) => p.id === id) || null
            : state.activeProject;
          return { projects: updated, activeProject: currentActive };
        });
      },

      deleteProject: (id) => {
        set((state) => {
          const filtered = state.projects.filter((p) => p.id !== id);
          const nextActiveId = filtered[0]?.id || null;
          const nextActive = filtered[0] || null;
          return {
            projects: filtered,
            activeProjectId: nextActiveId,
            activeProject: nextActive,
          };
        });
      },

      setProjectStudents: (projectId, students) => {
        get().updateProject(projectId, { students, status: students.length > 0 ? 'configured' : 'draft' });
      },

      updateStudent: (projectId, studentId, data) => {
        const proj = get().projects.find((p) => p.id === projectId);
        if (!proj) return;
        const updatedStudents = proj.students.map((s) => (s.id === studentId ? { ...s, ...data } : s));
        get().setProjectStudents(projectId, updatedStudents);
      },

      deleteStudent: (projectId, studentId) => {
        const proj = get().projects.find((p) => p.id === projectId);
        if (!proj) return;
        const updatedStudents = proj.students.filter((s) => s.id !== studentId);
        get().setProjectStudents(projectId, updatedStudents);
      },

      setColumnMappings: (projectId, mappings) => {
        get().updateProject(projectId, { columnMappings: mappings });
      },

      setNumberingConfig: (projectId, config) => {
        get().updateProject(projectId, { numberingConfig: config });
      },
    }),
    {
      name: 'certiflow-projects-storage',
    }
  )
);
