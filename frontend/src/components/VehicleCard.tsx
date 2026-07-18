// src/components/VehicleCard.tsx
// Premium card interface displaying vehicle specifications, stock alerts, and interactive purchase controls.

import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { PackagePlus, Edit, Trash2, CarFront, Truck, Gauge, Shield, Zap, Car } from 'lucide-react';

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
  onDelete: (vehicle: Vehicle) => void;
}

// Accent gradient headers based on vehicle category
const categoryGradients: Record<string, string> = {
  Sedan: 'from-blue-500/20 to-indigo-600/20 text-indigo-500',
  SUV: 'from-emerald-500/20 to-teal-600/20 text-teal-500',
  Truck: 'from-amber-500/20 to-orange-600/20 text-orange-500',
  Coupe: 'from-violet-500/20 to-purple-600/20 text-purple-500',
  Convertible: 'from-rose-500/20 to-pink-600/20 text-pink-500',
  Hatchback: 'from-cyan-500/20 to-sky-600/20 text-cyan-500',
};

const CategoryIcon = ({ category, className }: { category: string; className?: string }) => {
  switch (category) {
    case 'SUV': return <Shield className={className} />;
    case 'Truck': return <Truck className={className} />;
    case 'Coupe': return <Zap className={className} />;
    case 'Convertible': return <CarFront className={className} />;
    case 'Hatchback': return <Gauge className={className} />;
    case 'Sedan':
    default:
      return <Car className={className} />;
  }
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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/60 backdrop-blur-md shadow-sm transition-colors hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-800 dark:bg-[#09090b]/40 dark:hover:border-indigo-500/50"
    >
      {/* Category Illustration Area */}
      <div className={`flex h-32 w-full items-center justify-center bg-gradient-to-br ${gradient} bg-opacity-10`}>
        <motion.div whileHover={{ scale: 1.1, rotate: -2 }} transition={{ type: "spring", stiffness: 300 }}>
          <CategoryIcon category={vehicle.category} className="h-16 w-16 opacity-80" />
        </motion.div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {/* Header Information */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-500 dark:text-white dark:group-hover:text-indigo-400">
              {vehicle.make} <span className="font-semibold text-slate-600 dark:text-slate-300">{vehicle.model}</span>
            </h3>
            <span className="mt-2 inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
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
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10 cursor-pointer'
              }`}
          >
            {isOutOfStock ? 'Sold Out' : 'Purchase Vehicle'}
          </button>

          {/* Admin Management Buttons */}
          {isAdmin && (
            <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onRestock(vehicle._id)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500/10 py-2 text-xs font-bold text-emerald-600 transition-colors hover:bg-emerald-500/20 cursor-pointer dark:text-emerald-400 border border-emerald-500/20"
              >
                <PackagePlus className="h-3.5 w-3.5" />
                Restock
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onEdit(vehicle)}
                className="flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 cursor-pointer dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                title="Edit details"
              >
                <Edit className="h-4 w-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onDelete(vehicle)}
                className="flex items-center justify-center rounded-lg bg-red-500/10 px-3 py-2 text-red-500 transition-colors hover:bg-red-500/20 hover:text-red-600 cursor-pointer border border-red-500/20 dark:hover:text-red-400"
                title="Delete vehicle"
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
