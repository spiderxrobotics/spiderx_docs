'use client';

import React, { useState } from 'react';
import { DocumentData } from '@/types/letterhead';
import { PRESET_TEMPLATES } from '@/utils/defaultTemplates';
import { RefreshCw, FileText, Upload, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseMarkdownToDocumentBlocks, distributeBlocksAcrossPages } from '@/utils/markdownParser';

interface TemplatesTabProps {
  document: DocumentData;
  onChange: (updated: DocumentData) => void;
  onResetDefault: () => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  document,
  onChange,
  onResetDefault,
}) => {
  const [savedTemplates, setSavedTemplates] = useState<{ id: string; name: string; data: DocumentData }[]>([]);
  const [templateNameInput, setTemplateNameInput] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // Handle uploading and parsing a .md file
  const handleMarkdownFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const { paragraphs: newBlocks, subject, mainHeading } = parseMarkdownToDocumentBlocks(text);

        const updatedBody = { ...document.body };
        if (newBlocks.length > 0) {
          const { page1Paragraphs, additionalPages: distributedPages } = distributeBlocksAcrossPages(newBlocks, 11.8, 14.0);

          updatedBody.paragraphs = page1Paragraphs;

          if (distributedPages.length > 0) {
            updatedBody.multiPage = {
              ...(document.body.multiPage || {}),
              enableMultiPage: true,
              pages: distributedPages,
              continuedNoticeText: document.body.multiPage?.continuedNoticeText || '...Continued on Next Page',
            };
          }
        }
        if (subject) {
          updatedBody.showSubject = true;
          updatedBody.subject = subject;
        }
        if (mainHeading) {
          updatedBody.showMainHeading = true;
          updatedBody.mainHeading = mainHeading;
        }

        onChange({
          ...document,
          body: updatedBody,
        });

        setStatusMsg(`Imported "${file.name}" (${newBlocks.length} blocks auto-aligned across ${1 + (updatedBody.multiPage?.pages?.length || 0)} pages)!`);
        setTimeout(() => setStatusMsg(null), 4500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Import Markdown (.md) Document Card */}
      <div className="bg-[#7f469b]/5 border border-[#7f469b]/25 rounded-lg p-3.5 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#7f469b] dark:text-[#a862c8] uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Import Markdown (.md) File
          </h4>
          <span className="text-[10px] font-bold text-[#7f469b] bg-[#7f469b]/10 px-2 py-0.5 rounded-full border border-[#7f469b]/20">
            Auto Alignment
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal">
          Load your <code className="text-[#7f469b] font-bold font-mono">.md</code> document. Paragraphs, headings, lists, and tables will be auto-aligned into letterhead blocks.
        </p>
        {statusMsg && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 p-2 rounded-md border border-emerald-500/20 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}
        <label className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] hover:opacity-95 text-white rounded-md text-xs font-bold cursor-pointer transition shadow-xs">
          <Upload className="w-3.5 h-3.5" /> Upload & Parse .md File
          <input
            type="file"
            accept=".md,.txt,.markdown"
            onChange={handleMarkdownFileUpload}
            className="hidden"
          />
        </label>
      </div>
      {/* Standard Presets */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Built-In Document Presets
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
                      letterheadImage: preset.template.layout?.letterheadImage ?? document.layout.letterheadImage ?? null,
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
          Save Current Layout as Preset
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
  );
};
