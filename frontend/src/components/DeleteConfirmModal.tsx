import React from 'react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity dark:bg-slate-950/80"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all sm:my-8 dark:border-slate-700/60 dark:bg-slate-900">
        {/* Header with Danger Style */}
        <div className="border-b border-red-500/20 bg-red-500/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-500">
              <span className="text-xl" role="img" aria-label="warning">
                ⚠️
              </span>
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
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-red-500/20 hover:bg-red-500 transition-colors cursor-pointer border-none"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
