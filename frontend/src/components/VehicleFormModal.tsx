// src/components/VehicleFormModal.tsx
// Modal overlay displaying form controls to add or update vehicle specifications (Admin only).

import { useState, useEffect } from 'react';
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

const CATEGORIES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Hatchback'];

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

  const labelStyle = 'mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-400';
  const inputStyle =
    'w-full rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-2xl backdrop-blur-xl transition-all">
        {/* Accent Top Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-indigo-600" />

        <div className="p-6">
          <h2 className="text-xl font-bold text-white tracking-wide mb-5">
            {editingVehicle ? '✏️ Edit Vehicle Specifications' : '🚗 Register New Vehicle'}
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
                  <option key={cat} value={cat} className="bg-slate-950">
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
              <div className="flex items-center rounded-xl border border-slate-700 bg-slate-900/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(String(Math.max(0, Number(quantity) - 1)))}
                  className="px-5 py-3.5 text-xl font-bold text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer border-none bg-transparent"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min="0"
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

            {/* Form Actions */}
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
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 cursor-pointer border-none"
              >
                {editingVehicle ? 'Save Specifications' : 'Register Vehicle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
