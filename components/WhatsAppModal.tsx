'use client';

import { useEffect, useRef, useState } from 'react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

interface WhatsAppModalProps {
  nama: string;
  phone: string;
  defaultMessage: string;
  onClose: () => void;
}

export default function WhatsAppModal({ nama, phone, defaultMessage, onClose }: WhatsAppModalProps) {
  const [message, setMessage] = useState(defaultMessage);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handleContinue = () => {
    window.open(buildWhatsAppUrl(phone, message), '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div className="w-full max-w-lg bg-white rounded-lg border border-gray-200 shadow-xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <div>
            <h2 id="whatsapp-modal-title" className="text-sm font-semibold text-gray-900">
              Hantar mesej WhatsApp
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{nama} &middot; {phone}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="p-2 -m-2 text-gray-400 hover:text-gray-600 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          <label htmlFor="whatsapp-message" className="block text-xs font-medium text-gray-500 mb-1">
            Mesej
          </label>
          <textarea
            id="whatsapp-message"
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={!message.trim()}
            className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            Teruskan
          </button>
        </div>
      </div>
    </div>
  );
}
