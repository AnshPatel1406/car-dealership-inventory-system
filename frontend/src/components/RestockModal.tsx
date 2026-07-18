// src/components/RestockModal.tsx
// Modal overlay displaying input controls to update a vehicle's in-stock quantity (Admin only).

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackagePlus, Check } from 'lucide-react';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (quantity: number) => void;
}

export default function RestockModal({
  isOpen,
  onClose,
  onSubmit,
}: RestockModalProps) {
  const [quantity, setQuantity] = useState('1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = Number(quantity);
    if (parsedQty > 0) {
      onSubmit(parsedQty);
      setQuantity('1');
    }
  };

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
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-[#09090b]"
          >
            {/* Accent Top Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

            <div className="p-6">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-wide text-slate-900 dark:text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <PackagePlus className="h-5 w-5" />
                </div>
                Restock Inventory
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="restock-qty"
                    className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                  >
                    Quantity to Add
                  </label>
                  <div className="flex items-center overflow-hidden rounded-xl border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
                    <button
                      type="button"
                      onClick={() => setQuantity(String(Math.max(1, Number(quantity) - 1)))}
                      className="cursor-pointer border-none bg-transparent px-5 py-3.5 text-xl font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      −
                    </button>
                    <input
                      id="restock-qty"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      required
                      className="flex-1 border-none bg-transparent px-2 py-3.5 text-center text-lg font-bold text-slate-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(String(Number(quantity || 0) + 1))}
                      className="cursor-pointer border-none bg-transparent px-5 py-3.5 text-xl font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions Layout */}
                <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
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
                    className="flex cursor-pointer items-center gap-2 rounded-xl border-none bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    <Check className="h-4 w-4" />
                    Apply Restock
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
