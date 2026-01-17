import React from 'react';
import { AppBar } from './AppBar';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen">
    <AppBar />
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-6">{children}</main>
  </div>
);
