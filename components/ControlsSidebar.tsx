'use client';

import React, { useState, useEffect } from 'react';
import { DocumentData } from '@/types/letterhead';
import { PRESET_TEMPLATES, DEFAULT_SPIDERX_LETTERHEAD_BG } from '@/utils/defaultTemplates';
import {
  Sliders,
  UserCheck,
  FileText,
  PenTool,
  Bookmark,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Download,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface ControlsSidebarProps {
  document: DocumentData;
  onChange: (updated: DocumentData) => void;
  onOpenSignatureModal: (targetDirector?: 1 | 2) => void;
  zoomScale: number;
  onZoomChange: (zoom: number) => void;
  onResetDefault: () => void;
  width: number;
  onWidthChange: (w: number) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const ControlsSidebar: React.FC<ControlsSidebarProps> = ({
  document,
  onChange,
  onOpenSignatureModal,
  zoomScale,
  onZoomChange,
  onResetDefault,
  width,
  onWidthChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const [activeTab, setActiveTab] = useState<'alignment' | 'recipient' | 'body' | 'signatory' | 'templates'>('alignment');
  const [savedTemplates, setSavedTemplates] = useState<{ id: string; name: string; data: DocumentData }[]>([]);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Resize handler via dragging right divider handle
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newWidth = Math.max(280, Math.min(650, e.clientX));
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onWidthChange]);

  // Helper updates
  const updateLayout = (updates: Partial<DocumentData['layout']>) => {
    onChange({
      ...document,
      layout: { ...document.layout, ...updates },
    });
  };

  /**
   * Selection-based formatting: Wraps highlighted text with prefix/suffix (e.g. **bold**, *italic*, <u>underline</u>)
   */
  const applySelectionFormatting = (
    inputId: string,
    prefix: string,
    suffix: string,
    fallbackText: string,
    currentValue: string,
    onUpdate: (newValue: string) => void
  ) => {
    const inputEl = document.getElementById(inputId) as HTMLTextAreaElement | HTMLInputElement | null;

    if (inputEl && typeof inputEl.selectionStart === 'number' && typeof inputEl.selectionEnd === 'number') {
      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;
      const selected = currentValue.substring(start, end);

      if (selected.length > 0) {
        // User highlighted text! Wrap the selected text.
        const wrapped = `${prefix}${selected}${suffix}`;
        const newText = currentValue.substring(0, start) + wrapped + currentValue.substring(end);
        onUpdate(newText);

        // Preserve focus & cursor selection over wrapped text
        setTimeout(() => {
          inputEl.focus();
          inputEl.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
        }, 10);
      } else {
        // No text highlighted: insert fallback text at cursor
        const inserted = `${prefix}${fallbackText}${suffix}`;
        const newText = currentValue.substring(0, start) + inserted + currentValue.substring(start);
        onUpdate(newText);

        setTimeout(() => {
          inputEl.focus();
          inputEl.setSelectionRange(start + prefix.length, start + prefix.length + fallbackText.length);
        }, 10);
      }
    } else {
      // Fallback if element is not in DOM
      onUpdate(currentValue ? `${currentValue} ${prefix}${fallbackText}${suffix}` : `${prefix}${fallbackText}${suffix}`);
    }
  };

  const updateRecipient = (updates: Partial<DocumentData['recipient']>) => {
    onChange({
      ...document,
      recipient: { ...document.recipient, ...updates },
    });
  };

  const updateBody = (updates: Partial<DocumentData['body']>) => {
    onChange({
      ...document,
      body: { ...document.body, ...updates },
    });
  };

  const updateSignatory = (updates: Partial<DocumentData['signatory']>) => {
    onChange({
      ...document,
      signatory: { ...document.signatory, ...updates },
    });
  };

  // Letterhead image upload handler
  const handleLetterheadImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateLayout({ letterheadImage: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
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

  const handleDirector2SealUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateSignatory({ director2SealImage: event.target.result as string, showDirector2Seal: true });
        }
      };
      reader.readAsDataURL(file);
    }
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

  // Save current template to local storage state
  const handleSaveTemplate = () => {
    if (!templateNameInput.trim()) return;
    const newTpl = {
      id: `custom-tpl-${Date.now()}`,
      name: templateNameInput.trim(),
      data: document,
    };
    setSavedTemplates((prev) => [...prev, newTpl]);
    setTemplateNameInput('');
  };

  // Collapsed Sidebar View
  if (isCollapsed) {
    return (
      <aside className="w-14 bg-card border-r border-border flex flex-col items-center py-4 gap-4 h-full no-print select-none z-30 transition-all duration-200">
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-md bg-accent text-accent-foreground hover:bg-[#7f469b] hover:text-white transition shadow-xs"
          title="Expand Sidebar"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="w-8 h-[1px] bg-border my-1" />

        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              onToggleCollapse();
              setActiveTab('alignment');
            }}
            className={`p-2.5 rounded-md transition ${
              activeTab === 'alignment'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            title="Alignment"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onToggleCollapse();
              setActiveTab('recipient');
            }}
            className={`p-2.5 rounded-md transition ${
              activeTab === 'recipient'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            title="Recipient"
          >
            <UserCheck className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onToggleCollapse();
              setActiveTab('body');
            }}
            className={`p-2.5 rounded-md transition ${
              activeTab === 'body'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            title="Content"
          >
            <FileText className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onToggleCollapse();
              setActiveTab('signatory');
            }}
            className={`p-2.5 rounded-md transition ${
              activeTab === 'signatory'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            title="Signature"
          >
            <PenTool className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              onToggleCollapse();
              setActiveTab('templates');
            }}
            className={`p-2.5 rounded-md transition ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
            title="Presets"
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside
      style={{ width: `${width}px` }}
      className="relative bg-card border-b lg:border-b-0 lg:border-r border-border flex flex-col h-full overflow-hidden text-foreground no-print select-none shrink-0 transition-colors duration-200"
    >
      {/* Resizable Handle on Right Edge */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        className="hidden lg:flex absolute top-0 bottom-0 right-0 w-2 cursor-col-resize hover:bg-[#7f469b]/40 active:bg-[#7f469b] group z-40 items-center justify-center transition-colors"
        title="Drag to resize sidebar width"
      >
        <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-[#7f469b] transition-colors" />
      </div>

      {/* Navigation Tabs Header */}
      <div className="flex items-center justify-between border-b border-border bg-background/50 p-2 overflow-x-auto scrollbar-none gap-1">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none flex-1">
          <button
            onClick={() => setActiveTab('alignment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'alignment'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Alignment
          </button>

          <button
            onClick={() => setActiveTab('recipient')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'recipient'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Recipient
          </button>

          <button
            onClick={() => setActiveTab('body')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'body'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Content
          </button>

          <button
            onClick={() => setActiveTab('signatory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'signatory'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" /> Signature
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
              activeTab === 'templates'
                ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" /> Presets
          </button>
        </div>

        {/* Collapse Sidebar Button */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
          title="Collapse Sidebar"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-border">
        {/* TAB 1: ALIGNMENT & LETTERHEAD OVERLAY */}
        {activeTab === 'alignment' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Letterhead Background Image Upload */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-[#7f469b] dark:text-[#a862c8]" /> Letterhead Image Overlay
                </span>
                {document.layout.letterheadImage && (
                  <button
                    onClick={() => updateLayout({ letterheadImage: null })}
                    className="text-[11px] text-destructive hover:underline font-semibold"
                  >
                    Remove Image
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-[#7f469b]/10 to-[#4d2a7c]/10 border border-[#7f469b]/30 hover:border-[#7f469b] rounded-md text-xs text-[#7f469b] dark:text-[#a862c8] font-semibold cursor-pointer transition">
                  <Upload className="w-4 h-4" />
                  <span>Upload Letterhead Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLetterheadImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Toggles for Printing with Letterhead */}
              <div className="space-y-2 pt-2 border-t border-border text-xs">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-foreground font-medium">Show Letterhead background in editor</span>
                  <input
                    type="checkbox"
                    checked={document.layout.showLetterheadBackground}
                    onChange={(e) => updateLayout({ showLetterheadBackground: e.target.checked })}
                    className="accent-[#7f469b] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-foreground font-medium block">Include Letterhead in PDF / Print</span>
                    <span className="text-[10px] text-muted-foreground">Turn OFF if printing onto physical pre-printed stationary</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={document.layout.includeLetterheadInPrint}
                    onChange={(e) => updateLayout({ includeLetterheadInPrint: e.target.checked })}
                    className="accent-[#7f469b] w-4 h-4 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer pt-1">
                  <span className="text-foreground font-medium">Show Visual Margin Ruler Guides</span>
                  <input
                    type="checkbox"
                    checked={document.layout.showAlignmentGuides}
                    onChange={(e) => updateLayout({ showAlignmentGuides: e.target.checked })}
                    className="accent-[#7f469b] w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Margin Alignment Sliders */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                📐 Margin Clearance Controls (mm)
              </h4>

              {/* Top Margin Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground font-medium">Header Clearance (Top Margin)</span>
                  <span className="font-mono text-[#7f469b] dark:text-[#a862c8] font-bold">
                    {document.layout.marginTopMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={document.layout.marginTopMm}
                  onChange={(e) => updateLayout({ marginTopMm: Number(e.target.value) })}
                  className="w-full accent-[#7f469b] cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground">Adjust top space to prevent text from covering header graphics</span>
              </div>

              {/* Bottom Margin Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground font-medium">Footer Clearance (Bottom Margin)</span>
                  <span className="font-mono text-[#7f469b] dark:text-[#a862c8] font-bold">
                    {document.layout.marginBottomMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={document.layout.marginBottomMm}
                  onChange={(e) => updateLayout({ marginBottomMm: Number(e.target.value) })}
                  className="w-full accent-[#7f469b] cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground">Adjust bottom space to clear footer details & address</span>
              </div>

              {/* Left / Right Padding Sliders */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Left Padding</label>
                  <Input
                    type="number"
                    min="10"
                    max="50"
                    value={document.layout.paddingLeftMm}
                    onChange={(e) => updateLayout({ paddingLeftMm: Number(e.target.value) })}
                    className="h-8 text-xs bg-background border-input rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Right Padding</label>
                  <Input
                    type="number"
                    min="10"
                    max="50"
                    value={document.layout.paddingRightMm}
                    onChange={(e) => updateLayout({ paddingRightMm: Number(e.target.value) })}
                    className="h-8 text-xs bg-background border-input rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Font & Zoom Controls */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-4 shadow-xs">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                🔤 Typography & Viewport Zoom
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground mb-1 block">Font Family</label>
                  <select
                    value={document.layout.fontFamily}
                    onChange={(e) => updateLayout({ fontFamily: e.target.value as any })}
                    className="w-full bg-background border border-input rounded-md px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#7f469b] focus:border-[#7f469b]"
                  >
                    <option value="Inter">Inter (Clean Modern Sans-Serif)</option>
                    <option value="Roboto">Roboto (Corporate Sans)</option>
                    <option value="Playfair Display">Playfair Display (Executive Serif)</option>
                    <option value="Cinzel">Cinzel (Formal Elegant)</option>
                    <option value="Courier New">Courier New (Monospace Technical)</option>
                    <option value="Times New Roman">Times New Roman (Classic Standard)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-muted-foreground mb-1 block">Font Size (pt)</label>
                    <Input
                      type="number"
                      min="9"
                      max="16"
                      step="0.5"
                      value={document.layout.fontSizePt}
                      onChange={(e) => updateLayout({ fontSizePt: Number(e.target.value) })}
                      className="h-8 text-xs bg-background border-input rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-muted-foreground mb-1 block">Line Height</label>
                    <Input
                      type="number"
                      min="1.1"
                      max="2.0"
                      step="0.1"
                      value={document.layout.lineHeight}
                      onChange={(e) => updateLayout({ lineHeight: Number(e.target.value) })}
                      className="h-8 text-xs bg-background border-input rounded-md"
                    />
                  </div>
                </div>

                {/* Canvas Zoom Selector */}
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-foreground font-medium">Editor Canvas Zoom</span>
                    <span className="font-mono text-[#7f469b] dark:text-[#a862c8] font-bold">{Math.round(zoomScale * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[0.6, 0.75, 0.9, 1.0, 1.15].map((scale) => (
                      <button
                        key={scale}
                        onClick={() => onZoomChange(scale)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-mono transition ${
                          zoomScale === scale
                            ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white font-bold shadow-xs'
                            : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        {Math.round(scale * 100)}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RECIPIENT & HEADER DETAILS */}
        {activeTab === 'recipient' && (
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
        )}

        {/* TAB 3: CONTENT BODY EDITING */}
        {activeTab === 'body' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Multi-Page Document Setup & Dynamic N-Page Management */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#7f469b] dark:text-[#a862c8] uppercase tracking-wider flex items-center gap-1.5">
                  📄 Multi-Page Document Setup
                </h4>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-foreground">
                  <input
                    type="checkbox"
                    checked={document.body.multiPage?.enableMultiPage || false}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      const existingPages = document.body.multiPage?.pages || [];
                      const initialPages =
                        existingPages.length > 0
                          ? existingPages
                          : [
                              {
                                id: `page-2-${Date.now()}`,
                                pageNumber: 2,
                                paragraphs: [
                                  'Following our initial discussions, this section details the project milestones, deliverables, and technical governance framework.',
                                ],
                              },
                            ];
                      updateBody({
                        multiPage: {
                          ...(document.body.multiPage || {}),
                          enableMultiPage: enabled,
                          pages: initialPages,
                          continuedNoticeText: document.body.multiPage?.continuedNoticeText || '...Continued on Next Page',
                        },
                      });
                    }}
                    className="accent-[#7f469b] w-4 h-4 cursor-pointer"
                  />
                  <span>Enable Multi-Page</span>
                </label>
              </div>

              {document.body.multiPage?.enableMultiPage && (
                <div className="space-y-4 pt-2 border-t border-border text-xs">
                  <div>
                    <label className="text-muted-foreground mb-1 block">Footer Continuation Notice</label>
                    <Input
                      type="text"
                      value={document.body.multiPage?.continuedNoticeText || ''}
                      onChange={(e) =>
                        updateBody({
                          multiPage: {
                            ...(document.body.multiPage || {}),
                            continuedNoticeText: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. ...Continued on Next Page"
                      className="bg-background border-input rounded-md"
                    />
                  </div>

                  {/* Dynamic Pages List */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                        Document Pages (Page 2 to N)
                      </span>
                      <Button
                        type="button"
                        variant="gradient"
                        size="sm"
                        onClick={() => {
                          const currentPages = document.body.multiPage?.pages || [];
                          const nextNum = currentPages.length + 2;
                          const newPg = {
                            id: `page-${nextNum}-${Date.now()}`,
                            pageNumber: nextNum,
                            paragraphs: ['Additional page content details, specifications, or terms.'],
                          };
                          updateBody({
                            multiPage: {
                              ...(document.body.multiPage || {}),
                              pages: [...currentPages, newPg],
                            },
                          });
                        }}
                        className="gap-1 text-xs font-bold px-2.5 py-1 h-7 rounded-md"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Page {((document.body.multiPage?.pages || []).length + 2)}
                      </Button>
                    </div>

                    {/* Render Each Additional Page Block */}
                    {(document.body.multiPage?.pages || []).map((pg, pgIdx) => (
                      <div
                        key={pg.id || pgIdx}
                        className="bg-background border border-border rounded-md p-3 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-border pb-2">
                          <span className="font-bold text-[#7f469b] dark:text-[#a862c8] flex items-center gap-1.5">
                            📄 Page {pgIdx + 2}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedPages = (document.body.multiPage?.pages || [])
                                .filter((_, i) => i !== pgIdx)
                                .map((p, i) => ({ ...p, pageNumber: i + 2 }));
                              updateBody({
                                multiPage: {
                                  ...(document.body.multiPage || {}),
                                  pages: updatedPages,
                                },
                              });
                            }}
                            className="text-destructive hover:underline text-[11px] font-semibold"
                          >
                            Remove Page
                          </button>
                        </div>

                        {/* Page Paragraphs */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-medium">Paragraphs</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updatedPages = [...(document.body.multiPage?.pages || [])];
                                updatedPages[pgIdx] = {
                                  ...updatedPages[pgIdx],
                                  paragraphs: [...updatedPages[pgIdx].paragraphs, ''],
                                };
                                updateBody({
                                  multiPage: {
                                    ...(document.body.multiPage || {}),
                                    pages: updatedPages,
                                  },
                                });
                              }}
                              className="text-[11px] text-[#7f469b] dark:text-[#a862c8] hover:underline font-semibold"
                            >
                              + Add Paragraph
                            </button>
                          </div>

                          {pg.paragraphs.map((paraText, pIdx) => (
                            <div key={pIdx} className="space-y-1">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                <span>Para {pIdx + 1}</span>
                                {pg.paragraphs.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updatedPages = [...(document.body.multiPage?.pages || [])];
                                      updatedPages[pgIdx] = {
                                        ...updatedPages[pgIdx],
                                        paragraphs: updatedPages[pgIdx].paragraphs.filter((_, i) => i !== pIdx),
                                      };
                                      updateBody({
                                        multiPage: {
                                          ...(document.body.multiPage || {}),
                                          pages: updatedPages,
                                        },
                                      });
                                    }}
                                    className="text-destructive hover:underline"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                              <textarea
                                value={paraText}
                                onChange={(e) => {
                                  const updatedPages = [...(document.body.multiPage?.pages || [])];
                                  const newParas = [...updatedPages[pgIdx].paragraphs];
                                  newParas[pIdx] = e.target.value;
                                  updatedPages[pgIdx] = {
                                    ...updatedPages[pgIdx],
                                    paragraphs: newParas,
                                  };
                                  updateBody({
                                    multiPage: {
                                      ...(document.body.multiPage || {}),
                                      pages: updatedPages,
                                    },
                                  });
                                }}
                                rows={3}
                                className="w-full bg-card border border-input rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#7f469b] resize-y"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Document Headings & Corporate Preamble */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                🏛️ Document Headings & Corporate Info
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground mb-1 block">CIN / Registration No. (Top-Left)</label>
                  <Input
                    type="text"
                    value={document.body.docHeaderCin || ''}
                    onChange={(e) => updateBody({ docHeaderCin: e.target.value })}
                    placeholder="e.g. CIN: U72100TN2026PTC195120"
                    className="font-mono bg-background border-input rounded-md"
                  />
                </div>

                <div>
                  <label className="text-muted-foreground mb-1 block">Company Address / Reg Office (Top-Left)</label>
                  <Input
                    type="text"
                    value={document.body.docHeaderAddress || ''}
                    onChange={(e) => updateBody({ docHeaderAddress: e.target.value })}
                    placeholder="e.g. 56, ROJA STREET BHARATHIYAR NAGAR..."
                    className="bg-background border-input rounded-md"
                  />
                </div>

                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">Main Document Title</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={document.body.showMainHeading ?? false}
                        onChange={(e) => updateBody({ showMainHeading: e.target.checked })}
                        className="accent-[#7f469b] w-3 h-3"
                      />
                      <span className="text-muted-foreground">Show</span>
                    </label>
                  </div>
                  {document.body.showMainHeading && (
                    <Input
                      type="text"
                      value={document.body.mainHeading || ''}
                      onChange={(e) => updateBody({ mainHeading: e.target.value })}
                      placeholder="e.g. BOARD RESOLUTION"
                      className="bg-background border-input rounded-md font-bold text-center"
                    />
                  )}
                </div>

                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">Sub-Heading / Preamble Notice</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={document.body.showSubHeading ?? false}
                        onChange={(e) => updateBody({ showSubHeading: e.target.checked })}
                        className="accent-[#7f469b] w-3 h-3"
                      />
                      <span className="text-muted-foreground">Show</span>
                    </label>
                  </div>
                  {document.body.showSubHeading && (
                    <textarea
                      value={document.body.subHeading || ''}
                      onChange={(e) => updateBody({ subHeading: e.target.value })}
                      placeholder="e.g. CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING..."
                      rows={3}
                      className="w-full bg-background border border-input rounded-md p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#7f469b] resize-y"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Subject Line & Style Control */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  📝 Subject Heading & Style
                </h4>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={document.body.showSubject}
                    onChange={(e) => updateBody({ showSubject: e.target.checked })}
                    className="accent-[#7f469b] w-3.5 h-3.5"
                  />
                  <span className="text-foreground font-semibold">Show Subject</span>
                </label>
              </div>

              {document.body.showSubject && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-muted-foreground mb-1 block font-medium">Heading Style Format</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateBody({ subjectStyle: 'boxed' })}
                        className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition ${
                          (document.body.subjectStyle || 'boxed') === 'boxed'
                            ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Boxed Badge
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBody({ subjectStyle: 'centered-header' })}
                        className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition ${
                          document.body.subjectStyle === 'centered-header'
                            ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Centered Title
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBody({ subjectStyle: 'plain' })}
                        className={`py-1.5 px-2 rounded-md text-[11px] font-semibold transition ${
                          document.body.subjectStyle === 'plain'
                            ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        Plain Left
                      </button>
                    </div>
                  </div>

                  <textarea
                    value={document.body.subject}
                    onChange={(e) => updateBody({ subject: e.target.value })}
                    placeholder="Subject line text or resolution title..."
                    rows={2}
                    className="w-full bg-background border border-input rounded-md p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#7f469b] focus:border-[#7f469b] resize-none"
                  />
                </div>
              )}
            </div>

            {/* Paragraphs Editor */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  📄 Main Body Paragraphs
                </h4>
                <button
                  type="button"
                  onClick={() => updateBody({ paragraphs: [...document.body.paragraphs, ''] })}
                  className="text-xs text-[#7f469b] dark:text-[#a862c8] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Paragraph
                </button>
              </div>

              <div className="space-y-4">
                {document.body.paragraphs.map((para, idx) => (
                  <div key={idx} className="space-y-1.5 bg-background/50 border border-border p-2.5 rounded-md">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">Paragraph {idx + 1}</span>
                      <div className="flex items-center gap-1">
                        {/* Inline Formatting Helper Buttons */}
                        <button
                          type="button"
                          title="Add Bold Text"
                          onClick={() => {
                            const updated = [...document.body.paragraphs];
                            updated[idx] = updated[idx] ? `${updated[idx]} **bold text**` : '**bold text**';
                            updateBody({ paragraphs: updated });
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-bold bg-muted hover:bg-accent rounded text-foreground"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          title="Add Italic Text"
                          onClick={() => {
                            const updated = [...document.body.paragraphs];
                            updated[idx] = updated[idx] ? `${updated[idx]} *italic text*` : '*italic text*';
                            updateBody({ paragraphs: updated });
                          }}
                          className="px-1.5 py-0.5 text-[10px] italic bg-muted hover:bg-accent rounded text-foreground"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          title="Add Underline Text"
                          onClick={() => {
                            const updated = [...document.body.paragraphs];
                            updated[idx] = updated[idx] ? `${updated[idx]} <u>underlined text</u>` : '<u>underlined text</u>';
                            updateBody({ paragraphs: updated });
                          }}
                          className="px-1.5 py-0.5 text-[10px] underline bg-muted hover:bg-accent rounded text-foreground"
                        >
                          U
                        </button>
                        <button
                          type="button"
                          title="Make Subheading"
                          onClick={() => {
                            const updated = [...document.body.paragraphs];
                            const current = updated[idx] || '';
                            updated[idx] = current.startsWith('## ') ? current.slice(3) : `## ${current}`;
                            updateBody({ paragraphs: updated });
                          }}
                          className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#7f469b]/10 text-[#7f469b] dark:text-[#a862c8] hover:bg-[#7f469b]/20 rounded"
                        >
                          + Subheading
                        </button>
                        {document.body.paragraphs.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              updateBody({
                                paragraphs: document.body.paragraphs.filter((_, i) => i !== idx),
                              })
                            }
                            className="text-destructive hover:underline text-[10px] ml-1"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                    <textarea
                      value={para}
                      onChange={(e) => {
                        const updated = [...document.body.paragraphs];
                        updated[idx] = e.target.value;
                        updateBody({ paragraphs: updated });
                      }}
                      placeholder="Enter paragraph text (Supports **bold**, *italic*, <u>underline</u>, or '## Subheading')..."
                      rows={3}
                      className="w-full bg-background border border-input rounded-md p-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#7f469b] focus:border-[#7f469b] resize-y"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Bullet Points / Numbered List Control */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  🔹 Bullet / Numbered List Block
                </h4>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={document.body.showBulletPoints}
                    onChange={(e) => updateBody({ showBulletPoints: e.target.checked })}
                    className="accent-[#7f469b] w-3.5 h-3.5"
                  />
                  <span className="text-foreground font-semibold">Show List</span>
                </label>
              </div>

              {document.body.showBulletPoints && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-muted-foreground mb-1 block font-medium">List Numbering / Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => updateBody({ listStyle: 'disc' })}
                        className={`py-1.5 px-2 rounded-md text-xs font-semibold ${
                          (document.body.listStyle || 'disc') === 'disc'
                            ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        Bullet Points (•)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBody({ listStyle: 'decimal' })}
                        className={`py-1.5 px-2 rounded-md text-xs font-semibold ${
                          document.body.listStyle === 'decimal'
                            ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        Numbered List (1, 2, 3...)
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-muted-foreground mb-1 block">List Section Heading (Optional)</label>
                    <Input
                      type="text"
                      value={document.body.bulletTitle || ''}
                      onChange={(e) => updateBody({ bulletTitle: e.target.value })}
                      placeholder="e.g. Key Provisions or Authorized Powers:"
                      className="bg-background border-input rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">List Items</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateBody({ bulletPoints: [...document.body.bulletPoints, ''] })
                        }
                        className="text-xs text-[#7f469b] dark:text-[#a862c8] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>

                    {document.body.bulletPoints.map((pt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          type="text"
                          value={pt}
                          onChange={(e) => {
                            const updated = [...document.body.bulletPoints];
                            updated[idx] = e.target.value;
                            updateBody({ bulletPoints: updated });
                          }}
                          className="bg-background border-input flex-1 rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateBody({
                              bulletPoints: document.body.bulletPoints.filter((_, i) => i !== idx),
                            })
                          }
                          className="text-destructive px-2 hover:bg-accent rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Key-Value Table Control */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  📊 Dynamic Data Table
                </h4>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={document.body.showTable}
                    onChange={(e) => updateBody({ showTable: e.target.checked })}
                    className="accent-[#7f469b] w-3.5 h-3.5"
                  />
                  <span className="text-foreground">Show Table</span>
                </label>
              </div>

              {document.body.showTable && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-muted-foreground mb-1 block">Table Title</label>
                    <Input
                      type="text"
                      value={document.body.tableTitle || ''}
                      onChange={(e) => updateBody({ tableTitle: e.target.value })}
                      placeholder="Project Schedule Summary"
                      className="bg-background border-input rounded-md"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Table Rows</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateBody({
                            tableRows: [...(document.body.tableRows || []), { label: 'New Field', value: 'Value' }],
                          })
                        }
                        className="text-xs text-[#7f469b] dark:text-[#a862c8] hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Plus className="w-3 h-3" /> Add Row
                      </button>
                    </div>

                    {(document.body.tableRows || []).map((row, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          type="text"
                          value={row.label}
                          onChange={(e) => {
                            const updated = [...(document.body.tableRows || [])];
                            updated[idx] = { ...updated[idx], label: e.target.value };
                            updateBody({ tableRows: updated });
                          }}
                          placeholder="Label"
                          className="w-1/3 bg-background border-input rounded-md"
                        />
                        <Input
                          type="text"
                          value={row.value}
                          onChange={(e) => {
                            const updated = [...(document.body.tableRows || [])];
                            updated[idx] = { ...updated[idx], value: e.target.value };
                            updateBody({ tableRows: updated });
                          }}
                          placeholder="Value"
                          className="flex-1 bg-background border-input rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateBody({
                              tableRows: (document.body.tableRows || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="text-destructive px-2 hover:bg-accent rounded-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Closing Salutation & Footer Date/Place Metadata */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                🤝 Closing Salutation & Bottom Footer Meta
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground mb-1 block">Closing Salutation Text</label>
                  <Input
                    type="text"
                    value={document.body.closingSalutation}
                    onChange={(e) => updateBody({ closingSalutation: e.target.value })}
                    placeholder="e.g. CERTIFIED TRUE COPY or Sincerely,"
                    className="bg-background border-input rounded-md font-semibold"
                  />
                </div>

                <div className="pt-2 border-t border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-semibold">Date & Place Footer (Bottom-Left)</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={document.body.showPlaceDate ?? false}
                        onChange={(e) => updateBody({ showPlaceDate: e.target.checked })}
                        className="accent-[#7f469b] w-3 h-3"
                      />
                      <span className="text-muted-foreground">Show</span>
                    </label>
                  </div>

                  {document.body.showPlaceDate && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-muted-foreground mb-1 block">Date Line</label>
                        <Input
                          type="text"
                          value={document.body.dateTextFooter || ''}
                          onChange={(e) => updateBody({ dateTextFooter: e.target.value })}
                          placeholder="Date: AUGUST 09, 2026"
                          className="bg-background border-input rounded-md"
                        />
                      </div>
                      <div>
                        <label className="text-muted-foreground mb-1 block">Place Line</label>
                        <Input
                          type="text"
                          value={document.body.placeLocation || ''}
                          onChange={(e) => updateBody({ placeLocation: e.target.value })}
                          placeholder="Place: MADURAI"
                          className="bg-background border-input rounded-md"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DIRECTOR SIGNATURE & OFFICIAL SEAL */}
        {activeTab === 'signatory' && (
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
        )}

        {/* TAB 5: PRESETS & SAVED TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Standard Presets */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                📚 Built-In Document Presets
              </h4>

              <div className="space-y-2">
                {PRESET_TEMPLATES.map((preset, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-background hover:bg-accent border border-border rounded-md transition flex items-center justify-between group"
                  >
                    <div>
                      <h5 className="text-xs font-bold text-foreground group-hover:text-[#7f469b] transition">
                        {preset.name}
                      </h5>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                        {preset.description}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onChange({
                          ...document,
                          ...preset.template,
                          layout: {
                            ...document.layout,
                            ...(preset.template.layout || {}),
                            letterheadImage: document.layout.letterheadImage || DEFAULT_SPIDERX_LETTERHEAD_BG,
                          },
                        })
                      }
                      className="text-xs font-semibold text-[#7f469b] dark:text-[#a862c8] hover:bg-[#7f469b] hover:text-white border-[#7f469b]/30 rounded-md"
                    >
                      Load
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Saved Templates */}
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                💾 Save Current Layout as Preset
              </h4>

              <div className="flex gap-2">
                <Input
                  type="text"
                  value={templateNameInput}
                  onChange={(e) => setTemplateNameInput(e.target.value)}
                  placeholder="e.g. My Custom Offer Letter"
                  className="flex-1 bg-background border-input text-xs rounded-md"
                />
                <Button
                  type="button"
                  onClick={handleSaveTemplate}
                  disabled={!templateNameInput.trim()}
                  size="sm"
                  className="font-bold text-xs rounded-md"
                >
                  Save
                </Button>
              </div>

              {savedTemplates.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  {savedTemplates.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center justify-between p-2.5 bg-background rounded-md text-xs border border-border"
                    >
                      <span className="font-semibold text-foreground truncate max-w-[180px]">
                        {st.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onChange(st.data)}
                          className="text-[#7f469b] dark:text-[#a862c8] hover:underline font-semibold"
                        >
                          Load
                        </button>
                        <button
                          type="button"
                          onClick={() => setSavedTemplates(savedTemplates.filter((x) => x.id !== st.id))}
                          className="text-destructive hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reset Defaults */}
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={onResetDefault}
                className="w-full flex items-center justify-center gap-2 py-2 border-border hover:bg-destructive/10 hover:text-destructive text-muted-foreground text-xs font-semibold rounded-md"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset All to Default SpiderX Layout
              </Button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
