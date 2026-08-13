'use client';

import React from 'react';
import { DocumentData } from '@/types/letterhead';
import { Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RecipientTabProps {
  document: DocumentData;
  onChange: (updated: DocumentData) => void;
}

export const RecipientTab: React.FC<RecipientTabProps> = ({
  document,
  onChange,
}) => {
  const updateRecipient = (updates: Partial<DocumentData['recipient']>) => {
    onChange({
      ...document,
      recipient: { ...document.recipient, ...updates },
    });
  };

  // Auto Generate Ref Number
  const handleAutoGenerateRef = () => {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const dateStr = new Date().toISOString().slice(0, 7).replace('-', '/');
    onChange({
      ...document,
      refNumber: `REF: SX/${dateStr}/${randomSeq}`,
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          📌 Document Identifiers
        </h4>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-foreground font-medium">Reference Number</label>
              <button
                type="button"
                onClick={handleAutoGenerateRef}
                className="text-[11px] text-[#7f469b] dark:text-[#a862c8] hover:underline flex items-center gap-1 font-semibold"
              >
                <Sparkles className="w-3 h-3" /> Auto-Gen
              </button>
            </div>
            <Input
              type="text"
              value={document.refNumber}
              onChange={(e) => onChange({ ...document, refNumber: e.target.value })}
              placeholder="e.g. REF: SX/2026/08/104"
              className="font-mono bg-background border-input rounded-md"
            />
          </div>

          <div>
            <label className="text-foreground mb-1 block font-medium">Document Date</label>
            <Input
              type="text"
              value={document.date}
              onChange={(e) => onChange({ ...document, date: e.target.value })}
              placeholder="e.g. August 8, 2026"
              className="bg-background border-input rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Recipient Information Form */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            👤 Recipient Address Details
          </h4>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium">
            <input
              type="checkbox"
              checked={document.recipient.showRecipient ?? true}
              onChange={(e) => updateRecipient({ showRecipient: e.target.checked })}
              className="accent-[#7f469b] w-3.5 h-3.5"
            />
            <span className="text-foreground font-semibold">Show Recipient Section</span>
          </label>
        </div>

        {!(document.recipient.showRecipient ?? true) && (
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-md text-[11px] text-amber-700 dark:text-amber-300">
            💡 Recipient &quot;To,&quot; section is hidden. Ideal for Board Resolutions, Internal Memos & Certificates.
          </div>
        )}

        <div className={`space-y-3 text-xs ${(document.recipient.showRecipient ?? true) ? '' : 'opacity-50 pointer-events-none'}`}>
          <div>
            <label className="text-muted-foreground mb-1 block">Full Name</label>
            <Input
              type="text"
              value={document.recipient.name}
              onChange={(e) => updateRecipient({ name: e.target.value })}
              placeholder="Dr. Evelyn Vance"
              className="bg-background border-input rounded-md"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block">Designation / Title</label>
            <Input
              type="text"
              value={document.recipient.designation}
              onChange={(e) => updateRecipient({ designation: e.target.value })}
              placeholder="Head of Autonomous Systems"
              className="bg-background border-input rounded-md"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block">Company / Organization</label>
            <Input
              type="text"
              value={document.recipient.organization}
              onChange={(e) => updateRecipient({ organization: e.target.value })}
              placeholder="Global AI Consortium"
              className="bg-background border-input rounded-md"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block">Address Line 1</label>
            <Input
              type="text"
              value={document.recipient.addressLine1}
              onChange={(e) => updateRecipient({ addressLine1: e.target.value })}
              placeholder="450 Innovation Parkway, Suite 12"
              className="bg-background border-input rounded-md"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block">City, State & Zip</label>
            <Input
              type="text"
              value={document.recipient.cityStateZip}
              onChange={(e) => updateRecipient({ cityStateZip: e.target.value })}
              placeholder="San Francisco, CA 94105"
              className="bg-background border-input rounded-md"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block">Email Contact</label>
            <Input
              type="email"
              value={document.recipient.email || ''}
              onChange={(e) => updateRecipient({ email: e.target.value })}
              placeholder="evelyn.vance@ai-consortium.org"
              className="bg-background border-input font-mono rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
