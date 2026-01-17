import React from 'react';
import AppBar from './AppBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900">
      <AppBar />
      <main className="px-4 pb-24 pt-6 sm:px-8">{children}</main>
    </div>
  );
}
