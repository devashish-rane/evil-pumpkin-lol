import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const trialBenefits = [
  'Full access to topics, concepts, and questions',
  'Adaptive review scheduling',
  'Progress stats and recall tracking',
  'Cancel anytime before the trial ends'
];

const subBenefits = [
  'Unlimited question access',
  'Priority review queue tuning',
  'Performance insights by topic',
  'New topics added monthly'
];

const faqItems = [
  {
    title: 'What happens after 14 days?',
    copy: 'Your trial ends and the subscription starts at 299/month unless you cancel.'
  },
  {
    title: 'Can I cancel anytime?',
    copy: 'Yes. Cancel before the renewal and you will not be charged.'
  },
  {
    title: 'How do I get billed?',
    copy: 'Subscriptions are billed monthly and renew automatically.'
  },
  {
    title: 'What is included?',
    copy: 'Every plan includes the full topic library and adaptive review engine.'
  }
];

export default function Pricing() {
  const navigate = useNavigate();
  const [showCelebration, setShowCelebration] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'upi' | 'card' | null>(null);
  const [upiId, setUpiId] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentNotice, setPaymentNotice] = useState('');
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const paymentTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
      if (paymentTimer.current) {
        clearTimeout(paymentTimer.current);
      }
    };
  }, []);

  const sparkles = [
    { left: '10%', top: '20%', delay: '0s', color: '#f59b23' },
    { left: '18%', top: '55%', delay: '0.2s', color: '#3ca7a4' },
    { left: '28%', top: '30%', delay: '0.4s', color: '#5563ff' },
    { left: '45%', top: '15%', delay: '0.1s', color: '#f59b23' },
    { left: '52%', top: '48%', delay: '0.3s', color: '#3ca7a4' },
    { left: '62%', top: '25%', delay: '0.5s', color: '#5563ff' },
    { left: '74%', top: '18%', delay: '0.15s', color: '#f59b23' },
    { left: '82%', top: '50%', delay: '0.35s', color: '#3ca7a4' },
    { left: '90%', top: '28%', delay: '0.55s', color: '#5563ff' }
  ];
  const confetti = [
    { left: '12%', delay: '0s', color: '#f59b23' },
    { left: '20%', delay: '0.1s', color: '#f8c35e' },
    { left: '28%', delay: '0.2s', color: '#3ca7a4' },
    { left: '36%', delay: '0.3s', color: '#5563ff' },
    { left: '44%', delay: '0.15s', color: '#f59b23' },
    { left: '52%', delay: '0.25s', color: '#3ca7a4' },
    { left: '60%', delay: '0.35s', color: '#5563ff' },
    { left: '68%', delay: '0.45s', color: '#f59b23' },
    { left: '76%', delay: '0.2s', color: '#f8c35e' },
    { left: '84%', delay: '0.4s', color: '#3ca7a4' }
  ];

  const handleStartTrial = () => {
    if (showCelebration) return;
    setShowCelebration(true);
    redirectTimer.current = setTimeout(() => {
      navigate('/topics');
    }, 5000);
  };

  const openPayment = () => {
    setPaymentNotice('');
    setPaymentMode(null);
    setUpiId('');
    setCardName('');
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setShowPayment(true);
  };

  const handlePaymentSubmit = (mode: 'upi' | 'card') => {
    if (mode === 'upi') {
      if (!upiId.trim()) {
        setPaymentNotice('Enter a valid UPI ID to continue.');
        return;
      }
    }
    if (mode === 'card') {
      if (!cardName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        setPaymentNotice('Fill in all card details to continue.');
        return;
      }
    }
    setPaymentNotice('Payment initiated. Redirecting to your dashboard...');
    paymentTimer.current = setTimeout(() => {
      setShowPayment(false);
      navigate('/topics');
    }, 1800);
  };

  return (
    <div className="relative -mx-4 overflow-hidden sm:-mx-8">
      <section className="relative px-4 pb-16 pt-14 sm:px-8 lg:pb-20 lg:pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#f3ead6,_#e8edf3_60%,_#f1f3f7_100%)]" />
        <div className="mx-auto max-w-6xl space-y-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-ink-700 shadow-soft">
              Pricing
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
              Start with a 14-day free trial.
            </h1>
            <p className="max-w-2xl text-base text-ink-700 sm:text-lg">
              Explore the full learning loop. Build momentum now, then keep your progress
              going with a simple monthly plan.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="animate-fade-up rounded-3xl border border-ink-200 bg-white/95 p-6 shadow-soft">
              <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                Free Trial
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-ink-900">14 days</h2>
              <p className="mt-1 text-sm text-ink-600">
                Try everything. Cancel before the trial ends to avoid charges.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-ink-700">
                {trialBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-saffron-500" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={handleStartTrial}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Start free trial
              </button>
            </div>

            <div
              className="animate-fade-up rounded-3xl border border-saffron-200 bg-saffron-50/95 p-6 shadow-soft"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="text-xs font-semibold uppercase tracking-wide text-saffron-700">
                Subscription
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-ink-900">299 / month</h2>
              <p className="mt-1 text-sm text-ink-700">
                Keep learning with full access and monthly updates.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-ink-700">
                {subBenefits.map((benefit) => (
                  <li key={benefit} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-ink-900" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-ink-200 bg-white/85 px-4 py-3 text-xs text-ink-600">
                Subscription renews automatically each month unless canceled.
              </div>
              <button
                type="button"
                onClick={openPayment}
                className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-ink-900">Good to know</h2>
            <p className="text-sm text-ink-600 sm:text-base">
              Simple billing, clear expectations, and full control of your plan.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqItems.map((item, index) => (
              <div
                key={item.title}
                className="animate-fade-up rounded-3xl border border-ink-200 bg-white/95 p-5 shadow-soft"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <h3 className="text-base font-semibold text-ink-900">{item.title}</h3>
                <p className="mt-2 text-sm text-ink-600">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {showCelebration && (
        <div className="celebration-overlay" aria-hidden="true">
          <div className="celebration-sheen" />
          {sparkles.map((sparkle) => (
            <span
              key={`${sparkle.left}-${sparkle.top}`}
              className="sparkle"
              style={{
                left: sparkle.left,
                top: sparkle.top,
                animationDelay: sparkle.delay,
                backgroundColor: sparkle.color
              }}
            />
          ))}
          {confetti.map((piece, index) => (
            <span
              key={`${piece.left}-${index}`}
              className="confetti"
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                backgroundColor: piece.color
              }}
            />
          ))}
          <div className="celebration-label">
            Free trial activated
            <span className="celebration-sub">Redirecting to topics...</span>
          </div>
        </div>
      )}

      {showPayment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-3xl border border-ink-200 bg-white/95 p-6 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">Choose a payment option</h3>
                <p className="mt-2 text-sm text-ink-600">
                  Select your preferred method to continue the subscription.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="rounded-full border border-ink-200 px-3 py-1 text-xs font-semibold text-ink-600 transition hover:bg-ink-50"
              >
                Close
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-ink-200 p-4">
                <button
                  type="button"
                  onClick={() => setPaymentMode(paymentMode === 'upi' ? null : 'upi')}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-ink-800"
                >
                  UPI
                  <span className="text-xs font-semibold text-ink-500">Instant</span>
                </button>
                {paymentMode === 'upi' && (
                  <div className="mt-4 space-y-3 text-sm text-ink-700">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500">
                      UPI ID
                      <input
                        value={upiId}
                        onChange={(event) => setUpiId(event.target.value)}
                        placeholder="name@bank"
                        className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePaymentSubmit('upi')}
                      className="w-full rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                    >
                      Pay with UPI
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-ink-200 p-4">
                <button
                  type="button"
                  onClick={() => setPaymentMode(paymentMode === 'card' ? null : 'card')}
                  className="flex w-full items-center justify-between text-left text-sm font-semibold text-ink-800"
                >
                  Card
                  <span className="text-xs font-semibold text-ink-500">Visa / Master</span>
                </button>
                {paymentMode === 'card' && (
                  <div className="mt-4 grid gap-3 text-sm text-ink-700 sm:grid-cols-2">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 sm:col-span-2">
                      Name on card
                      <input
                        value={cardName}
                        onChange={(event) => setCardName(event.target.value)}
                        placeholder="Riya Sharma"
                        className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500 sm:col-span-2">
                      Card number
                      <input
                        value={cardNumber}
                        onChange={(event) => setCardNumber(event.target.value)}
                        placeholder="1234 5678 9012 3456"
                        className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500">
                      Expiry
                      <input
                        value={cardExpiry}
                        onChange={(event) => setCardExpiry(event.target.value)}
                        placeholder="MM/YY"
                        className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm"
                      />
                    </label>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-ink-500">
                      CVV
                      <input
                        value={cardCvv}
                        onChange={(event) => setCardCvv(event.target.value)}
                        placeholder="123"
                        className="mt-2 w-full rounded-2xl border border-ink-200 px-4 py-3 text-sm"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => handlePaymentSubmit('card')}
                      className="sm:col-span-2 w-full rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
                    >
                      Pay with card
                    </button>
                  </div>
                )}
              </div>
            </div>

            {paymentNotice && (
              <div className="mt-5 rounded-2xl border border-ink-200 bg-ink-100 px-4 py-3 text-sm text-ink-700">
                {paymentNotice}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="rounded-full border border-ink-200 px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
