import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "../store/useAuth";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    login(email);
    navigate("/");
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Revision first. No streak theater."
      footer={
        <span>
          New here?{" "}
          <Link className="text-slate-900 underline" to="/signup">
            Create an account
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-600">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="you@example.com"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          Login
        </button>
      </form>
    </AuthLayout>
  );
};
