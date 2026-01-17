import React from 'react';
import { Link } from 'react-router-dom';
import AccountMenu from './AccountMenu';

export default function AppBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-ink-200 bg-ink-50/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl"
          >
            <span className="text-3xl leading-none sm:text-4xl" aria-hidden="true">
              🎃
            </span>
            Pumpkin
          </Link>
        </div>
        <AccountMenu />
      </div>
    </header>
  );
}
