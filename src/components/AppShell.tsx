import React from 'react';
import AppBar from './AppBar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-100 text-ink-900">
      <div className="app-bg" aria-hidden="true">
        <span className="app-orb app-orb--one" />
        <span className="app-orb app-orb--two" />
        <span className="app-orb app-orb--three" />
      </div>
      <AppBar />
      <main className="relative px-4 pb-24 pt-6 sm:px-8">{children}</main>
    </div>
  );
}
