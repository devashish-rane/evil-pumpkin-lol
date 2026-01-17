import React from 'react';
import { Link } from 'react-router-dom';
import AccountMenu from './AccountMenu';

export default function AppBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <Link to="/" className="text-lg font-semibold tracking-tight text-ink-900">
          Pumpkin
        </Link>
        <AccountMenu />
      </div>
    </header>
  );
}
