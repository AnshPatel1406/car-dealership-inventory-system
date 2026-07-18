// src/pages/DashboardPage.tsx
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <h1 className="text-3xl font-bold mb-4 text-white">Dashboard Placeholder</h1>
      <p className="text-slate-400 mb-6">Welcome, {user?.email} ({user?.role})</p>
      <button
        onClick={logout}
        className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 cursor-pointer"
      >
        Logout
      </button>
    </div>
  );
}
