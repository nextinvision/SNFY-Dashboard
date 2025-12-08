'use client';

import { Button } from "./button";
import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
  showCancel?: boolean;
  children?: ReactNode;
  confirmVariant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  hideButtons?: boolean;
}

export function Modal({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  open,
  onConfirm,
  onClose,
  isLoading = false,
  showCancel = true,
  children,
  confirmVariant = 'destructive',
  hideButtons = false,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={hideButtons ? onClose : undefined}
    >
      <div 
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {hideButtons && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-zinc-600">{description}</p>
          )}
          {children && (
            <div className="mt-4">{children}</div>
          )}
        </div>
        {!hideButtons && (
          <div className="flex justify-end gap-3">
            {showCancel && (
              <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                {cancelLabel}
              </Button>
            )}
            <Button 
              variant={confirmVariant} 
              onClick={onConfirm} 
              disabled={isLoading}
            >
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

