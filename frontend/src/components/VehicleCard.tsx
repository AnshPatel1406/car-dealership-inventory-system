// src/components/VehicleCard.tsx
// Premium card interface displaying vehicle specifications, stock alerts, and interactive purchase controls.

import { useAuth } from '../context/AuthContext';

export interface Vehicle {
  _id: string;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onPurchase: (id: string) => void;
  onRestock: (id: string) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: string) => void;
}

// Accent gradient headers based on vehicle category
const categoryGradients: Record<string, string> = {
  Sedan: 'from-blue-500 to-indigo-600',
  SUV: 'from-emerald-500 to-teal-600',
  Truck: 'from-amber-500 to-orange-600',
  Coupe: 'from-violet-500 to-purple-600',
  Convertible: 'from-rose-500 to-pink-600',
  Hatchback: 'from-cyan-500 to-sky-600',
};

export default function VehicleCard({
  vehicle,
  onPurchase,
  onRestock,
  onEdit,
  onDelete,
}: VehicleCardProps) {
  const { isAdmin } = useAuth();
  const isOutOfStock = vehicle.quantity === 0;
  const gradient = categoryGradients[vehicle.category] ?? 'from-slate-500 to-slate-600';

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5">
      {/* Category Gradient Top Bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

      <div className="flex flex-1 flex-col p-6">
        {/* Header Information */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400">
              {vehicle.make} <span className="font-semibold text-slate-300">{vehicle.model}</span>
            </h3>
            <span className="mt-2 inline-block rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {vehicle.category}
            </span>
          </div>
          <div className="text-right">
            <span className="text-xl font-black text-indigo-400">
              ₹{vehicle.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Stock Status Indicator */}
        <div className="mb-6 flex items-center gap-2">
          <div
            className={`h-2.5 w-2.5 rounded-full ${isOutOfStock
                ? 'bg-danger animate-pulse'
                : 'bg-success'
              }`}
          />
          <span
            className={`text-xs font-semibold uppercase tracking-wider ${isOutOfStock ? 'text-danger' : 'text-success'
              }`}
          >
            {isOutOfStock ? 'Out of Stock' : `${vehicle.quantity} Units Available`}
          </span>
        </div>

        {/* Buttons / Actions Layout */}
        <div className="mt-auto flex flex-col gap-2">
          {/* Main Action: Purchase */}
          <button
            onClick={() => onPurchase(vehicle._id)}
            disabled={isOutOfStock}
            className={`w-full rounded-xl py-3 text-sm font-bold transition-all border-none ${isOutOfStock
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer'
              }`}
          >
            {isOutOfStock ? 'Sold Out' : 'Purchase Vehicle'}
          </button>

          {/* Admin Management Buttons */}
          {isAdmin && (
            <div className="mt-2 flex gap-2 border-t border-slate-800 pt-3">
              <button
                onClick={() => onRestock(vehicle._id)}
                className="flex-1 rounded-lg bg-emerald-600/10 py-2.5 text-xs font-bold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20 cursor-pointer"
              >
                📦 Restock
              </button>
              <button
                onClick={() => onEdit(vehicle)}
                className="rounded-lg bg-slate-800 px-3.5 py-2.5 text-xs font-bold text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white cursor-pointer"
                title="Edit details"
              >
                ✏️
              </button>
              <button
                onClick={() => onDelete(vehicle._id)}
                className="rounded-lg bg-red-600/10 px-3.5 py-2.5 text-xs font-bold text-red-400 border border-red-500/20 hover:bg-red-600/20 cursor-pointer"
                title="Delete vehicle"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
