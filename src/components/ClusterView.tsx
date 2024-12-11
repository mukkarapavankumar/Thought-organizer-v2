import { useThoughtStore } from '../store/useThoughtStore';
import { Layers } from 'lucide-react';

export function ClusterView() {
  const clusters = useThoughtStore((state) => state.clusters);

  if (clusters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold">Idea Clusters</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {clusters.map((cluster) => (
          <div
            key={cluster.id}
            className="bg-white rounded-lg shadow-md p-6 border border-purple-100"
          >
            <h3 className="text-lg font-medium text-purple-700 mb-2">
              {cluster.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{cluster.summary}</p>
            <div className="text-sm text-gray-500">
              {cluster.thoughts.length} related thoughts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}