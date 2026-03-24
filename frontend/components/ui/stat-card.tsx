import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
}

export function StatCard({ title, value, icon, description, className = '' }: StatCardProps) {
  return (
    <div className={`bg-card rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-semibold text-foreground">{value}</p>
          </div>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-primary/10 rounded-full">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export default StatCard; 