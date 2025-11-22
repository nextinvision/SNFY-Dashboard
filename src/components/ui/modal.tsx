'use client';

import { Button } from "./button";

interface ModalProps {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function Modal({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  open,
  onConfirm,
  onClose,
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
          {description && (
            <p className="mt-2 text-sm text-zinc-600">{description}</p>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

