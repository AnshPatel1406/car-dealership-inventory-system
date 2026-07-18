// src/components/SearchBar.tsx
// Modern search and filter panel using grid layouts and glassmorphism.

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (filters: Record<string, string>) => void;
  onClear: () => void;
}

const CATEGORIES = ['Sedan', 'SUV', 'Truck', 'Coupe', 'Convertible', 'Hatchback'];

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
    <form
      onSubmit={handleSearch}
      className="rounded-2xl border border-slate-200 bg-white/60 p-6 backdrop-blur-xl shadow-lg dark:border-slate-700/60 dark:bg-slate-900/40"
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-xl" role="img" aria-label="search">🔍</span>
        <h2 className="text-lg font-bold text-slate-900 tracking-wide dark:text-white">
          Filter Inventory
        </h2>
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
            className={inputStyle}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-xl border border-slate-300 bg-transparent px-6 py-2.5 text-sm font-semibold text-slate-600 hover:border-slate-400 hover:text-slate-900 cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
        >
          Clear Filters
        </button>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-7 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 cursor-pointer border-none"
        >
          Apply Filters
        </button>
      </div>
    </form>
  );
}
