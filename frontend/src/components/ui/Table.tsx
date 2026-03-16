import type { HTMLAttributes, ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

import { cn } from './cn';

export const TableShell = ({ children }: { children: ReactNode }) => (
  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{children}</div>
);

export const TableContainer = ({ children }: { children: ReactNode }) => (
  <div className="max-h-[520px] overflow-auto">{children}</div>
);

export const Table = ({ children }: { children: ReactNode }) => (
  <table className="w-full border-collapse text-left text-sm">{children}</table>
);

export const Thead = ({ children }: { children: ReactNode }) => (
  <thead className="sticky top-0 z-10 bg-[#f6ebff]/60">{children}</thead>
);

export const Th = ({ children, className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn('whitespace-nowrap border-b border-slate-200 px-4 py-3 font-medium text-slate-600', className)}
    {...props}
  >
    {children}
  </th>
);

export const Tr = ({ children, className, ...props }: HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn('border-b border-slate-100 transition-colors hover:bg-[#f6ebff]/40', className)}
    {...props}
  >
    {children}
  </tr>
);

export const Td = ({ children, className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-3 text-slate-700', className)} {...props}>
    {children}
  </td>
);
