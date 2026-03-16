import type { ReactNode } from 'react';

import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-[#f6ebff]/40">
    <div className="flex w-full">
      <Sidebar />
      <main className="min-h-screen flex-1">
        <Topbar />
        <div className="p-6">{children}</div>
      </main>
    </div>
  </div>
);
