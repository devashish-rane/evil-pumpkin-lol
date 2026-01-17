import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login(email, name || 'Learner');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-saffron-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-3xl border border-saffron-100 bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-slateInk-900">Welcome back</h1>
        <p className="mt-2 text-sm text-slateInk-600">
          Resume your recall-first practice. Login creates a session locally for the MVP.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slateInk-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-saffron-100 bg-saffron-50 px-4 py-3 text-sm"
              placeholder="you@work.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slateInk-500">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-xl border border-saffron-100 bg-saffron-50 px-4 py-3 text-sm"
              placeholder="Optional"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-slateInk-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Login
          </button>
        </form>
        <p className="mt-5 text-sm text-slateInk-600">
          New to Pumpkin?{' '}
          <Link className="font-semibold text-slateInk-900" to="/signup">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
