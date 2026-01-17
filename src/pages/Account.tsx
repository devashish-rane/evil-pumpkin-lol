import React from 'react';
import { useAuth } from '../store/AuthContext';
import { useLearning } from '../store/LearningContext';

export const Account: React.FC = () => {
  const { user } = useAuth();
  const { prefs } = useLearning();

  if (!user) return null;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-6">
      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h1 className="text-2xl font-semibold text-ink">Account</h1>
        <div className="mt-4 grid gap-4 text-sm text-ink/70">
          <div>
            <div className="text-xs uppercase tracking-widest text-ink/40">Name</div>
            <div className="font-semibold text-ink">{user.name}</div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-ink/40">Email</div>
            <div className="font-semibold text-ink">{user.email}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-card">
        <h2 className="text-lg font-semibold text-ink">Cool Stuff</h2>
        <p className="mt-2 text-sm text-ink/60">Curiosities you’ve earned after focused recall.</p>
        {prefs.curiosities.length === 0 ? (
          <div className="mt-4 text-sm text-ink/50">Earn curiosities after every 5 successful recalls.</div>
        ) : (
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink/70">
            {prefs.curiosities.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
