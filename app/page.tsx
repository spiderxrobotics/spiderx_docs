'use client';

import React, { useState, useEffect } from 'react';
import { DocumentData } from '@/types/letterhead';
import { DEFAULT_DOCUMENT } from '@/utils/defaultTemplates';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { ControlsSidebar } from '@/components/ControlsSidebar';
import { LetterheadCanvas } from '@/components/LetterheadCanvas';
import { SignaturePadModal } from '@/components/SignaturePadModal';

export default function Home() {
  // Main state holding all letterhead document configuration
  const [document, setDocument] = useState<DocumentData>(DEFAULT_DOCUMENT);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Viewport & Layout preferences
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [sidebarWidth, setSidebarWidth] = useState<number>(380);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Signature Modal state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [activeDirectorTarget, setActiveDirectorTarget] = useState<1 | 2>(1);

  // Load saved preferences on mount
  useEffect(() => {
    const savedDoc = localStorage.getItem('spiderx_letterhead_doc');
    if (savedDoc) {
      try {
        const parsed = JSON.parse(savedDoc);
        setDocument({
          ...DEFAULT_DOCUMENT,
          ...parsed,
          recipient: {
            ...DEFAULT_DOCUMENT.recipient,
            ...(parsed.recipient || {}),
          },
          body: {
            ...DEFAULT_DOCUMENT.body,
            ...(parsed.body || {}),
          },
          signatory: {
            ...DEFAULT_DOCUMENT.signatory,
            ...(parsed.signatory || {}),
          },
        });
      } catch (err) {
        console.error('Failed to parse saved document data:', err);
      }
    }

    const savedTheme = localStorage.getItem('spiderx_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedWidth = localStorage.getItem('spiderx_sidebar_width');
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth));
    }
  }, []);

  // Save document changes to LocalStorage
  const handleDocumentChange = (updated: DocumentData) => {
    setDocument(updated);
    localStorage.setItem('spiderx_letterhead_doc', JSON.stringify(updated));
  };

  // Light / Dark Theme toggle
  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('spiderx_theme', newTheme);
  };

  // Sidebar width resize handler
  const handleSidebarWidthChange = (newWidth: number) => {
    setSidebarWidth(newWidth);
    localStorage.setItem('spiderx_sidebar_width', String(newWidth));
  };

  // Signature Modal trigger
  const handleOpenSignatureModal = (targetDirector: 1 | 2 = 1) => {
    setActiveDirectorTarget(targetDirector);
    setIsSignatureModalOpen(true);
  };

  // Signature save handler from Modal
  const handleSaveSignature = (dataUrl: string, targetDirector: 1 | 2 = 1) => {
    if (targetDirector === 2) {
      handleDocumentChange({
        ...document,
        signatory: {
          ...document.signatory,
          director2SignatureImage: dataUrl,
          showDirector2Signature: true,
        },
      });
    } else {
      handleDocumentChange({
        ...document,
        signatory: {
          ...document.signatory,
          signatureImage: dataUrl,
          showSignature: true,
        },
      });
    }
  };

  // Print & PDF Export trigger
  const handlePrint = () => {
    window.print();
  };

  // Reset to default SpiderX configuration
  const handleResetDefault = () => {
    if (confirm('Are you sure you want to reset all document fields to SpiderX defaults?')) {
      setDocument(DEFAULT_DOCUMENT);
      localStorage.removeItem('spiderx_letterhead_doc');
    }
  };

  return (
    <main className={`${theme} h-screen max-h-screen overflow-hidden bg-background flex flex-col font-sans text-foreground antialiased transition-colors duration-200`}>
      {/* Top Header Navbar */}
      <HeaderNavbar
        document={document}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onImportJson={handleDocumentChange}
        onPrint={handlePrint}
      />

      {/* Main Studio Workbench (Fixed Sidebar + Scrollable Canvas) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative h-[calc(100vh-57px)]">
        {/* Fixed Controls Sidebar */}
        <ControlsSidebar
          document={document}
          onChange={handleDocumentChange}
          onOpenSignatureModal={handleOpenSignatureModal}
          zoomScale={zoomScale}
          onZoomChange={setZoomScale}
          onResetDefault={handleResetDefault}
          width={sidebarWidth}
          onWidthChange={handleSidebarWidthChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Scrollable Center Workbench Canvas Area with ReactFlow Dot Grid */}
        <section className="flex-1 h-full bg-canvas-grid border-l border-border overflow-y-auto overflow-x-auto flex items-start justify-center p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-border">
          <LetterheadCanvas document={document} zoomScale={zoomScale} />
        </section>
      </div>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={isSignatureModalOpen}
        targetDirector={activeDirectorTarget}
        onClose={() => setIsSignatureModalOpen(false)}
        onSave={handleSaveSignature}
      />
    </main>
  );
}
