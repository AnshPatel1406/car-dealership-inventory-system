// src/components/Navbar.tsx
// Top navigation bar containing branding, dynamic admin badge, user details, and logout button.

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShieldAlert, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-[#09090b]/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2.5">
        {/* Brand/Logo */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 border-none bg-transparent text-xl font-bold tracking-tight text-slate-900 cursor-pointer dark:text-white"
        >
          <img src="/logo.png" alt="CarVault Logo" className="h-10 w-auto object-contain" />
          <span>CarVault</span>
          {isAdmin && (
            <span className="ml-2 flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 border border-indigo-500/20">
              <ShieldAlert className="h-3 w-3" />
              Admin
            </span>
          )}
        </motion.button>

        {/* User context & Action */}
        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex dark:border-slate-800 dark:bg-slate-900">
            <UserCircle className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {user?.email}
            </span>
          </div>
          
          <ThemeToggle />
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-800 cursor-pointer dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </div>
    </nav>
  );
}
