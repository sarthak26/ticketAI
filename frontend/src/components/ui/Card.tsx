import type { ReactNode } from 'react';

import { cn } from './cn';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className }: CardProps) => (
  <div className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>{children}</div>
);

export const CardHeader = ({ children, className }: CardProps) => (
  <div className={cn('border-b border-slate-100 px-5 py-4', className)}>{children}</div>
);

export const CardContent = ({ children, className }: CardProps) => (
  <div className={cn('p-5', className)}>{children}</div>
);
