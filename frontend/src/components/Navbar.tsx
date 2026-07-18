// src/components/Navbar.tsx
// Top navigation bar containing branding, dynamic admin badge, user details, and logout button.

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border-custom bg-bg-dark/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Brand/Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 border-none bg-transparent text-xl font-bold tracking-tight text-white hover:opacity-85 cursor-pointer"
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
          <span className="text-sm text-text-secondary hidden sm:inline">
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-border-custom bg-bg-card px-4 py-2 text-sm font-semibold text-text-primary hover:bg-danger hover:text-white cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
