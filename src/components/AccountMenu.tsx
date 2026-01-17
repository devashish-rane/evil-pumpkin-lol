import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-ink-100 text-sm font-semibold text-ink-700 shadow-sm"
        aria-label="Account menu"
      >
        {user?.name?.slice(0, 2).toUpperCase() ?? 'ME'}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-ink-100 bg-white p-2 text-sm shadow-soft">
          <Link
            to="/account"
            className="block rounded-xl px-3 py-2 text-ink-700 transition hover:bg-ink-50"
            onClick={() => setOpen(false)}
          >
            Account / Profile
          </Link>
          <Link
            to="/settings"
            className="block rounded-xl px-3 py-2 text-ink-700 transition hover:bg-ink-50"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-1 w-full rounded-xl px-3 py-2 text-left text-rose-600 transition hover:bg-rose-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
