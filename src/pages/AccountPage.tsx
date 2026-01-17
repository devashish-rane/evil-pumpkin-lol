import React from 'react';
import { AppShell } from '../components/AppShell';
import { useAuth } from '../store/auth';
import { useAppStore } from '../store/app';
import { curiosities } from '../data/curiosities';

const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const { prefs } = useAppStore();

  const viewed = curiosities.filter((item) => prefs.curiositiesViewed.includes(item.id));

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="rounded-3xl border border-saffron-100 bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-semibold text-slateInk-900">Account</h1>
          <p className="mt-2 text-sm text-slateInk-600">
            {user?.name} • {user?.email}
          </p>
        </div>

        <div className="rounded-3xl border border-saffron-100 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slateInk-900">Cool Stuff</h2>
          <p className="mt-2 text-sm text-slateInk-600">
            Curiosities earned after focused recall sessions.
          </p>
          {viewed.length === 0 ? (
            <p className="mt-4 text-sm text-slateInk-500">No curiosities saved yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {viewed.map((item) => (
                <li key={item.id} className="rounded-2xl border border-saffron-100 bg-saffron-50 p-4 text-sm">
                  {item.text}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
};

export default AccountPage;
