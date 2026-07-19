// src/components/VehicleFormModal.tsx
// Modal overlay displaying form controls to add or update vehicle specifications (Admin only).

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Car, Check } from 'lucide-react';
import type { Vehicle } from './VehicleCard';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
  }) => void;
  editingVehicle: Vehicle | null;
}

const CATEGORIES = [
  'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Hatchback', 'Electric',
  'Compact SUV', 'MPV', 'Premium Hatchback', 'Compact Sedan', 'Luxury SUV', 'Luxury Sedan'
];

export default function VehicleFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingVehicle,
}: VehicleFormModalProps) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('Sedan');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState("1");

  // Pre-populate form fields when editing an existing vehicle
  useEffect(() => {
    if (editingVehicle) {
      setMake(editingVehicle.make);
      setModel(editingVehicle.model);
      setCategory(editingVehicle.category);
      setPrice(String(editingVehicle.price));
      setQuantity(String(editingVehicle.quantity));
    } else {
      setMake('');
      setModel('');
      setCategory('Sedan');
      setPrice('');
      setQuantity('1');
    }
  }, [editingVehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      make: make.trim(),
      model: model.trim(),
      category,
      price: Number(price),
      quantity: Number(quantity),
    });
  };

  const labelStyle = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400';
  const inputStyle =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:placeholder-slate-500';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-[#09090b]"
          >
            {/* Accent Top Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-indigo-600" />

            <div className="p-6">
              <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-wide text-slate-900 dark:text-white">
                {editingVehicle ? (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                      <Edit className="h-5 w-5" />
                    </div>
                    Edit Vehicle Specifications
                  </>
                ) : (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                      <Car className="h-5 w-5" />
                    </div>
                    Register New Vehicle
                  </>
                )}
              </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Make Input */}
              <div>
                <label className={labelStyle}>Make</label>
                <input
                  type="text"
                  placeholder="e.g. Toyota"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  required
                  className={inputStyle}
                />
              </div>

              {/* Model Input */}
              <div>
                <label className={labelStyle}>Model</label>
                <input
                  type="text"
                  placeholder="e.g. Camry"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  className={inputStyle}
                />
              </div>
            </div>

            {/* Category Select */}
            <div>
              <label className={labelStyle}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`${inputStyle} appearance-none cursor-pointer`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-white dark:bg-slate-950">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Input */}
            <div>
              <label className={labelStyle}>Price (₹)</label>
              <input
                type="number"
                placeholder="e.g. 29000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                required
                className={inputStyle}
              />
            </div>

            {/* Quantity Stepper */}
            <div>
              <label className={labelStyle}>Quantity</label>
              <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 overflow-hidden dark:border-slate-700 dark:bg-slate-900/60">
                <button
                  type="button"
                  onClick={() => setQuantity(String(Math.max(0, Number(quantity) - 1)))}
                  className="px-5 py-3.5 text-xl font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 cursor-pointer border-none bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-transparent py-3 text-center text-lg font-bold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(String(Number(quantity) + 1))}
                  className="px-5 py-3.5 text-xl font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 cursor-pointer border-none bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-end gap-3 border-t border-slate-200 pt-5 dark:border-slate-800/80">
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer rounded-xl border-none bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20"
              >
                <Check className="h-4 w-4" />
                {editingVehicle ? 'Save Specifications' : 'Register Vehicle'}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
    )}
    </AnimatePresence>
  );
}
