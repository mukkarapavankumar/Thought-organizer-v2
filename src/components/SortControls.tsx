import React from 'react';
import { SortOption } from '../types/thought';

interface SortControlsProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export function SortControls({ value, onChange }: SortControlsProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="text-sm border rounded-md px-2 py-1"
    >
      <option value="date">Date</option>
      <option value="marketImpact">Market Impact</option>
      <option value="viability">Viability</option>
      <option value="totalScore">Total Score</option>
    </select>
  );
}