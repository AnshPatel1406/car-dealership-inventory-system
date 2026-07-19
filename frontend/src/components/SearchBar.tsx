// src/components/SearchBar.tsx
// Modern search and filter panel using grid layouts and glassmorphism.

import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchBarProps {
  onSearch: (filters: Record<string, string>) => void;
  onClear: () => void;
}

const CATEGORIES = [
  'Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Hatchback', 'Electric',
  'Compact SUV', 'MPV', 'Premium Hatchback', 'Compact Sedan', 'Luxury SUV', 'Luxury Sedan'
];

export default function SearchBar({ onSearch, onClear }: SearchBarProps) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const filters: Record<string, string> = {};
    if (make.trim()) filters.make = make.trim();
    if (model.trim()) filters.model = model.trim();
    if (category) filters.category = category;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    onSearch(filters);
  };

  const handleClear = () => {
    setMake('');
    setModel('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    onClear();
  };

  const inputStyle =
    'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/50 dark:text-white dark:placeholder-slate-500';

  return (
    <motion.form
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSearch}
      className="sticky top-20 z-40 rounded-2xl border border-slate-200 bg-white/80 p-4 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:border-slate-800 dark:bg-[#09090b]/80 dark:shadow-none"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5 text-indigo-500" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Quick Search
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        {/* Make Input */}
        <div>
          <input
            type="text"
            placeholder="Make (e.g. Toyota)"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className={inputStyle}
          />
        </div>

        {/* Model Input */}
        <div>
          <input
            type="text"
            placeholder="Model (e.g. Camry)"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={inputStyle}
          />
        </div>

        {/* Category Select */}
        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`${inputStyle} appearance-none cursor-pointer`}
          >
            <option value="" className="bg-white dark:bg-slate-900">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-white dark:bg-slate-900">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Min Price Input */}
        <div>
          <input
            type="number"
            placeholder="Min Price (₹)"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            min="0"
            step="10000"
            className={inputStyle}
          />
        </div>

        {/* Max Price Input */}
        <div>
          <input
            type="number"
            placeholder="Max Price (₹)"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            min="0"
            step="10000"
            className={inputStyle}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={handleClear}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 cursor-pointer dark:border-slate-800 dark:bg-[#09090b] dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
          Clear
        </button>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-bold text-white transition-all hover:bg-indigo-500 hover:shadow-md hover:shadow-indigo-500/20 cursor-pointer border-none"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </motion.form>
  );
}
