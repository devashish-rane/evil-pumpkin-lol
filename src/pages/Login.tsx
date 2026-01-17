import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login({ id: email, email, name: name || 'Learner' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card"
      >
        <h1 className="text-2xl font-semibold text-ink">Welcome back</h1>
        <p className="mt-2 text-sm text-ink/60">Daily recall beats binge study. Log in to continue.</p>
        <label className="mt-6 block text-sm font-semibold text-ink">Name</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 px-4 py-2"
          placeholder="Your name"
        />
        <label className="mt-4 block text-sm font-semibold text-ink">Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-xl border border-black/10 px-4 py-2"
          placeholder="you@example.com"
          type="email"
          required
        />
        <button
          type="submit"
          className="mt-6 w-full rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white"
        >
          Log in
        </button>
        <p className="mt-4 text-center text-sm text-ink/60">
          New here?{' '}
          <Link className="font-semibold text-slateblue-600" to="/signup">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};
