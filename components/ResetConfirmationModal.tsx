'use client';

import React from 'react';
import { RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ResetConfirmationModal: React.FC<ResetConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 no-print">
      <div
        className="bg-card text-card-foreground border border-border rounded-xl w-full max-w-sm p-5 shadow-2xl relative space-y-4 animate-in zoom-in-95 duration-150 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition cursor-pointer"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7f469b]/10 border border-[#7f469b]/20 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 text-[#7f469b] dark:text-[#a862c8]" />
          </div>
          <h3 className="text-base font-extrabold text-foreground tracking-tight">
            Restore App Defaults?
          </h3>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-foreground border-border hover:bg-accent rounded-md cursor-pointer"
          >
            No, Cancel
          </Button>

          <Button
            type="button"
            variant="gradient"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 text-xs font-bold rounded-md shadow-xs gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yes, Restore App</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
