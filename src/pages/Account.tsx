import React from 'react';
import { useAuth } from '../store/AuthContext';
import { useData } from '../store/DataContext';

export default function Account() {
  const { user } = useAuth();
  const { coolStuff } = useData();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink-900">Account</h1>
        <p className="mt-2 text-sm text-ink-600">
          Your identity is stored locally for this MVP. Use it to restore your recall history on this device.
        </p>
        <div className="mt-4 grid gap-3 text-sm text-ink-700">
          <div>
            <span className="text-xs uppercase tracking-wide text-ink-500">Name</span>
            <div className="font-semibold text-ink-900">{user?.name}</div>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wide text-ink-500">Email</span>
            <div className="font-semibold text-ink-900">{user?.email}</div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-ink-900">Cool Stuff</h2>
        <p className="mt-2 text-sm text-ink-600">
          Curiosity breaks you&apos;ve unlocked after effort. Keep collecting them by completing recall streaks.
        </p>
        {coolStuff.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-ink-200 p-4 text-sm text-ink-500">
            No curiosities saved yet. Earn one after five correct recalls.
          </div>
        ) : (
          <ul className="mt-4 space-y-3 text-sm text-ink-700">
            {coolStuff.map((fact) => (
              <li key={fact} className="rounded-2xl border border-ink-100 bg-ink-50 p-4">
                {fact}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
