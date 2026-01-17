import React from 'react';

export default function Settings() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="rounded-3xl border border-ink-100 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink-900">Settings</h1>
        <p className="mt-2 text-sm text-ink-600">
          This MVP keeps settings local. Future versions will sync devices without losing your recall schedule.
        </p>
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-700">
            <div className="font-semibold text-ink-900">Review intensity</div>
            <p className="mt-1">Default schedule prioritizes at-risk concepts first.</p>
          </div>
          <div className="rounded-2xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-700">
            <div className="font-semibold text-ink-900">Notification window</div>
            <p className="mt-1">Daily reminders are simulated for now.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
