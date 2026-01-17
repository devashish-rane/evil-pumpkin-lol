import { ReactNode } from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export const AuthLayout = ({ title, subtitle, children, footer }: AuthLayoutProps) => (
  <div className="min-h-screen bg-slate-50 px-6 py-10">
    <div className="mx-auto flex max-w-md flex-col gap-8">
      <Link to="/" className="text-2xl font-semibold text-charcoal-900">
        Pumpkin
      </Link>
      <div className="card p-6">
        <h1 className="text-2xl font-semibold text-charcoal-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        <div className="mt-6 space-y-4">{children}</div>
      </div>
      <div className="text-center text-sm text-slate-500">{footer}</div>
    </div>
  </div>
);
