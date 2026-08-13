'use client';

import React from 'react';
import { DocumentData } from '@/types/letterhead';
import { PenTool, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SignatoryTabProps {
  document: DocumentData;
  onChange: (updated: DocumentData) => void;
  onOpenSignatureModal: (targetDirector?: 1 | 2) => void;
}

export const SignatoryTab: React.FC<SignatoryTabProps> = ({
  document,
  onChange,
  onOpenSignatureModal,
}) => {
  const updateSignatory = (updates: Partial<DocumentData['signatory']>) => {
    onChange({
      ...document,
      signatory: { ...document.signatory, ...updates },
    });
  };

  // Director signature image upload handler
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateSignatory({ signatureImage: event.target.result as string, showSignature: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Company seal / stamp image upload handler
  const handleSealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateSignatory({ sealImage: event.target.result as string, showSeal: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Director 2 Signature & Seal upload handlers
  const handleDirector2SignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateSignatory({ director2SignatureImage: event.target.result as string, showDirector2Signature: true });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Mode Switcher: 1 Director vs 2 Directors */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          ✍️ Signatories Count & Arrangement
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => updateSignatory({ mode: 'single' })}
            className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              document.signatory.mode !== 'dual'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            1 Director (Single)
          </button>
          <button
            type="button"
            onClick={() => updateSignatory({ mode: 'dual' })}
            className={`py-2 px-3 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              document.signatory.mode === 'dual'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            2 Directors (Dual)
          </button>
        </div>

        <div>
          <label className="text-muted-foreground mb-1 block text-xs">Header Text Above Signatures</label>
          <Input
            type="text"
            value={document.signatory.headerText ?? 'For and on behalf of'}
            onChange={(e) => updateSignatory({ headerText: e.target.value })}
            placeholder="For and on behalf of"
            className="bg-background border-input rounded-md text-xs"
          />
        </div>

        {document.signatory.mode === 'dual' && (
          <div className="pt-2 space-y-2 border-t border-border">
            <label className="text-[11px] text-muted-foreground block font-semibold">Dual Layout Arrangement</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSignatory({ dualLayout: 'side-by-side' })}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold ${
                  document.signatory.dualLayout === 'side-by-side'
                    ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Side-by-Side (L/R)
              </button>
              <button
                type="button"
                onClick={() => updateSignatory({ dualLayout: 'stacked' })}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold ${
                  document.signatory.dualLayout === 'stacked'
                    ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                Stacked (Top/Bottom)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DIRECTOR 1 SECTION */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-[#7f469b] dark:text-[#a862c8] uppercase tracking-wider">
          👔 Director 1 Credentials {document.signatory.mode === 'dual' && '(Primary)'}
        </h4>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-muted-foreground mb-1 block">Full Name</label>
            <Input
              type="text"
              value={document.signatory.name}
              onChange={(e) => updateSignatory({ name: e.target.value })}
              placeholder="Karuppanakumar JOTHIVENKATESH"
              className="bg-background border-input rounded-md"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block">Designation / Title</label>
            <Input
              type="text"
              value={document.signatory.designation}
              onChange={(e) => updateSignatory({ designation: e.target.value })}
              placeholder="Director & Shareholder"
              className="bg-background border-input rounded-md"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block">DIN (Director Identification Number)</label>
            <Input
              type="text"
              value={document.signatory.din || ''}
              onChange={(e) => updateSignatory({ din: e.target.value })}
              placeholder="DIN: 11816122"
              className="bg-background border-input rounded-md"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block">Company Name</label>
            <Input
              type="text"
              value={document.signatory.companyName}
              onChange={(e) => updateSignatory({ companyName: e.target.value })}
              placeholder="SPIDERX ROBOTICS PRIVATE LIMITED"
              className="bg-background border-input rounded-md"
            />
          </div>

          {document.signatory.mode !== 'dual' && (
            <div>
              <label className="text-muted-foreground mb-1 block">Alignment</label>
              <div className="flex items-center gap-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => updateSignatory({ alignment: align })}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold capitalize transition ${
                      document.signatory.alignment === align
                        ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Director 1 Signature Image & Pad */}
        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-semibold">Director 1 Signature</span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={document.signatory.showSignature}
                onChange={(e) => updateSignatory({ showSignature: e.target.checked })}
                className="accent-[#7f469b] w-3 h-3"
              />
              <span className="text-muted-foreground">Show</span>
            </label>
          </div>

          {document.signatory.signatureImage ? (
            <div className="flex items-center gap-2 bg-background p-2 rounded-md border border-border">
              <div className="h-10 w-24 bg-white rounded-sm p-1 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={document.signatory.signatureImage} alt="Sig 1" className="h-full object-contain" />
              </div>
              <button
                type="button"
                onClick={() => updateSignatory({ signatureImage: null })}
                className="text-[11px] text-destructive hover:underline font-semibold"
              >
                Clear
              </button>
            </div>
          ) : (
            <p className="text-[11px] text-muted-foreground">No signature added yet.</p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Button
              type="button"
              variant="gradient"
              size="sm"
              onClick={() => onOpenSignatureModal(1)}
              className="gap-1.5 text-xs font-semibold rounded-md"
            >
              <PenTool className="w-3.5 h-3.5" /> Draw Pad
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              asChild
              className="gap-1.5 text-xs font-semibold cursor-pointer rounded-md"
            >
              <label>
                <Upload className="w-3.5 h-3.5" /> Upload
                <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
              </label>
            </Button>
          </div>
        </div>
      </div>

      {/* DIRECTOR 2 SECTION (Only shown in Dual Mode) */}
      {document.signatory.mode === 'dual' && (
        <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs animate-in fade-in duration-200">
          <h4 className="text-xs font-bold text-[#7f469b] dark:text-[#a862c8] uppercase tracking-wider">
            👔 Director 2 Credentials (Secondary)
          </h4>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-muted-foreground mb-1 block">Full Name</label>
              <Input
                type="text"
                value={document.signatory.director2Name || ''}
                onChange={(e) => updateSignatory({ director2Name: e.target.value })}
                placeholder="Suresh Pandian Sankaranarayanan"
                className="bg-background border-input rounded-md"
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block">Designation / Title</label>
              <Input
                type="text"
                value={document.signatory.director2Designation || ''}
                onChange={(e) => updateSignatory({ director2Designation: e.target.value })}
                placeholder="Director & Shareholder"
                className="bg-background border-input rounded-md"
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block">DIN (Director Identification Number)</label>
              <Input
                type="text"
                value={document.signatory.director2Din || ''}
                onChange={(e) => updateSignatory({ director2Din: e.target.value })}
                placeholder="DIN: 11816121"
                className="bg-background border-input rounded-md"
              />
            </div>

            <div>
              <label className="text-muted-foreground mb-1 block">Company Name</label>
              <Input
                type="text"
                value={document.signatory.director2CompanyName || ''}
                onChange={(e) => updateSignatory({ director2CompanyName: e.target.value })}
                placeholder="SPIDERX ROBOTICS PRIVATE LIMITED"
                className="bg-background border-input rounded-md"
              />
            </div>
          </div>

          {/* Director 2 Signature Image & Pad */}
          <div className="pt-2 border-t border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground font-semibold">Director 2 Signature</span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={document.signatory.showDirector2Signature || false}
                  onChange={(e) => updateSignatory({ showDirector2Signature: e.target.checked })}
                  className="accent-[#7f469b] w-3 h-3"
                />
                <span className="text-muted-foreground">Show</span>
              </label>
            </div>

            {document.signatory.director2SignatureImage ? (
              <div className="flex items-center gap-2 bg-background p-2 rounded-md border border-border">
                <div className="h-10 w-24 bg-white rounded-sm p-1 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={document.signatory.director2SignatureImage} alt="Sig 2" className="h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => updateSignatory({ director2SignatureImage: null })}
                  className="text-[11px] text-destructive hover:underline font-semibold"
                >
                  Clear
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">No signature added for Director 2.</p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                variant="gradient"
                size="sm"
                onClick={() => onOpenSignatureModal(2)}
                className="gap-1.5 text-xs font-semibold rounded-md"
              >
                <PenTool className="w-3.5 h-3.5" /> Draw Pad (Dir 2)
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                className="gap-1.5 text-xs font-semibold cursor-pointer rounded-md"
              >
                <label>
                  <Upload className="w-3.5 h-3.5" /> Upload
                  <input type="file" accept="image/*" onChange={handleDirector2SignatureUpload} className="hidden" />
                </label>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stamp & Seal Controls */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            🏵️ Company Official Seal / Stamp
          </h4>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={document.signatory.showSeal}
              onChange={(e) => updateSignatory({ showSeal: e.target.checked })}
              className="accent-[#7f469b] w-3.5 h-3.5"
            />
            <span className="text-foreground">Show Seal</span>
          </label>
        </div>

        {document.signatory.showSeal && (
          <div className="space-y-3 text-xs">
            {document.signatory.sealImage ? (
              <div className="flex items-center gap-3 bg-background p-2.5 rounded-md border border-border">
                <div className="w-12 h-12 bg-white rounded-sm p-1 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={document.signatory.sealImage} alt="Seal Preview" className="h-full object-contain" />
                </div>
                <button
                  type="button"
                  onClick={() => updateSignatory({ sealImage: null })}
                  className="text-[11px] text-destructive hover:underline font-semibold"
                >
                  Remove Stamp Image
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-1.5 py-2 bg-accent hover:bg-accent/80 text-foreground rounded-md text-xs font-semibold cursor-pointer border border-border transition">
                <Upload className="w-3.5 h-3.5 text-[#7f469b]" /> Upload Seal Graphic
                <input type="file" accept="image/*" onChange={handleSealUpload} className="hidden" />
              </label>
            )}

            {/* Stamp Adjustments */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stamp Size Scale</span>
                <span className="font-mono text-[#7f469b] dark:text-[#a862c8] font-bold">{document.signatory.sealScale}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={document.signatory.sealScale}
                onChange={(e) => updateSignatory({ sealScale: Number(e.target.value) })}
                className="w-full accent-[#7f469b] cursor-pointer"
              />

              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Stamp Opacity</span>
                <span className="font-mono text-[#7f469b] dark:text-[#a862c8] font-bold">{Math.round(document.signatory.sealOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={document.signatory.sealOpacity}
                onChange={(e) => updateSignatory({ sealOpacity: Number(e.target.value) })}
                className="w-full accent-[#7f469b] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
