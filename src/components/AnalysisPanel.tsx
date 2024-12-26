import React, { useState } from 'react';
import { useThoughtStore } from '../store/useThoughtStore';
import { WorkflowStep } from '../types/section';
import { ThoughtAnalysis } from '../types/thought';

interface AnalysisPanelProps {
  thoughtId: string;
  thoughtContent: string;
  aiResponse: ThoughtAnalysis | null;
  workflow: WorkflowStep[];
}

export function AnalysisPanel({
  thoughtId,
  thoughtContent,
  aiResponse,
  workflow,
}: AnalysisPanelProps) {
  const [activeStepId, setActiveStepId] = useState<string | null>(
    workflow && workflow.length > 0 ? workflow[0].id : null
  );

  const currentStep = workflow?.find((step) => step.id === activeStepId);
  const currentResponse = aiResponse?.steps.find(
    (step) => step.stepId === activeStepId
  );

  if (!thoughtId) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-gray-500">Select a thought to view its analysis</p>
      </div>
    );
  }

  if (!workflow || workflow.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <p className="text-gray-500">No workflow steps defined for this section</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">Analysis</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto py-2">
          {workflow.map((step) => (
            <button
              key={step.id}
              onClick={() => setActiveStepId(step.id)}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                step.id === activeStepId
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {step.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {currentStep && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">Original Thought</h3>
              <p className="text-gray-600">{thoughtContent}</p>
            </div>

            {currentResponse ? (
              <div className="bg-white p-4 rounded-lg border">
                <h3 className="font-medium text-gray-700 mb-2">
                  {currentStep.name}
                </h3>
                <div className="prose max-w-none">
                  {currentResponse.content}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Analysis in progress...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
