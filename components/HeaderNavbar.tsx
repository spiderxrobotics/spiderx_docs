'use client';

import React, { useState } from 'react';
import { DocumentData } from '@/types/letterhead';
import { Printer, Download, Upload, Bot, Sun, Moon, FileDown, Loader2, Undo2, Redo2, Check, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportLetterheadToPdf } from '@/utils/pdfExporter';

interface HeaderNavbarProps {
  document: DocumentData;
  theme: 'light' | 'dark';
  saveStatus?: 'saved' | 'editing' | 'restored';
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onRestore?: () => void;
  onToggleTheme: () => void;
  onImportJson: (data: DocumentData) => void;
  onPrint: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  document,
  theme,
  saveStatus = 'saved',
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onRestore,
  onToggleTheme,
  onImportJson,
  onPrint,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Export JSON backup file
  const handleExportJson = () => {
    const jsonString = JSON.stringify(document, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '_')}_SpiderX_Docs.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup file
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const parsed = JSON.parse(event.target.result as string);
            onImportJson(parsed);
          }
        } catch (err) {
          alert('Invalid SpiderX document JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Direct PDF Download Handler
  const handleDirectPdfDownload = async () => {
    setIsExportingPdf(true);
    try {
      const safeTitle = document.title ? document.title.replace(/[^a-zA-Z0-9_-]/g, '_') : 'SpiderX_Letterhead';
      await exportLetterheadToPdf(`${safeTitle}.pdf`);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 shrink-0 w-full bg-card/95 backdrop-blur-md border-b border-border px-4 md:px-6 py-2.5 flex items-center justify-between no-print select-none shadow-xs transition-colors duration-200">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] p-0.5 flex items-center justify-center shadow-xs">
          <div className="w-full h-full bg-background rounded-md flex items-center justify-center">
            <Bot className="w-4 h-4 text-[#7f469b] dark:text-[#a862c8]" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-extrabold text-foreground tracking-wide">
              SPIDERX <span className="bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] bg-clip-text text-transparent">DOCS</span>
            </h1>
            <Badge variant="purple" className="text-[10px] font-mono">
              v1.0 Studio
            </Badge>

            {/* Live Auto-Save Status Pill */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border border-border bg-muted/50 text-muted-foreground">
              {saveStatus === 'editing' ? (
                <>
                  <Loader2 className="w-3 h-3 text-[#7f469b] animate-spin" />
                  <span className="text-[#7f469b]">Saving...</span>
                </>
              ) : saveStatus === 'restored' ? (
                <>
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span className="text-amber-600 dark:text-amber-400">Restored Draft</span>
                </>
              ) : (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Saved locally</span>
                </>
              )}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground hidden lg:block">
            Letterhead Alignment & Director Signature Document Studio
          </p>
        </div>
      </div>

      {/* Action Buttons & History Controls */}
      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Document History Undo / Redo */}
        <div className="hidden md:flex items-center gap-1 border-r border-border pr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onUndo}
            disabled={!canUndo}
            className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-foreground"
            title="Undo Document Edit (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={!canRedo}
            className="h-8 w-8 p-0 rounded-md text-muted-foreground hover:text-foreground"
            title="Redo Document Edit (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTheme}
          className="gap-1.5 text-xs font-semibold px-3 border-border hover:bg-accent rounded-md"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-[#7f469b]" />
              <span className="hidden md:inline">Dark Mode</span>
            </>
          )}
        </Button>

        {/* Export JSON */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          className="gap-1.5 text-xs font-semibold rounded-md hidden lg:flex"
          title="Backup document to JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON</span>
        </Button>

        {/* Import JSON */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-1.5 text-xs font-semibold cursor-pointer rounded-md hidden lg:flex"
          title="Restore document from JSON"
        >
          <label>
            <Upload className="w-3.5 h-3.5" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </Button>

        {/* Restore App Defaults */}
        {onRestore && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRestore}
            className="gap-1.5 text-xs font-semibold rounded-md border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500 hidden sm:flex cursor-pointer"
            title="Restore app and document back to default state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore App</span>
          </Button>
        )}

        {/* Direct PDF File Download */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDirectPdfDownload}
          disabled={isExportingPdf}
          className="gap-1.5 text-xs font-bold rounded-md border-[#7f469b]/40 text-[#7f469b] hover:bg-[#7f469b]/10 dark:text-[#a862c8]"
          title="Download high-resolution PDF file directly"
        >
          {isExportingPdf ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">Generating PDF...</span>
            </>
          ) : (
            <>
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </>
          )}
        </Button>

        {/* Print / Save PDF Primary Action */}
        <Button
          variant="gradient"
          size="sm"
          onClick={onPrint}
          className="gap-2 px-4 md:px-5 text-xs font-extrabold rounded-md shadow-xs"
          title="Open browser print dialog to print or save as PDF"
        >
          <Printer className="w-4 h-4" />
          <span>PRINT / SAVE PDF</span>
        </Button>
      </div>
    </header>
  );
};
