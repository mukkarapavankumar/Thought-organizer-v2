import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Section, WorkflowStep, DEFAULT_WORKFLOW_TEMPLATES } from '../types/section';

interface SectionStore {
  sections: Section[];
  currentSectionId: string | null;
  addSection: (name: string, workflow: WorkflowStep[]) => void;
  editSection: (id: string, name: string, workflow: WorkflowStep[]) => void;
  deleteSection: (id: string) => void;
  setCurrentSection: (id: string | null) => void;
  getSection: (id: string) => Section | undefined;
}

export const useSectionStore = create<SectionStore>()(
  persist(
    (set, get) => ({
      sections: [],
      currentSectionId: null,

      addSection: (name: string, workflow: WorkflowStep[]) => {
        const newSection: Section = {
          id: crypto.randomUUID(),
          name,
          workflow,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          sections: [...state.sections, newSection],
          currentSectionId: state.sections.length === 0 ? newSection.id : state.currentSectionId,
        }));
      },

      editSection: (id: string, name: string, workflow: WorkflowStep[]) => {
        set((state) => ({
          sections: state.sections.map((section) =>
            section.id === id
              ? {
                  ...section,
                  name,
                  workflow,
                  updatedAt: new Date(),
                }
              : section
          ),
        }));
      },

      deleteSection: (id: string) => {
        set((state) => ({
          sections: state.sections.filter((section) => section.id !== id),
          currentSectionId:
            state.currentSectionId === id
              ? state.sections[0]?.id ?? null
              : state.currentSectionId,
        }));
      },

      setCurrentSection: (id: string | null) => {
        set({ currentSectionId: id });
      },

      getSection: (id: string) => {
        return get().sections.find((section) => section.id === id);
      },
    }),
    {
      name: 'section-storage',
    }
  )
);

// Initialize default section if none exists
if (useSectionStore.getState().sections.length === 0) {
  const defaultTemplate = DEFAULT_WORKFLOW_TEMPLATES[0];
  useSectionStore.getState().addSection(defaultTemplate.name, defaultTemplate.steps);
} 