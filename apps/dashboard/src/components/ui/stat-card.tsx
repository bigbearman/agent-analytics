import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
}

export function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {change !== undefined && (
        <div className="mt-2 flex items-center gap-1">
          {change >= 0 ? (
            <TrendingUp size={14} className="text-green-500" />
          ) : (
            <TrendingDown size={14} className="text-red-500" />
          )}
          <span
            className={clsx(
              'text-sm font-medium',
              change >= 0 ? 'text-green-600' : 'text-red-600',
            )}
          >
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
          <span className="text-sm text-gray-500">vs prev period</span>
        </div>
      )}
    </div>
  );
}
