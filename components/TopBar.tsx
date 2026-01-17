import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";

export const TopBar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-100 bg-white/80 px-5 py-4 backdrop-blur">
      <Link to="/" className="text-xl font-semibold tracking-tight text-charcoal-900">
        Pumpkin
      </Link>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-saffron-100 text-sm font-semibold text-charcoal-800 shadow-sm"
          aria-label="Account menu"
        >
          {user?.name?.[0]?.toUpperCase() ?? "P"}
        </button>
        {open && (
          <div className="absolute right-0 mt-3 w-44 rounded-xl border border-slate-100 bg-white p-2 shadow-card">
            <Link
              to="/account"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-charcoal-800 hover:bg-slate-100"
            >
              Account / Profile
            </Link>
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm text-charcoal-800 hover:bg-slate-100"
            >
              Settings
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
