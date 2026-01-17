import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { useAuth } from "../store/useAuth";

export const SignupPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email) return;
    signup(name, email);
    navigate("/");
  };

  return (
    <AuthLayout
      title="Create your Pumpkin"
      subtitle="A calm system for serious recall."
      footer={
        <span>
          Already have an account?{" "}
          <Link className="text-slate-900 underline" to="/login">
            Login
          </Link>
        </span>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-slate-600">
          Name
          <input
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="Ada"
          />
        </label>
        <label className="block text-sm font-medium text-slate-600">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2"
            placeholder="ada@example.com"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-saffron-200 px-4 py-3 text-sm font-semibold text-charcoal-900"
        >
          Sign up
        </button>
      </form>
    </AuthLayout>
  );
};
