import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  vehicleInfo?: { make: string; model: string } | null;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  vehicleInfo,
}: DeleteConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity dark:bg-slate-950/80"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all sm:my-8 dark:border-slate-700/60 dark:bg-slate-900"
          >
            {/* Header with Danger Style */}
            <div className="border-b border-red-500/20 bg-red-50/50 px-6 py-5 dark:bg-red-500/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/20">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Inventory</h3>
          </div>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to completely remove{' '}
            {vehicleInfo ? (
              <span className="font-bold text-slate-900 dark:text-white">
                {vehicleInfo.make} {vehicleInfo.model}
              </span>
            ) : (
              'this vehicle'
            )}{' '}
            from the inventory?
          </p>
          <p className="mt-2 text-xs text-red-400">
            This action cannot be undone and will permanently delete all stock records for this vehicle.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg border-none bg-transparent px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-500 transition-colors cursor-pointer border-none"
          >
            <Trash2 className="h-4 w-4" />
            Confirm Delete
          </motion.button>
        </div>
      </motion.div>
    </div>
    )}
    </AnimatePresence>
  );
}
