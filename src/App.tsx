import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Topic from './pages/Topic';
import Notes from './pages/Notes';
import Anki from './pages/Anki';
import Practice from './pages/Practice';
import Account from './pages/Account';
import Settings from './pages/Settings';
import About from './pages/About';
import Pricing from './pages/Pricing';
import { AuthProvider, useAuth } from './store/AuthContext';
import { DataProvider } from './store/DataContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Routes>
          <Route path="/login" element={<Navigate to="/#login" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/"
            element={
              <AppShell>
                <About />
              </AppShell>
            }
          />
          <Route
            path="/about"
            element={
              <AppShell>
                <About />
              </AppShell>
            }
          />
          <Route
            path="/topics"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pricing"
            element={
              <AppShell>
                <Pricing />
              </AppShell>
            }
          />
          <Route
            path="/topic/:topicId"
            element={
              <ProtectedRoute>
                <Topic />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topic/:topicId/notes"
            element={
              <ProtectedRoute>
                <Notes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topic/:topicId/anki"
            element={
              <ProtectedRoute>
                <Anki />
              </ProtectedRoute>
            }
          />
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <Practice />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DataProvider>
    </AuthProvider>
  );
}
