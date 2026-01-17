import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    signup(email, name || 'Learner');
    navigate('/topics');
  };

  return (
    <div className="min-h-screen bg-ink-100 px-4 py-12">
      <div className="mx-auto max-w-md rounded-3xl border border-ink-200 bg-white/95 p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-ink-900">Create your Pumpkin account</h1>
        <p className="mt-2 text-sm text-ink-600">
          Promise yourself daily recalls. We’ll keep the schedule honest.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-ink-500">
              Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm"
            />
          </div>
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
          <button
            type="submit"
            className="w-full rounded-full bg-saffron-500 px-4 py-3 text-sm font-semibold text-ink-900"
          >
            Create account
          </button>
        </form>
        <p className="mt-4 text-sm text-ink-600">
          Already have an account?{' '}
          <Link to="/#login" className="font-semibold text-saffron-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
