'use client';

import React, { useState, useEffect } from 'react';
import { DocumentData } from '@/types/letterhead';
import {
  Sliders,
  UserCheck,
  FileText,
  PenTool,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  GripVertical,
} from 'lucide-react';
import { AlignmentTab } from './sidebar/AlignmentTab';
import { RecipientTab } from './sidebar/RecipientTab';
import { DocumentBodyTab } from './sidebar/DocumentBodyTab';
import { SignatoryTab } from './sidebar/SignatoryTab';
import { TemplatesTab } from './sidebar/TemplatesTab';

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
        <div className="w-1 h-8 bg-muted-foreground/30 group-hover:bg-white rounded-full flex items-center justify-center">
          <GripVertical className="w-3 h-3 text-muted-foreground group-hover:text-white" />
        </div>
      </div>

      {/* Top Controls Bar with Collapse Toggle & Active Tab Indicator */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            {activeTab === 'alignment' && '📐 Page Layout & Clearance'}
            {activeTab === 'recipient' && '👤 Recipient & Identifiers'}
            {activeTab === 'body' && '📝 Document Content & Headings'}
            {activeTab === 'signatory' && '✍️ Director Signatures & Seal'}
            {activeTab === 'templates' && '📚 Corporate Presets & Presets'}
          </h2>
        </div>
      </div>

      {/* Primary Tab Navigation Buttons */}
      <div className="grid grid-cols-5 p-2 gap-1 border-b border-border bg-muted/30 shrink-0 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('alignment')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition ${
            activeTab === 'alignment'
              ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          title="Alignment & Margins"
        >
          <Sliders className="w-3.5 h-3.5 mb-1" />
          <span className="text-[10px] hidden sm:inline">Clearance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('recipient')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition ${
            activeTab === 'recipient'
              ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          title="Recipient Information"
        >
          <UserCheck className="w-3.5 h-3.5 mb-1" />
          <span className="text-[10px] hidden sm:inline">Recipient</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('body')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition ${
            activeTab === 'body'
              ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          title="Document Content Body"
        >
          <FileText className="w-3.5 h-3.5 mb-1" />
          <span className="text-[10px] hidden sm:inline">Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('signatory')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition ${
            activeTab === 'signatory'
              ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          title="Director Signatures"
        >
          <PenTool className="w-3.5 h-3.5 mb-1" />
          <span className="text-[10px] hidden sm:inline">Signatures</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-md transition ${
            activeTab === 'templates'
              ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
          title="Presets & Backups"
        >
          <Bookmark className="w-3.5 h-3.5 mb-1" />
          <span className="text-[10px] hidden sm:inline">Presets</span>
        </button>
      </div>

      {/* Tab Panels Content Scroll Viewport */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-border">
        {activeTab === 'alignment' && (
          <AlignmentTab
            document={document}
            onChange={onChange}
            zoomScale={zoomScale}
            onZoomChange={onZoomChange}
          />
        )}

        {activeTab === 'recipient' && (
          <RecipientTab
            document={document}
            onChange={onChange}
          />
        )}

        {activeTab === 'body' && (
          <DocumentBodyTab
            document={document}
            onChange={onChange}
          />
        )}

        {activeTab === 'signatory' && (
          <SignatoryTab
            document={document}
            onChange={onChange}
            onOpenSignatureModal={onOpenSignatureModal}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesTab
            document={document}
            onChange={onChange}
            onResetDefault={onResetDefault}
          />
        )}
      </div>
    </aside>
  );
};
