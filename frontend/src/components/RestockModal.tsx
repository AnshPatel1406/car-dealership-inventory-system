// src/components/RestockModal.tsx
// Modal overlay displaying input controls to update a vehicle's in-stock quantity (Admin only).

import { useState } from 'react';

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

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedQty = Number(quantity);
    if (parsedQty > 0) {
      onSubmit(parsedQty);
      setQuantity('1');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl backdrop-blur-xl transition-all">
        {/* Accent Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 to-teal-500" />

        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-wide mb-4 flex items-center gap-2">
            <span>📦</span> Restock Vehicle Inventory
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="restock-qty"
                className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400"
              >
                Quantity to Add
              </label>
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(String(Math.max(1, Number(quantity) - 1)))}
                  className="px-5 py-3.5 text-xl font-bold text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer border-none bg-transparent"
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
                  className="flex-1 border-none bg-transparent px-2 py-3.5 text-center text-lg font-bold text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(String(Number(quantity || 0) + 1))}
                  className="px-5 py-3.5 text-xl font-bold text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer border-none bg-transparent"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions Layout */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer border-none"
              >
                Apply Restock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
