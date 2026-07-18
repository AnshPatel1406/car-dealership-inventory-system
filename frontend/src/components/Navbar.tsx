// src/components/Navbar.tsx
// Top navigation bar containing branding, dynamic admin badge, user details, and logout button.

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-[#334155] dark:bg-[#0b0f19]/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand/Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 border-none bg-transparent text-xl font-bold tracking-tight text-slate-900 hover:opacity-85 cursor-pointer dark:text-white"
        >
          <img src="/logo.png" alt="CarVault Logo" className="h-16 w-auto object-contain" />
          <span>CarVault</span>
          {isAdmin && (
            <span className="ml-2 rounded-full bg-indigo-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              Admin
            </span>
          )}
        </button>

        {/* User context & Action */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span className="hidden text-sm text-slate-500 sm:inline dark:text-slate-400">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-red-500 hover:bg-red-500 hover:text-white dark:border-[#334155] dark:bg-[#151f32] dark:text-slate-200 dark:hover:bg-red-500 dark:hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
