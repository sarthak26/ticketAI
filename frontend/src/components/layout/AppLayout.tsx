import type { ReactNode } from 'react';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-slate-50">
    <div className="mx-auto flex max-w-[1600px]">
      <Sidebar />
      <main className="min-h-screen flex-1">
        <Topbar />
        <div className="p-6">{children}</div>
      </main>
    </div>
  </div>
);
