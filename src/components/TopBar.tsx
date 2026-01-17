import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../store/AuthContext';

interface TopBarProps {
  onAccount?: () => void;
  onSettings?: () => void;
}

const menuItems = [
  { label: 'Account / Profile', action: 'account' },
  { label: 'Settings', action: 'settings' },
  { label: 'Logout', action: 'logout' },
] as const;

export const TopBar: React.FC<TopBarProps> = ({ onAccount, onSettings }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleAction = (action: typeof menuItems[number]['action']) => {
    if (action === 'logout') {
      logout();
      return;
    }
    if (action === 'account') {
      onAccount?.();
    }
    if (action === 'settings') {
      onSettings?.();
    }
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-black/5 bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="text-xl font-semibold tracking-tight text-ink">Pumpkin</div>
        {user && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slateblue-500 text-sm font-semibold text-white shadow-soft"
              aria-label="Account menu"
            >
              {user.name.slice(0, 1).toUpperCase()}
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-48 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-card"
                >
                  {menuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleAction(item.action)}
                      className="flex w-full items-center px-4 py-3 text-left text-sm text-ink hover:bg-saffron-50"
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
};
