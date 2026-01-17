import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const pillars = [
  {
    title: 'Topic',
    copy: 'The landscape. Topics map what interviews actually expect you to cover.'
  },
  {
    title: 'Concept',
    copy: 'The checkpoint. Concepts are the exact ideas interviewers probe for.'
  },
  {
    title: 'Question',
    copy: 'The rep. Interview-style prompts build realistic development instincts.'
  }
];

const features = [
  {
    title: 'Basic to advanced coverage',
    copy: 'Questions progress from fundamentals to interview-level depth.'
  },
  {
    title: 'Conceptual sequencing',
    copy: 'Each concept builds on the previous one with no gaps.'
  },
  {
    title: 'Practical focus',
    copy: 'Real workflows, tradeoffs, and debugging decisions.'
  },
  {
    title: 'Detailed explanations',
    copy: 'Every miss explains the expected reasoning so you can assess and learn.'
  },
  {
    title: 'Understanding first',
    copy: 'Built to explain the why behind strong engineering choices.'
  },
  {
    title: 'Interview useful',
    copy: 'Every prompt mirrors real developer expectations.'
  }
];

export default function About() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    if (location.hash !== '#login') return;
    const target = document.getElementById('login');
    if (!target) return;
    const header = document.querySelector('header');
    const offset = (header?.getBoundingClientRect().height ?? 72) + 16;
    const targetTop = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
  }, [location.hash]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    login(email, name || 'Learner');
    navigate('/topics');
  };

  return (
    <div className="relative -mx-4 overflow-hidden sm:-mx-8">
      <section className="about-hero relative px-4 pb-16 pt-14 sm:px-8 lg:pb-24 lg:pt-20">
        <div className="about-orb about-orb--one" aria-hidden="true" />
        <div className="about-orb about-orb--two" aria-hidden="true" />
        <div className="about-orb about-orb--three" aria-hidden="true" />

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-700 shadow-soft">
                <span className="text-base" aria-hidden="true">
                  🎃
                </span>
                Evil Pumpkin
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                Get interview-ready with interview-level questions.
              </h1>
              <p className="text-base text-ink-700 sm:text-lg">
                Evil Pumpkin turns real-world developer expectations into topics,
                concepts, and questions. You assess yourself, spot gaps, and learn
                by explaining interview-level decisions under pressure.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/topics"
                  className="rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                >
                  Explore topics
                </Link>
                <Link
                  to="/pricing"
                  className="rounded-full border border-ink-200 bg-white px-6 py-3 text-sm font-semibold text-ink-800 transition hover:-translate-y-0.5 hover:bg-ink-50"
                >
                  Start free trial
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-ink-200 bg-white/90 p-5 shadow-soft">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  The flow
                </div>
                <div className="mt-4 space-y-3">
                  {pillars.map((pillar, index) => (
                    <div
                      key={pillar.title}
                      className="animate-fade-up rounded-2xl border border-ink-200 bg-white/95 px-4 py-3"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="text-sm font-semibold text-ink-900">{pillar.title}</div>
                      <p className="mt-1 text-sm text-ink-600">{pillar.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="animate-fade-up rounded-3xl border border-ink-200 bg-white/95 p-4 text-sm text-ink-700">
                  <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Interview realism
                  </div>
                  <p className="mt-2">
                    Questions mirror how interviews test fundamentals and tradeoffs.
                  </p>
                </div>
                <div
                  className="animate-fade-up rounded-3xl border border-ink-200 bg-white/95 p-4 text-sm text-ink-700"
                  style={{ animationDelay: '0.1s' }}
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Coverage depth
                  </div>
                  <p className="mt-2">
                    Progresses from basics to advanced so gaps show up early.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-ink-900 sm:text-3xl">
              Interview-ready standards
            </h2>
            <p className="text-sm text-ink-600 sm:text-base">
              We keep every topic aligned to real interview expectations and real-world work.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fade-up rounded-3xl border border-ink-200 bg-white/95 p-5 shadow-soft"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <h3 className="text-base font-semibold text-ink-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="login" className="mx-auto max-w-6xl px-4 pb-12 sm:px-8 lg:pb-16">
        <div className="rounded-[32px] border border-ink-900/10 bg-ink-800 px-6 py-10 text-white shadow-soft sm:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold sm:text-3xl">
                Log in and keep the streak alive.
              </h2>
              <p className="text-sm text-white/80 sm:text-base">
                Your queue, your pace, your progress. Jump back in without losing the thread.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/85 shadow-soft">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    Daily recall
                  </div>
                  <p className="mt-2">Short bursts that reinforce what you just learned.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/85 shadow-soft">
                  <div className="text-xs font-semibold uppercase tracking-wide text-white/70">
                    Focus mode
                  </div>
                  <p className="mt-2">Filter to failed, untouched, or hardest concepts.</p>
                </div>
              </div>
            </div>

            <div className="animate-fade-up rounded-[32px] border border-white/15 bg-white/95 p-6 text-ink-900 shadow-soft sm:p-8">
              {user ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-ink-900">
                    You are already signed in.
                  </h3>
                  <p className="text-sm text-ink-600">
                    Head to topics and keep the recall momentum going.
                  </p>
                  <Link
                    to="/topics"
                    className="inline-flex items-center justify-center rounded-full bg-ink-900 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                  >
                    Go to topics
                  </Link>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-ink-900">Welcome back</h3>
                  <p className="mt-2 text-sm text-ink-600">
                    Log in to pick up exactly where you left off.
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 pb-12 text-sm text-ink-500 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-200 pt-6">
          <span>© 2024 Evil Pumpkin</span>
          <div className="flex gap-4 text-xs uppercase tracking-wide">
            <Link to="/pricing" className="transition hover:text-ink-700">
              Pricing
            </Link>
            <Link to="/topics" className="transition hover:text-ink-700">
              Topics
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
