'use client';

import React, { useState } from 'react';
import { DocumentData } from '@/types/letterhead';
import { Printer, Download, Upload, Bot, FileDown, Loader2, Undo2, Redo2, Check, Sparkles, RotateCcw, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { exportLetterheadToPdf } from '@/utils/pdfExporter';
import { parseMarkdownToDocumentBlocks, distributeBlocksAcrossPages } from '@/utils/markdownParser';

interface HeaderNavbarProps {
  document: DocumentData;
  saveStatus?: 'saved' | 'editing' | 'restored';
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onRestore?: () => void;
  onImportJson: (data: DocumentData) => void;
  onPrint: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  document,
  saveStatus = 'saved',
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
  onRestore,
  onImportJson,
  onPrint,
}) => {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Load & Parse Markdown (.md) File
  const handleLoadMdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const {
            paragraphs: newBlocks,
            subject,
            mainHeading,
            docHeaderAddress,
            refNumber,
            date,
            recipient: parsedRec,
            recipientAcceptance,
          } = parseMarkdownToDocumentBlocks(text);

          const hasRec = Boolean(parsedRec?.name) || document.recipient?.showRecipient !== false;
          const { page1Paragraphs, additionalPages: distributedPages } = distributeBlocksAcrossPages(
            newBlocks,
            undefined,
            undefined,
            {
              marginTopMm: document.layout.marginTopMm,
              marginBottomMm: document.layout.marginBottomMm,
              page2MarginTopMm: document.layout.page2MarginTopMm,
              page2MarginBottomMm: document.layout.page2MarginBottomMm,
              hasRecipient: hasRec,
            }
          );

          const updatedDoc: DocumentData = {
            ...document,
            ...(date ? { date } : {}),
            ...(refNumber ? { refNumber } : {}),
            recipient: {
              ...document.recipient,
              showRecipient: true,
              ...(parsedRec?.name ? { name: parsedRec.name } : {}),
              ...(parsedRec?.addressLine1 ? { addressLine1: parsedRec.addressLine1 } : {}),
              ...(parsedRec?.cityStateZip ? { cityStateZip: parsedRec.cityStateZip } : {}),
              ...(parsedRec?.email ? { email: parsedRec.email } : {}),
            },
            signatory: {
              ...document.signatory,
              ...(recipientAcceptance
                ? {
                    showRecipientAcceptance: true,
                    ...(recipientAcceptance.title ? { recipientAcceptanceTitle: recipientAcceptance.title } : {}),
                    ...(recipientAcceptance.text ? { recipientAcceptanceText: recipientAcceptance.text } : {}),
                  }
                : {}),
            },
            body: {
              ...document.body,
              paragraphs: page1Paragraphs,
              docHeaderAddress: '',
              showMainHeading: false,
              mainHeading: '',
              ...(subject ? { showSubject: true, subject } : {}),
              multiPage: {
                ...(document.body.multiPage || {}),
                enableMultiPage: distributedPages.length > 0,
                pages: distributedPages,
                continuedNoticeText: document.body.multiPage?.continuedNoticeText || '...Continued on Next Page',
              },
            },
          };

          onImportJson(updatedDoc);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
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

        {/* Load MD File */}
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-1.5 text-xs font-bold cursor-pointer rounded-md border-[#7f469b]/40 text-[#7f469b] hover:bg-[#7f469b]/10 dark:text-[#a862c8]"
          title="Load document content from Markdown (.md) file"
        >
          <label className="flex items-center gap-1.5 cursor-pointer">
            <FileText className="w-3.5 h-3.5" />
            <span>Load MD File</span>
            <input
              type="file"
              accept=".md,.txt,.markdown"
              onChange={handleLoadMdFile}
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
