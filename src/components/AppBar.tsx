import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

interface AppBarProps {
  title?: string;
}

export const AppBar: React.FC<AppBarProps> = ({ title = 'Pumpkin' }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-saffron-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-semibold tracking-tight text-slateInk-900">
          {title}
        </Link>
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-saffron-200 bg-saffron-100 text-sm font-semibold text-slateInk-800 shadow-soft"
              aria-label="Open account menu"
            >
              {user.name.slice(0, 2).toUpperCase()}
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-44 rounded-xl border border-saffron-100 bg-white p-2 text-sm shadow-card">
                <Link
                  to="/account"
                  className="block rounded-lg px-3 py-2 text-slateInk-700 hover:bg-saffron-50"
                >
                  Account / Profile
                </Link>
                <Link
                  to="/settings"
                  className="block rounded-lg px-3 py-2 text-slateInk-700 hover:bg-saffron-50"
                >
                  Settings
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-1 w-full rounded-lg px-3 py-2 text-left text-slateInk-700 hover:bg-saffron-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
