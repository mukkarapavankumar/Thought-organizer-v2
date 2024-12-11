import { ArrowUpDown } from 'lucide-react';
import { Button } from './ui/Button';
import { useThoughtStore } from '../store/useThoughtStore';
import { SortOption } from '../types/thought';

export function SortControls() {
  const { sortBy, setSortBy } = useThoughtStore();

  const options: { value: SortOption; label: string }[] = [
    { value: 'totalScore', label: 'Total Score' },
    { value: 'marketImpact', label: 'Market Impact' },
    { value: 'viability', label: 'Viability' },
    { value: 'userPriority', label: 'User Priority' },
    { value: 'date', label: 'Date Added' },
  ];

  return (
    <div className="flex items-center gap-2 mb-4">
      <ArrowUpDown className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-700">Sort by:</span>
      <div className="flex gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={sortBy === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy(option.value)}
          >
            {option.label}
          </Button>
        ))}
      </div>
    </div>
  );
}