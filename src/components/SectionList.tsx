import React from 'react';
import { Plus, Settings, Trash2, X } from 'lucide-react';
import { useSectionStore } from '../store/useSectionStore';
import { WorkflowStep } from '../types/section';

interface SectionModalProps {
  onClose: () => void;
  initialData?: {
    id: string;
    name: string;
    workflow: WorkflowStep[];
  };
}

function SectionModal({ onClose, initialData }: SectionModalProps) {
  const { addSection, editSection } = useSectionStore();
  const [name, setName] = React.useState(initialData?.name || '');
  const [steps, setSteps] = React.useState<WorkflowStep[]>(
    initialData?.workflow || [
      {
        id: crypto.randomUUID(),
        name: '',
        prompt: '',
        order: 0,
      },
    ]
  );

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: crypto.randomUUID(),
        name: '',
        prompt: '',
        order: steps.length,
      },
    ]);
  };

  const removeStep = (index: number) => {
    if (steps.length === 1) {
      alert('You must have at least one workflow step');
      return;
    }
    const newSteps = steps.filter((_, i) => i !== index);
    // Update order of remaining steps
    newSteps.forEach((step, i) => {
      step.order = i;
    });
    setSteps(newSteps);
  };

  const updateStep = (index: number, field: keyof WorkflowStep, value: string) => {
    setSteps(
      steps.map((step, i) =>
        i === index ? { ...step, [field]: value } : step
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (steps.some((step) => !step.name || !step.prompt)) {
      alert('Please fill in all workflow step fields');
      return;
    }

    // Ensure steps are ordered correctly
    const orderedSteps = steps.map((step, index) => ({
      ...step,
      order: index,
    }));

    if (initialData) {
      await editSection(initialData.id, name, orderedSteps);
    } else {
      await addSection(name, orderedSteps);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {initialData ? 'Edit Section' : 'Add New Section'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Section Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Workflow Steps</label>
              <button
                type="button"
                onClick={addStep}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                + Add Step
              </button>
            </div>

            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Step {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Step Name
                      </label>
                      <input
                        type="text"
                        value={step.name}
                        onChange={(e) =>
                          updateStep(index, 'name', e.target.value)
                        }
                        placeholder="e.g., Story Generation"
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Prompt Template
                      </label>
                      <textarea
                        value={step.prompt}
                        onChange={(e) =>
                          updateStep(index, 'prompt', e.target.value)
                        }
                        placeholder="Enter the prompt for the AI to process the thought..."
                        className="w-full p-2 border rounded-md"
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Save Changes' : 'Create Section'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SectionList() {
  const { sections, currentSectionId, setCurrentSection, deleteSection, editSection } = useSectionStore();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [editingSection, setEditingSection] = React.useState<{
    id: string;
    name: string;
    workflow: WorkflowStep[];
  } | null>(null);

  const handleSectionClick = (sectionId: string) => {
    setCurrentSection(sectionId);
  };

  const handleDeleteSection = async (e: React.MouseEvent, sectionId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this section?')) {
      await deleteSection(sectionId);
    }
  };

  const handleEditSection = (e: React.MouseEvent, section: {
    id: string;
    name: string;
    workflow: WorkflowStep[];
  }) => {
    e.stopPropagation();
    setEditingSection(section);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Sections</h2>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="p-1 hover:bg-gray-100 rounded-md"
            title="Add Section"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sections.map((section) => (
          <div
            key={section.id}
            className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${
              section.id === currentSectionId ? 'bg-blue-50' : ''
            }`}
            onClick={() => handleSectionClick(section.id)}
          >
            <span className="flex-1 truncate">{section.name}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => handleEditSection(e, section)}
                className="p-1 hover:bg-gray-200 rounded-md"
                title="Edit Section"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => handleDeleteSection(e, section.id)}
                className="p-1 hover:bg-gray-200 rounded-md"
                title="Delete Section"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(isAddModalOpen || editingSection) && (
        <SectionModal
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingSection(null);
          }}
          initialData={editingSection ?? undefined}
        />
      )}
    </div>
  );
} 