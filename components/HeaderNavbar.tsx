'use client';

import React from 'react';
import { DocumentData } from '@/types/letterhead';
import { Printer, Download, Upload, Bot, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderNavbarProps {
  document: DocumentData;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onImportJson: (data: DocumentData) => void;
  onPrint: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  document,
  theme,
  onToggleTheme,
  onImportJson,
  onPrint,
}) => {
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

  return (
    <header className="bg-card border-b border-border px-4 md:px-6 py-2.5 flex items-center justify-between no-print select-none shadow-xs transition-colors duration-200">
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
          </div>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            Letterhead Alignment & Director Signature Document Studio
          </p>
        </div>
      </div>

      {/* Action Buttons & Theme Toggle */}
      <div className="flex items-center gap-2 md:gap-3">
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
          className="gap-1.5 text-xs font-semibold rounded-md"
          title="Backup document to JSON"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export JSON</span>
        </Button>

        {/* Import JSON */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-1.5 text-xs font-semibold cursor-pointer rounded-md"
          title="Restore document from JSON"
        >
          <label>
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJson}
              className="hidden"
            />
          </label>
        </Button>

        {/* Print / Save PDF Primary Action */}
        <Button
          variant="gradient"
          size="sm"
          onClick={onPrint}
          className="gap-2 px-4 md:px-5 text-xs font-extrabold rounded-md"
        >
          <Printer className="w-4 h-4" />
          <span>PRINT / SAVE PDF</span>
        </Button>
      </div>
    </header>
  );
};
