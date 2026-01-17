import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login(email, name || 'Learner');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink-50 px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-ink-100 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink-900">Welcome back</h1>
        <p className="mt-2 text-sm text-ink-600">
          Revision is the product. Log in to face today&apos;s due recalls.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional"
              className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-ink-900 px-4 py-3 text-sm font-semibold text-white"
          >
            Log in
          </button>
        </form>
        <p className="mt-4 text-sm text-ink-600">
          New here?{' '}
          <Link to="/signup" className="font-semibold text-saffron-600">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
