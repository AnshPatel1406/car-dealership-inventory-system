// src/pages/DashboardPage.tsx
// Dashboard landing page layout shell integrating the navigation bar.

import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function DashboardPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-bg-dark">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {isAdmin ? 'Admin Inventory Dashboard' : 'Available Vehicles'}
            </h1>
            <p className="mt-1 text-sm text-text-secondary">
              {isAdmin
                ? 'Manage, restock, update, and track vehicle inventory records.'
                : 'Browse our catalog and purchase your next vehicle.'}
            </p>
          </div>

          {isAdmin && (
            <button
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 cursor-pointer border-none"
            >
              + Add Vehicle
            </button>
          )}
        </div>

        {/* Dashboard Grid Shell Placeholder (Will contain search and cards in subsequent steps) */}
        <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-text-secondary">
          <p className="text-lg">Inventory grid loading placeholder…</p>
        </div>
      </main>
    </div>
  );
}
