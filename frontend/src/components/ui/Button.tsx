import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from './cn';

type Variant = 'default' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  default: 'bg-indigo-600 text-white hover:bg-indigo-500',
  secondary: 'bg-white border border-indigo-100 text-indigo-700 hover:bg-indigo-50',
  ghost: 'text-indigo-700 hover:bg-indigo-50',
  danger: 'bg-red-600 text-white hover:bg-red-500',
};

export const Button = ({ variant = 'default', className, children, ...props }: ButtonProps) => (
  <button
    className={cn(
      'inline-flex h-9 items-center justify-center rounded-md px-4 text-sm font-medium transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:opacity-60',
      variants[variant],
      className,
    )}
    {...props}
  >
    {children}
  </button>
);
