import React from 'react';
import { AppShell } from '../components/AppShell';

const SettingsPage: React.FC = () => (
  <AppShell>
    <div className="rounded-3xl border border-saffron-100 bg-white p-6 shadow-soft">
      <h1 className="text-2xl font-semibold text-slateInk-900">Settings</h1>
      <p className="mt-2 text-sm text-slateInk-600">
        MVP settings are minimal. Future versions will include notification windows, daily goals, and export controls.
      </p>
    </div>
  </AppShell>
);

export default SettingsPage;
