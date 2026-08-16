'use client';

import React, { useState } from 'react';
import { DocumentData } from '@/types/letterhead';
import { Image as ImageIcon, Upload } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AlignmentTabProps {
  document: DocumentData;
  onChange: (updated: DocumentData) => void;
  zoomScale: number;
  onZoomChange: (zoom: number) => void;
}

export const AlignmentTab: React.FC<AlignmentTabProps> = ({
  document,
  onChange,
  zoomScale,
  onZoomChange,
}) => {
  const [selectedAlignmentPageNum, setSelectedAlignmentPageNum] = useState<number>(1);

  const updateLayout = (updates: Partial<DocumentData['layout']>) => {
    onChange({
      ...document,
      layout: { ...document.layout, ...updates },
    });
  };

  const updateBody = (updates: Partial<DocumentData['body']>) => {
    onChange({
      ...document,
      body: { ...document.body, ...updates },
    });
  };

  // Letterhead image upload handler
  const handleLetterheadImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateLayout({
            letterheadImage: event.target.result as string,
            showLetterheadBackground: true,
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Letterhead Background Image Upload */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-[#7f469b] dark:text-[#a862c8]" /> Letterhead Image Overlay
          </span>
          {document.layout.letterheadImage && (
            <button
              onClick={() => updateLayout({ letterheadImage: null, showLetterheadBackground: false })}
              className="text-[11px] text-destructive hover:underline font-semibold"
            >
              Remove Image
            </button>
          )}
        </div>

        {/* Thumbnail Preview when image is loaded */}
        {document.layout.letterheadImage ? (
          <div className="flex items-center gap-3 p-2 bg-muted/50 border border-border rounded-md">
            <div className="w-10 h-14 bg-white border border-slate-300 rounded shrink-0 overflow-hidden shadow-xs relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={document.layout.letterheadImage} alt="Letterhead Thumbnail" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">Letterhead Loaded</p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                ✓ Visible on Canvas
              </p>
            </div>
            <label className="px-2.5 py-1.5 bg-accent hover:bg-accent/80 border border-border text-foreground rounded text-xs font-semibold cursor-pointer transition">
              <span>Change</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLetterheadImageUpload}
                className="hidden"
              />
            </label>
          </div>
        ) : (
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
        )}

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

      {/* Page-Based Margin Alignment Sliders */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Page-Based Margin Clearance (mm)
          </h4>
        </div>

        {/* Dynamic Target Page Selector Buttons (Page 1, Page 2, Page 3...) */}
        {(() => {
          const isMultiPage = document.body.multiPage?.enableMultiPage ?? false;
          const pagesList = isMultiPage ? (document.body.multiPage?.pages || []) : [];
          const allPageNums = [1, ...pagesList.map((_, i) => i + 2)];

          // Current target page values calculation
          const isPage1 = selectedAlignmentPageNum === 1;
          const pgIdx = selectedAlignmentPageNum - 2;
          const targetPg = pagesList[pgIdx];

          const currentTopMm = isPage1
            ? document.layout.marginTopMm
            : targetPg?.marginTopMm ?? document.layout.page2MarginTopMm ?? 28;

          const currentBottomMm = isPage1
            ? document.layout.marginBottomMm
            : targetPg?.marginBottomMm ?? document.layout.page2MarginBottomMm ?? 25;

          const currentLeftMm = isPage1
            ? document.layout.paddingLeftMm
            : targetPg?.paddingLeftMm ?? document.layout.page2PaddingLeftMm ?? document.layout.paddingLeftMm;

          const currentRightMm = isPage1
            ? document.layout.paddingRightMm
            : targetPg?.paddingRightMm ?? document.layout.page2PaddingRightMm ?? document.layout.paddingRightMm;

          const handleTopChange = (val: number) => {
            if (isPage1) {
              updateLayout({ marginTopMm: val });
            } else if (targetPg && pgIdx >= 0) {
              const updatedPages = [...pagesList];
              updatedPages[pgIdx] = { ...updatedPages[pgIdx], marginTopMm: val };
              updateBody({ multiPage: { ...(document.body.multiPage || {}), pages: updatedPages } });
              updateLayout({ page2MarginTopMm: val });
            }
          };

          const handleBottomChange = (val: number) => {
            if (isPage1) {
              updateLayout({ marginBottomMm: val });
            } else if (targetPg && pgIdx >= 0) {
              const updatedPages = [...pagesList];
              updatedPages[pgIdx] = { ...updatedPages[pgIdx], marginBottomMm: val };
              updateBody({ multiPage: { ...(document.body.multiPage || {}), pages: updatedPages } });
              updateLayout({ page2MarginBottomMm: val });
            }
          };

          const handleLeftChange = (val: number) => {
            if (isPage1) {
              updateLayout({ paddingLeftMm: val });
            } else if (targetPg && pgIdx >= 0) {
              const updatedPages = [...pagesList];
              updatedPages[pgIdx] = { ...updatedPages[pgIdx], paddingLeftMm: val };
              updateBody({ multiPage: { ...(document.body.multiPage || {}), pages: updatedPages } });
              updateLayout({ page2PaddingLeftMm: val });
            }
          };

          const handleRightChange = (val: number) => {
            if (isPage1) {
              updateLayout({ paddingRightMm: val });
            } else if (targetPg && pgIdx >= 0) {
              const updatedPages = [...pagesList];
              updatedPages[pgIdx] = { ...updatedPages[pgIdx], paddingRightMm: val };
              updateBody({ multiPage: { ...(document.body.multiPage || {}), pages: updatedPages } });
              updateLayout({ page2PaddingRightMm: val });
            }
          };

          return (
            <div className="space-y-4">
              {/* Target Page Selector Buttons */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-muted rounded-md text-xs">
                {allPageNums.map((pNum) => (
                  <button
                    key={pNum}
                    type="button"
                    onClick={() => setSelectedAlignmentPageNum(pNum)}
                    className={`flex-1 py-1.5 px-2 rounded-md font-semibold transition text-xs text-center ${
                      selectedAlignmentPageNum === pNum
                        ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Page {pNum}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-semibold text-[#7f469b] dark:text-[#a862c8] flex items-center justify-between pt-1">
                <span>Page {selectedAlignmentPageNum} Header & Footer Clearance</span>
                <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
                  {isPage1 ? 'First Page' : `Page ${selectedAlignmentPageNum}`}
                </span>
              </div>

              {/* Top Margin Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground font-medium">Header Clearance (Top Margin)</span>
                  <span className="font-mono text-[#7f469b] dark:text-[#a862c8] font-bold">
                    {currentTopMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={currentTopMm}
                  onChange={(e) => handleTopChange(Number(e.target.value))}
                  className="w-full accent-[#7f469b] cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground">
                  Adjust top space for Page {selectedAlignmentPageNum} header line
                </span>
              </div>

              {/* Bottom Margin Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-foreground font-medium">Footer Clearance (Bottom Margin)</span>
                  <span className="font-mono text-[#7f469b] dark:text-[#a862c8] font-bold">
                    {currentBottomMm} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  step="1"
                  value={currentBottomMm}
                  onChange={(e) => handleBottomChange(Number(e.target.value))}
                  className="w-full accent-[#7f469b] cursor-pointer"
                />
                <span className="text-[10px] text-muted-foreground">
                  Adjust bottom space for Page {selectedAlignmentPageNum} footer
                </span>
              </div>

              {/* Left / Right Padding Sliders */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Left Padding (mm)</label>
                  <Input
                    type="number"
                    min="10"
                    max="50"
                    value={currentLeftMm}
                    onChange={(e) => handleLeftChange(Number(e.target.value))}
                    className="h-8 text-xs bg-background border-input rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground">Right Padding (mm)</label>
                  <Input
                    type="number"
                    min="10"
                    max="50"
                    value={currentRightMm}
                    onChange={(e) => handleRightChange(Number(e.target.value))}
                    className="h-8 text-xs bg-background border-input rounded-md"
                  />
                </div>
              </div>
            </div>
          );
        })()}
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
  );
};
