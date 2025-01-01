import React, { useState } from 'react';
import { useThoughtStore } from '../store/useThoughtStore';
import { WorkflowStep } from '../types/section';
import { ThoughtAnalysis, WorkflowResponse } from '../types/thought';
import ReactMarkdown from 'react-markdown';
import { CopyOutlined, SnippetsOutlined } from '@ant-design/icons';
import { message } from 'antd';

interface AnalysisPanelProps {
  thoughtId: string;
  thoughtContent: string;
  aiResponse: ThoughtAnalysis | null;
  workflow: WorkflowStep[];
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
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
  const currentResponse = aiResponse?.steps?.find(
    (step: WorkflowResponse) => step.stepId === activeStepId
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Copied to clipboard');
    } catch (err) {
      message.error('Failed to copy');
    }
  };

  const extractCode = (markdown: string): string => {
    const codeBlocks = markdown.match(/```[\s\S]*?```/g) || [];
    return codeBlocks.map(block => block.replace(/```[\w]*\n?|\n?```/g, '')).join('\n\n');
  };

  if (!thoughtId) {
    return (
      <div className="h-full flex items-center justify-center p-6">
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
    <div className="h-full flex flex-col flex-1 min-w-[800px] max-w-[1100px]">
      <div className="p-4 border-b bg-white">
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
          <div className="space-y-6 max-w-[1100px] mx-auto">
            {currentResponse ? (
              <div className="bg-white p-6 rounded-lg border shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-700">
                    {currentStep.name}
                  </h3>
                  <div className="flex gap-2">
                    {currentResponse.content.includes('```') && (
                      <button
                        onClick={() => copyToClipboard(extractCode(currentResponse.content))}
                        className="p-2 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900"
                        title="Copy code blocks"
                      >
                        <SnippetsOutlined />
                      </button>
                    )}
                    <button
                      onClick={() => copyToClipboard(currentResponse.content)}
                      className="p-2 hover:bg-gray-100 rounded-md text-gray-600 hover:text-gray-900"
                      title="Copy full content"
                    >
                      <CopyOutlined />
                    </button>
                  </div>
                </div>
                <div className="prose prose-lg max-w-none dark:prose-invert">
                  <ReactMarkdown
                    components={{
                      pre: ({ ...props }) => (
                        <pre className="bg-gray-800 p-6 rounded-lg overflow-auto text-gray-100 my-4" {...props} />
                      ),
                      code: ({ inline, className, ...props }: CodeProps) =>
                        inline ? (
                          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800" {...props} />
                        ) : (
                          <code className="text-gray-400" {...props} />
                        ),
                      blockquote: ({ ...props }) => (
                        <blockquote className="border-l-4 border-gray-200 pl-4 italic my-4" {...props} />
                      ),
                      a: ({ ...props }) => (
                        <a className="text-blue-600 hover:underline" {...props} />
                      ),
                      ul: ({ ...props }) => (
                        <ul className="list-disc list-inside my-4 space-y-2" {...props} />
                      ),
                      ol: ({ ...props }) => (
                        <ol className="list-decimal list-inside my-4 space-y-2" {...props} />
                      ),
                    }}
                  >
                    {currentResponse.content}
                  </ReactMarkdown>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  {aiResponse?.status === 'pending' 
                    ? 'Analysis in progress...'
                    : aiResponse?.status === 'error'
                    ? aiResponse.error || 'An error occurred during analysis'
                    : 'Waiting to start analysis...'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
