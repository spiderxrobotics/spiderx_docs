'use client';

import React, { useState } from 'react';
import { DocumentData } from '@/types/letterhead';
import { PRESET_TEMPLATES, DEFAULT_SPIDERX_LETTERHEAD_BG } from '@/utils/defaultTemplates';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  );
};
