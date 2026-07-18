// src/pages/DashboardPage.tsx
// Core dashboard controller displaying live vehicle data, implementing search filters, inventory purchase, and administrative CRUD operations.

import { useState, useEffect, useCallback, useMemo } from 'react';
import { vehiclesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Database, AlertCircle, Banknote, PackageSearch } from 'lucide-react';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import VehicleCard, { type Vehicle } from '../components/VehicleCard';
import VehicleFormModal from '../components/VehicleFormModal';
import RestockModal from '../components/RestockModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Visibility States
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeRestockId, setActiveRestockId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Fetch vehicles helper
  const loadVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vehiclesAPI.getAll();
      setVehicles(res.data.data ?? res.data);
    } catch {
      toast.error('Could not load inventory database.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // Search/Filter Integration
  const handleSearch = async (filters: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await vehiclesAPI.search(filters);
      setVehicles(res.data.data ?? res.data);
    } catch {
      toast.error('Search request failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    loadVehicles();
  };

  // Purchase vehicle action
  const handlePurchase = async (id: string) => {
    try {
      await vehiclesAPI.purchase(id);
      toast.success('Vehicle purchased successfully! 🎉');
      loadVehicles();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? 'Purchase transaction failed.');
    }
  };

  // Add or Edit Submission Handler
  const handleVehicleFormSubmit = async (data: {
    make: string;
    model: string;
    category: string;
    price: number;
    quantity: number;
  }) => {
    try {
      if (editingVehicle) {
        await vehiclesAPI.update(editingVehicle._id, data);
        toast.success('Vehicle specifications updated successfully.');
      } else {
        await vehiclesAPI.create(data);
        toast.success('Vehicle registered into inventory database.');
      }
      setIsVehicleModalOpen(false);
      setEditingVehicle(null);
      loadVehicles();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? 'Failed to update vehicle record.');
    }
  };

  // Restock Submission Handler
  const handleRestockSubmit = async (amountToAdd: number) => {
    if (!activeRestockId) return;
    try {
      await vehiclesAPI.restock(activeRestockId, amountToAdd);
      toast.success(`Successfully added ${amountToAdd} units to stock.`);
      setIsRestockModalOpen(false);
      setActiveRestockId(null);
      loadVehicles();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? 'Restock transaction failed.');
    }
  };

  // Click Trigger Helpers
  const handleRestockClick = (id: string) => {
    setActiveRestockId(id);
    setIsRestockModalOpen(true);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsVehicleModalOpen(true);
  };

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    try {
      await vehiclesAPI.remove(vehicleToDelete._id);
      toast.success('Vehicle removed successfully.');
      loadVehicles();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(axiosErr.response?.data?.message ?? 'Delete request failed.');
    } finally {
      setVehicleToDelete(null);
    }
  };

  // Compute Stats for Admin
  const totalVehicles = vehicles.length;
  const totalValue = useMemo(() => vehicles.reduce((sum, v) => sum + (v.price * v.quantity), 0), [vehicles]);
  const lowStockCount = useMemo(() => vehicles.filter(v => v.quantity <= 2).length, [vehicles]);

  // Premium Skeleton Card component
  const SkeletonCard = () => (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/20">
      <div className="mb-4 h-1.5 w-full rounded bg-slate-300 dark:bg-slate-800" />
      <div className="mb-2 h-6 w-3/4 rounded bg-slate-300 dark:bg-slate-800" />
      <div className="mb-4 h-4 w-1/3 rounded bg-slate-300 dark:bg-slate-800" />
      <div className="mb-6 h-4 w-1/2 rounded bg-slate-300 dark:bg-slate-800" />
      <div className="h-11 w-full rounded-xl bg-slate-300 dark:bg-slate-800" />
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-[#0b0f19]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isAdmin ? 'Admin Inventory Dashboard' : 'Available Vehicles'}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {isAdmin
                ? 'Manage, restock, update, and track vehicle inventory records.'
                : 'Browse our catalog and purchase your next vehicle.'}
            </p>
          </div>

          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingVehicle(null);
                setIsVehicleModalOpen(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 cursor-pointer border-none"
            >
              <Plus className="h-5 w-5" />
              Add Vehicle
            </motion.button>
          )}
        </div>

        {/* Admin Quick Stats Hero */}
        {isAdmin && !loading && (
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#09090b]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Models</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalVehicles}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#09090b]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Low Stock Alerts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{lowStockCount}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#09090b]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <Banknote className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Inventory Value</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹{totalValue.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar Panel */}
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} onClear={handleClear} />
        </div>

        {/* Inventory Layout */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[...Array(6)].map((_, idx) => (
                <SkeletonCard key={idx} />
              ))}
            </motion.div>
          ) : vehicles.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-24 px-4 text-center dark:border-slate-800 dark:bg-[#09090b]/50"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500">
                <PackageSearch className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No vehicles found</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                We couldn't find any inventory matching your current filters. Adjust your search terms to see more results.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              <AnimatePresence>
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle._id}
                    vehicle={vehicle}
                    onPurchase={handlePurchase}
                    onRestock={handleRestockClick}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />

      {/* Admin Overlays */}
      <VehicleFormModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setEditingVehicle(null);
        }}
        onSubmit={handleVehicleFormSubmit}
        editingVehicle={editingVehicle}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setActiveRestockId(null);
        }}
        onSubmit={handleRestockSubmit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setVehicleToDelete(null);
        }}
        onConfirm={confirmDelete}
        vehicleInfo={vehicleToDelete ? { make: vehicleToDelete.make, model: vehicleToDelete.model } : null}
      />
    </div>
  );
}
