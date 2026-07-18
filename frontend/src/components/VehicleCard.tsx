// src/components/VehicleCard.tsx
// Premium, editorial-style card interface displaying vehicle specifications and stock status.

import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { PackagePlus, Edit, Trash2 } from 'lucide-react';

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

export default function VehicleCard({
  vehicle,
  onPurchase,
  onRestock,
  onEdit,
  onDelete,
}: VehicleCardProps) {
  const { isAdmin } = useAuth();
  const isOutOfStock = vehicle.quantity === 0;
  const isLowStock = !isOutOfStock && vehicle.quantity <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      className="flex flex-col border border-slate-200 bg-[#FAFAF9] p-8 shadow-sm transition-all hover:shadow-md dark:border-slate-800/60 dark:bg-[#111113] dark:shadow-none"
    >
      <div className="flex flex-col gap-6">
        {/* Header: Name and Price */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col items-start gap-3">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">
              {vehicle.make} {vehicle.model}
            </h3>
            <span className="rounded-full border border-slate-300 bg-transparent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {vehicle.category}
            </span>
          </div>
          <div className="text-right">
            <span className="font-serif text-2xl font-light tracking-wide text-slate-600 dark:text-slate-300">
              ₹{vehicle.price.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <hr className="border-t-0 border-b border-slate-200 dark:border-slate-800" />

        {/* Stock Status */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${
                  isOutOfStock
                    ? 'border-red-300 text-red-600 dark:border-red-900/50 dark:text-red-400'
                    : isLowStock
                    ? 'border-amber-300 text-amber-600 dark:border-amber-900/50 dark:text-amber-400'
                    : 'border-teal-300 text-teal-700 dark:border-teal-900/50 dark:text-teal-400'
                }`}
              >
                {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {vehicle.quantity} {vehicle.quantity === 1 ? 'Unit' : 'Units'}
              </span>
            </div>
          </div>
          
          {/* Progress line visualization */}
          <div className="flex h-[3px] w-full gap-0.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            {Array.from({ length: 15 }).map((_, i) => (
              <div 
                key={i} 
                className={`h-full flex-1 ${
                  i < Math.min(vehicle.quantity, 15) 
                    ? (isLowStock ? 'bg-amber-500' : 'bg-teal-700 dark:bg-teal-600') 
                    : 'bg-transparent'
                }`} 
              />
            ))}
          </div>
        </div>

        <hr className="border-t-0 border-b border-slate-200 dark:border-slate-800" />

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => onPurchase(vehicle._id)}
            disabled={isOutOfStock}
            className={`w-full rounded-[8px] border-none py-3.5 text-sm font-bold tracking-wide transition-all ${
              isOutOfStock
                ? 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                : 'cursor-pointer bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
            }`}
          >
            {isOutOfStock ? 'UNAVAILABLE' : 'PURCHASE VEHICLE'}
          </button>

          {isAdmin && (
            <>
              <hr className="border-t-0 border-b border-slate-200 dark:border-slate-800" />
              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  onClick={() => onEdit(vehicle)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-none bg-transparent py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => onRestock(vehicle._id)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-none bg-transparent py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <PackagePlus className="h-3.5 w-3.5" /> Restock
                </button>
                <button
                  onClick={() => onDelete(vehicle)}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 border-none bg-transparent py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
