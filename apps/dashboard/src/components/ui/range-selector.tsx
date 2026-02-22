import { clsx } from 'clsx';
import type { AnalyticsRange } from '@agent-analytics/types';

const RANGES: { value: AnalyticsRange; label: string }[] = [
  { value: '1d', label: '24h' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
];

interface RangeSelectorProps {
  value: AnalyticsRange;
  onChange: (range: AnalyticsRange) => void;
}

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
      {RANGES.map((range) => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={clsx(
            'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
            value === range.value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300',
          )}
        >
          {range.label}
        </button>
      ))}
    </div>
  );
}
