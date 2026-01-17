import React from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TopBar } from './components/TopBar';
import { Account } from './pages/Account';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Practice } from './pages/Practice';
import { Settings } from './pages/Settings';
import { Signup } from './pages/Signup';
import { Topic } from './pages/Topic';
import { AuthProvider } from './store/AuthContext';
import { LearningProvider } from './store/LearningContext';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-paper">
      <TopBar onAccount={() => navigate('/account')} onSettings={() => navigate('/settings')} />
      {children}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <LearningProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/topic/:id"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Topic />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice/:id"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Practice />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Account />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <ProtectedLayout>
                <Settings />
              </ProtectedLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </LearningProvider>
  </AuthProvider>
);

export default App;
