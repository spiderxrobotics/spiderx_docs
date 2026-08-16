'use client';

import React, { useState, useEffect } from 'react';
import { DocumentData } from '@/types/letterhead';
import { HeaderNavbar } from '@/components/HeaderNavbar';
import { ControlsSidebar } from '@/components/ControlsSidebar';
import { LetterheadCanvas } from '@/components/LetterheadCanvas';
import { SignaturePadModal } from '@/components/SignaturePadModal';
import { ResetConfirmationModal } from '@/components/ResetConfirmationModal';
import { useDocumentStorage } from '@/hooks/useDocumentStorage';

export default function Home() {
  const {
    document,
    updateDocument,
    saveStatus,
    resetToDefault,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useDocumentStorage();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [zoomScale, setZoomScale] = useState<number>(0.9);
  const [sidebarWidth, setSidebarWidth] = useState<number>(380);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Reset Confirmation Modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  // Signature Modal state
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [activeDirectorTarget, setActiveDirectorTarget] = useState<1 | 2>(1);

  // Load saved theme & sidebar preferences on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('spiderx_theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const savedWidth = localStorage.getItem('spiderx_sidebar_width');
    if (savedWidth) {
      setSidebarWidth(Number(savedWidth));
    }
  }, []);

  // Synchronize active theme to document.documentElement (.dark class and colorScheme)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (theme === 'dark') {
        window.document.documentElement.classList.add('dark');
        window.document.documentElement.style.colorScheme = 'dark';
      } else {
        window.document.documentElement.classList.remove('dark');
        window.document.documentElement.style.colorScheme = 'light';
      }
    }
  }, [theme]);

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
      updateDocument({
        ...document,
        signatory: {
          ...document.signatory,
          director2SignatureImage: dataUrl,
          showDirector2Signature: true,
        },
      });
    } else {
      updateDocument({
        ...document,
        signatory: {
          ...document.signatory,
          signatureImage: dataUrl,
          showSignature: true,
        },
      });
    }
  };

  // Toggle alignment guides from floating toolbar
  const handleToggleAlignmentGuides = () => {
    updateDocument({
      ...document,
      layout: {
        ...document.layout,
        showAlignmentGuides: !document.layout.showAlignmentGuides,
      },
    });
  };

  // Browser print trigger
  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      {/* Top Header Navbar */}
      <HeaderNavbar
        document={document}
        theme={theme}
        saveStatus={saveStatus}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
        onRestore={() => setIsResetModalOpen(true)}
        onToggleTheme={handleToggleTheme}
        onImportJson={updateDocument}
        onPrint={handlePrint}
      />

      {/* Main Studio Workbench (Fixed Sidebar + Scrollable Canvas) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative h-[calc(100vh-57px)]">
        {/* Fixed Controls Sidebar */}
        <ControlsSidebar
          document={document}
          onChange={updateDocument}
          onOpenSignatureModal={handleOpenSignatureModal}
          zoomScale={zoomScale}
          onZoomChange={setZoomScale}
          onResetDefault={() => setIsResetModalOpen(true)}
          width={sidebarWidth}
          onWidthChange={handleSidebarWidthChange}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Scrollable Center Workbench Canvas Area with ReactFlow Dot Grid */}
        <section className="flex-1 h-full bg-canvas-grid border-l border-border overflow-y-auto overflow-x-auto flex items-start justify-center p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-border">
          <LetterheadCanvas
            document={document}
            zoomScale={zoomScale}
            onZoomChange={setZoomScale}
            onToggleAlignmentGuides={handleToggleAlignmentGuides}
          />
        </section>
      </div>

      {/* Reset & Restore Confirmation Warning Modal */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={resetToDefault}
      />

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
