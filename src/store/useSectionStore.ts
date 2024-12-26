import { create } from 'zustand';
import { Section, WorkflowStep, DEFAULT_WORKFLOW_TEMPLATES } from '../types/section';
import { storage } from '../services/storage';

interface SectionStore {
  sections: Section[];
  currentSectionId: string | null;
  addSection: (name: string, workflow: WorkflowStep[]) => Promise<void>;
  editSection: (id: string, name: string, workflow: WorkflowStep[]) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;
  setCurrentSection: (id: string | null) => void;
  getSection: (id: string) => Section | undefined;
  loadSections: () => Promise<void>;
}

export const useSectionStore = create<SectionStore>()((set, get) => ({
  sections: [],
  currentSectionId: null,

  addSection: async (name: string, workflow: WorkflowStep[]) => {
    const newSection: Section = {
      id: crypto.randomUUID(),
      name,
      workflow,
      workflowSteps: workflow.map(step => step.prompt),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      sections: [...state.sections, newSection],
      currentSectionId: state.sections.length === 0 ? newSection.id : state.currentSectionId,
    }));

    await storage.saveSections(get().sections);
  },

  editSection: async (id: string, name: string, workflow: WorkflowStep[]) => {
    set((state) => ({
      sections: state.sections.map((section) =>
        section.id === id
          ? {
              ...section,
              name,
              workflow,
              workflowSteps: workflow.map(step => step.prompt),
              updatedAt: new Date(),
            }
          : section
      ),
    }));

    await storage.saveSections(get().sections);
  },

  deleteSection: async (id: string) => {
    set((state) => ({
      sections: state.sections.filter((section) => section.id !== id),
      currentSectionId:
        state.currentSectionId === id
          ? state.sections[0]?.id ?? null
          : state.currentSectionId,
    }));

    await storage.saveSections(get().sections);
  },

  setCurrentSection: (id: string | null) => {
    set({ currentSectionId: id });
  },

  getSection: (id: string) => {
    return get().sections.find((section) => section.id === id);
  },

  loadSections: async () => {
    try {
      const sections = await storage.loadSections();
      set({ sections });
      if (sections.length > 0 && !get().currentSectionId) {
        set({ currentSectionId: sections[0].id });
      }
    } catch (error) {
      console.error('Error loading sections:', error);
    }
  },
}));

// Initialize default section if none exists
useSectionStore.getState().loadSections().then(() => {
  if (useSectionStore.getState().sections.length === 0) {
    const defaultTemplate = DEFAULT_WORKFLOW_TEMPLATES[0];
    useSectionStore.getState().addSection(defaultTemplate.name, defaultTemplate.steps);
  }
}); 