import React from 'react';

export const Settings: React.FC = () => (
  <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6">
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <h1 className="text-2xl font-semibold text-ink">Settings</h1>
      <p className="mt-2 text-sm text-ink/60">
        MVP settings placeholder. Future controls will include review intensity, notification windows, and
        backup/export tools for local data.
      </p>
    </div>
  </div>
);
