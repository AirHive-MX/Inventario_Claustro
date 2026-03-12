'use client';

import { useEffect } from 'react';

/**
 * Popup component for confirmations and notifications.
 *
 * type: 'confirm' | 'success' | 'error' | 'info'
 * onConfirm: called when user clicks confirm (only for type='confirm')
 * onClose: called when user dismisses
 */
export default function Popup({ type = 'info', title, message, onConfirm, onClose }) {
  const isConfirm = type === 'confirm';

  // Auto-close notifications after 3 seconds
  useEffect(() => {
    if (!isConfirm) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isConfirm, onClose]);

  const icons = {
    confirm: '⚠️',
    success: '✅',
    error: '❌',
    info: 'ℹ️',
  };

  const iconBgColors = {
    confirm: 'bg-yellow-100 dark:bg-yellow-900/30',
    success: 'bg-green-100 dark:bg-green-900/30',
    error: 'bg-red-100 dark:bg-red-900/30',
    info: 'bg-blue-100 dark:bg-blue-900/30',
  };

  const titles = {
    confirm: title || 'Confirmar acción',
    success: title || 'Listo',
    error: title || 'Error',
    info: title || 'Aviso',
  };

  // Notification toast (success, error, info)
  if (!isConfirm) {
    return (
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[70] modal-backdrop">
        <div className="modal-content flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 sm:py-5 rounded-2xl shadow-2xl border bg-white dark:bg-[#1a2236] border-ah-gray/50 dark:border-[#2a3650] sm:max-w-md">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${iconBgColors[type]} flex items-center justify-center text-xl sm:text-2xl flex-shrink-0`}>
            {icons[type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ah-navy dark:text-[#edf3ff] uppercase tracking-wide">
              {titles[type]}
            </p>
            <p className="text-sm sm:text-base text-ah-charcoal dark:text-[#d0daf0] mt-0.5">
              {message}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-ah-charcoal/40 dark:text-[#5a6e8a] hover:bg-gray-100 dark:hover:bg-[#243048] transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  // Confirmation dialog
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center modal-backdrop">
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-[#121e32] rounded-3xl shadow-2xl modal-content transition-colors duration-300">
        <div className="px-6 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6 flex flex-col items-center text-center">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${iconBgColors[type]} flex items-center justify-center text-3xl sm:text-4xl mb-4 sm:mb-5`}>
            {icons[type]}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-ah-navy dark:text-[#edf3ff] mb-2 sm:mb-3">
            {titles[type]}
          </h3>
          <p className="text-base sm:text-lg text-ah-charcoal dark:text-[#d0daf0] leading-relaxed">
            {message}
          </p>
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 sm:px-6 py-4 text-lg font-semibold rounded-full border-2 border-ah-gray dark:border-[#3a4e6a] text-ah-charcoal dark:text-[#a0b4d0] hover:bg-gray-50 dark:hover:bg-[#1a2236] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 sm:px-6 py-4 text-lg font-semibold rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
