import { Brain, TrendingUp, AlertCircle, Loader2, Star } from 'lucide-react';
import { Thought } from '../types/thought';
import { useThoughtStore } from '../store/useThoughtStore';

interface ThoughtCardProps {
  thought: Thought;
}

export function ThoughtCard({ thought }: ThoughtCardProps) {
  const updateUserPriority = useThoughtStore((state) => state.updateUserPriority);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <p className="text-gray-800">{thought.content}</p>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateUserPriority(thought.id, star)}
                className={`p-1 hover:text-yellow-500 transition-colors ${
                  star <= thought.ranking.userPriority ? 'text-yellow-500' : 'text-gray-300'
                }`}
              >
                <Star className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
        <time className="text-sm text-gray-500">
          {thought.createdAt.toLocaleDateString()}
        </time>
      </div>

      {thought.status === 'success' && (
        <div className="grid grid-cols-3 gap-4 py-2">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Market Impact</div>
            <div className="text-lg font-semibold text-blue-600">
              {thought.ranking.marketImpact.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Viability</div>
            <div className="text-lg font-semibold text-green-600">
              {thought.ranking.viability.toFixed(1)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-gray-500">Total Score</div>
            <div className="text-lg font-semibold text-purple-600">
              {thought.ranking.totalScore.toFixed(1)}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 pt-4 border-t">
        {thought.status === 'loading' && (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <p className="text-sm">Analyzing with AI...</p>
          </div>
        )}

        {thought.status === 'error' && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">{thought.error || 'An error occurred'}</p>
          </div>
        )}

        {thought.status === 'success' && thought.aiAnalysis && (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-600">
                <Brain className="w-5 h-5" />
                <h3 className="font-medium">AI Enhancement</h3>
              </div>
              <p className="text-gray-700 text-sm">{thought.aiAnalysis.enhancement}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-600">
                <TrendingUp className="w-5 h-5" />
                <h3 className="font-medium">Market Research</h3>
              </div>
              <p className="text-gray-700 text-sm">{thought.aiAnalysis.marketResearch}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}