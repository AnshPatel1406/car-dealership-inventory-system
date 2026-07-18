// src/pages/LoginPage.tsx
// Single entry point for both Login and Registration.
// Detects role from the JWT on login and redirects to the dashboard.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

type Tab = 'login' | 'register';

interface ApiError {
  message?: string;
  errors?: string[];
}

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
  };

  const switchTab = (next: Tab) => {
    setTab(next);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (tab === 'register') {
        await register(name, email, password);
        switchTab('login');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      const axiosErr = err as AxiosError<ApiError>;
      const msg =
        axiosErr.response?.data?.errors?.[0] ??
        axiosErr.response?.data?.message ??
        'Something went wrong. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">

      {/* Ambient background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <div className="absolute -top-48 left-1/2 h-[500px] w-[700px] -translate-x-1/2 bg-indigo-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[500px] bg-cyan-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center flex flex-col items-center">
          <img src="/logo.png" alt="CarVault Logo" className="h-40 w-auto object-contain" />
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            CarVault
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Premium Car Dealership Inventory
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl">

          {/* Tab switcher */}
          <div className="mb-6 flex rounded-xl bg-slate-800 p-1">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-all cursor-pointer border-none ${tab === t
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-medium uppercase tracking-wider text-slate-400"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              {tab === 'register' && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Must include uppercase, lowercase & a number (min 6 chars)
                </p>
              )}
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer border-none"
            >
              {loading
                ? 'Please wait…'
                : tab === 'register'
                  ? 'Create Account'
                  : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
