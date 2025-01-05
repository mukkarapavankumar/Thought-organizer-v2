export interface WorkflowStep {
  id: string;
  name: string;
  prompt: string;
  contextSteps: string[];
  model?: string;
  order: number;
  useWebSearch?: boolean;
}

export interface Section {
  id: string;
  name: string;
  workflow: WorkflowStep[];
}

export interface SectionFormData {
  name: string;
  workflow: WorkflowStepFormData[];
}

export interface WorkflowStepFormData {
  name: string;
  prompt: string;
}

export interface WorkflowResponse {
  stepId: string;
  content: string;
}

export interface SectionAnalysis {
  steps: WorkflowResponse[];
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export const DEFAULT_WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'thought-analysis',
    name: 'Thought Analysis',
    description: 'Analyze thoughts with enhancement, market analysis, and business case',
    steps: [
      {
        id: 'step1',
        name: 'Thought Enhancement',
        prompt: 'Enhance and expand upon this thought:',
        order: 0,
        contextSteps: [],
        useWebSearch: false,
      },
      {
        id: 'step2',
        name: 'Market Analysis',
        prompt: 'Provide a market analysis for this concept:',
        order: 1,
        contextSteps: ['step1'],
        useWebSearch: true,
      },
      {
        id: 'step3',
        name: 'Business Case',
        prompt: 'Develop a business case for this idea:',
        order: 2,
        contextSteps: ['step1', 'step2'],
        useWebSearch: true,
      }
    ]
  },
  {
    id: 'story-generator',
    name: 'Story Generator',
    description: 'Generate creative stories from thoughts',
    steps: [
      {
        id: 'step1',
        name: 'Story Generation',
        prompt: 'Create a short story based on this thought:',
        order: 0,
        contextSteps: [],
      }
    ]
  }
]
