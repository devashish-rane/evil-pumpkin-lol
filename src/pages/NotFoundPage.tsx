import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => (
  <div className="min-h-screen bg-saffron-50 px-4 py-10">
    <div className="mx-auto max-w-md rounded-3xl border border-saffron-100 bg-white p-8 text-center shadow-card">
      <h1 className="text-2xl font-semibold text-slateInk-900">Page not found</h1>
      <p className="mt-2 text-sm text-slateInk-600">
        The page you were looking for moved or never existed.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex rounded-full bg-slateInk-900 px-5 py-2 text-xs font-semibold text-white"
      >
        Return home
      </Link>
    </div>
  </div>
);

export default NotFoundPage;
