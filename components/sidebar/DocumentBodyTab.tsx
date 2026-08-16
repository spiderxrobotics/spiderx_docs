'use client';

import React, { useState } from 'react';
import { DocumentData, DocumentPage } from '@/types/letterhead';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import dynamic from 'next/dynamic';

const parseTableHtml = (html: string) => {
  // Extract th headers
  const thMatches = html.match(/<th[^>]*>([\s\S]*?)<\/th>/gi);
  const headers = thMatches
    ? thMatches.map((m) => m.replace(/<\/?th[^>]*>/gi, '').replace(/<[^>]+>/g, ''))
    : ['Header 1', 'Header 2'];

  // Extract tr rows containing td cells (ignoring header th rows)
  const tdRowMatches = html.match(/<tr[^>]*>([\s\S]*?<\/td>[\s\S]*?)<\/tr>/gi);

  const rows: string[][] = [];
  if (tdRowMatches && tdRowMatches.length > 0) {
    tdRowMatches.forEach((tr) => {
      const tdMatches = tr.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
      if (tdMatches) {
        rows.push(tdMatches.map((m) => m.replace(/<\/?td[^>]*>/gi, '').replace(/<[^>]+>/g, '')));
      }
    });
  }

  if (rows.length === 0) {
    rows.push(new Array(headers.length).fill(''));
  }

  return { headers, rows };
};

const buildTableHtml = (headers: string[], rows: string[][]) => {
  const headHtml = `<thead><tr>${headers.map((h) => `<th>${h || ''}</th>`).join('')}</tr></thead>`;
  const bodyHtml = `<tbody>${rows
    .map((r) => `<tr>${r.map((c) => `<td>${c || ''}</td>`).join('')}</tr>`)
    .join('')}</tbody>`;
  return `<table class="spiderx-table">${headHtml}${bodyHtml}</table>`;
};

const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor').then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => <div className="h-28 bg-muted animate-pulse rounded-md" />,
  }
);

interface DocumentBodyTabProps {
  document: DocumentData;
  onChange: (updated: DocumentData) => void;
}

export const DocumentBodyTab: React.FC<DocumentBodyTabProps> = ({
  document,
  onChange,
}) => {
  const [selectedContentPageNum, setSelectedContentPageNum] = useState<number>(1);

  const updateBody = (updates: Partial<DocumentData['body']>) => {
    onChange({
      ...document,
      body: { ...document.body, ...updates },
    });
  };

  // Multi-page page management calculation
  const rawPages = document.body.multiPage?.pages || [];
  const additionalPages = rawPages;
  const isMultiPage = (document.body.multiPage?.enableMultiPage ?? false) || additionalPages.length > 0;
  const allPageNums = [1, ...additionalPages.map((_, i) => i + 2)];

  // Determine currently active editing page target
  const currentContentPage = allPageNums.includes(selectedContentPageNum) ? selectedContentPageNum : 1;
  const isEditingPage1 = currentContentPage === 1;
  const targetPageIdx = currentContentPage - 2;
  const targetPageObj = !isEditingPage1 ? additionalPages[targetPageIdx] : null;

  const activeParagraphs: string[] = isEditingPage1
    ? document.body.paragraphs
    : targetPageObj?.paragraphs || [];

  // Update active paragraphs for current selected page (Page 1 vs Page 2 vs Page 3...)
  const updateActiveParagraphs = (newParagraphs: string[]) => {
    if (isEditingPage1) {
      updateBody({ paragraphs: newParagraphs });
    } else if (targetPageIdx >= 0) {
      const updatedPages = [...additionalPages];
      if (!updatedPages[targetPageIdx]) {
        updatedPages[targetPageIdx] = {
          id: `page-${currentContentPage}-${Date.now()}`,
          pageNumber: currentContentPage,
          paragraphs: newParagraphs,
        };
      } else {
        updatedPages[targetPageIdx] = {
          ...updatedPages[targetPageIdx],
          paragraphs: newParagraphs,
        };
      }
      updateBody({
        multiPage: {
          ...(document.body.multiPage || {}),
          enableMultiPage: true,
          pages: updatedPages,
        },
      });
    }
  };

  // Add new page
  const handleAddNewPage = () => {
    const nextPgNum = additionalPages.length + 2;
    const newPgObj: DocumentPage = {
      id: `page-${nextPgNum}-${Date.now()}`,
      pageNumber: nextPgNum,
      paragraphs: [`Section heading or paragraph content for Page ${nextPgNum}...`],
    };
    const updatedPages = [...additionalPages, newPgObj];
    updateBody({
      multiPage: {
        ...(document.body.multiPage || {}),
        enableMultiPage: true,
        pages: updatedPages,
      },
    });
    setSelectedContentPageNum(nextPgNum);
  };

  // Delete additional page
  const handleDeletePage = (pNumToDelete: number) => {
    const idxToDelete = pNumToDelete - 2;
    if (idxToDelete < 0) return;
    const filtered = additionalPages.filter((_, i) => i !== idxToDelete);
    const renumbered = filtered.map((pg, i) => ({
      ...pg,
      pageNumber: i + 2,
    }));
    updateBody({
      multiPage: {
        ...(document.body.multiPage || {}),
        pages: renumbered,
      },
    });
    setSelectedContentPageNum(1);
  };

  const applySelectionFormatting = (
    inputId: string,
    prefix: string,
    suffix: string,
    fallbackText: string,
    currentValue: string,
    onUpdate: (newValue: string) => void
  ) => {
    const inputEl = window.document.getElementById(inputId) as HTMLTextAreaElement | HTMLInputElement | null;

    if (inputEl && typeof inputEl.selectionStart === 'number' && typeof inputEl.selectionEnd === 'number') {
      const start = inputEl.selectionStart;
      const end = inputEl.selectionEnd;
      const selected = currentValue.substring(start, end);

      if (selected.length > 0) {
        const wrapped = `${prefix}${selected}${suffix}`;
        const newText = currentValue.substring(0, start) + wrapped + currentValue.substring(end);
        onUpdate(newText);

        setTimeout(() => {
          inputEl.focus();
          inputEl.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
        }, 10);
      } else {
        const inserted = `${prefix}${fallbackText}${suffix}`;
        const newText = currentValue.substring(0, start) + inserted + currentValue.substring(start);
        onUpdate(newText);

        setTimeout(() => {
          inputEl.focus();
          inputEl.setSelectionRange(start + prefix.length, start + prefix.length + fallbackText.length);
        }, 10);
      }
    } else {
      onUpdate(currentValue ? `${currentValue} ${prefix}${fallbackText}${suffix}` : `${prefix}${fallbackText}${suffix}`);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Multi-Page Document Setup & Dynamic N-Page Management */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#7f469b] dark:text-[#a862c8] uppercase tracking-wider flex items-center gap-1.5">
            Multi-Page Document Setup
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
          <div className="pt-2 border-t border-border text-xs">
            <label className="text-muted-foreground mb-1 block font-medium">Footer Continuation Notice</label>
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
        )}
      </div>

      {/* Document Headings & Corporate Preamble */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Document Headings & Corporate Info
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
              <div className="pt-1">
                <RichTextEditor
                  value={document.body.subHeading || ''}
                  onChange={(newHtml) => updateBody({ subHeading: newHtml })}
                  placeholder="e.g. CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING..."
                  minHeight="80px"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subject Line & Style Control */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Subject Heading & Style
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

            <div className="pt-1">
              <RichTextEditor
                value={document.body.subject || ''}
                onChange={(newHtml) => updateBody({ subject: newHtml })}
                placeholder="Subject line text or resolution title..."
                minHeight="80px"
              />
            </div>
          </div>
        )}
      </div>

      {/* Page-Based Main Body Content Blocks Editor */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#7f469b] dark:text-[#a862c8]" /> Page-Based Content Blocks
          </h4>
          <span className="text-[10px] font-bold text-[#7f469b] dark:text-[#a862c8] bg-[#7f469b]/10 px-2 py-0.5 rounded-full border border-[#7f469b]/20">
            Editing Page {currentContentPage} ({activeParagraphs.length} Blocks)
          </span>
        </div>

        {/* Dynamic Page Switcher Tabs */}
        <div className="flex items-center justify-between gap-2 p-1.5 bg-muted/60 border border-border rounded-lg">
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {allPageNums.map((pNum) => (
              <div key={pNum} className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedContentPageNum(pNum)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    currentContentPage === pNum
                      ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                      : 'bg-background text-muted-foreground hover:text-foreground hover:bg-accent border border-border/40'
                  }`}
                >
                  <span>Page {pNum}</span>
                </button>
                {pNum > 1 && currentContentPage === pNum && (
                  <button
                    type="button"
                    title={`Delete Page ${pNum}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePage(pNum);
                    }}
                    className="p-1.5 rounded-md bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground border border-destructive/20 text-xs transition cursor-pointer flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAddNewPage}
            className="px-2.5 py-1.5 bg-[#7f469b]/10 hover:bg-[#7f469b]/20 text-[#7f469b] dark:text-[#a862c8] border border-[#7f469b]/30 rounded-md text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer"
            title="Add New Document Page"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Page</span>
          </button>
        </div>

        {/* Blocks Editor for Selected Page */}
        <div className="space-y-4 pt-1">
          {activeParagraphs.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-border rounded-lg space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                No content blocks on Page {currentContentPage} yet.
              </p>
              <p className="text-[11px] text-muted-foreground">
                Click any of the buttons below to add a Paragraph, Heading, List, or Table to Page {currentContentPage}.
              </p>
            </div>
          ) : (
            activeParagraphs.map((para, idx) => {
              const isHeadingBlock = para.startsWith('<h') || para.startsWith('#');
              const isListBlock = para.includes('<ol') || para.includes('<ul');
              const isTableBlock = para.includes('<table');

              // Extract list style and list items if this is a List Block
              let listStyle: 'decimal' | 'disc' = para.includes('<ul') || para.includes('disc') ? 'disc' : 'decimal';
              let listItems: string[] = [];
              if (isListBlock) {
                const matches = para.match(/<li[^>]*>(.*?)<\/li>/gi);
                if (matches && matches.length > 0) {
                  listItems = matches.map((m) => m.replace(/<\/?li[^>]*>/gi, ''));
                } else {
                  listItems = [''];
                }
              }

              const updateListBlock = (newStyle: 'decimal' | 'disc', newItems: string[]) => {
                const tag = newStyle === 'decimal' ? 'ol' : 'ul';
                const newHtml = `<${tag} class="${newStyle}">${newItems.map((item) => `<li>${item}</li>`).join('')}</${tag}>`;
                const updated = [...activeParagraphs];
                updated[idx] = newHtml;
                updateActiveParagraphs(updated);
              };

              // Table block parsing & updating
              const { headers: tableHeaders, rows: tableRows } = isTableBlock
                ? parseTableHtml(para)
                : { headers: ['Header 1', 'Header 2'], rows: [['', '']] };

              const updateTableBlock = (newHeaders: string[], newRows: string[][]) => {
                const newHtml = buildTableHtml(newHeaders, newRows);
                const updated = [...activeParagraphs];
                updated[idx] = newHtml;
                updateActiveParagraphs(updated);
              };

              return (
                <div key={`page-${currentContentPage}-block-${idx}`} className="space-y-2.5 bg-background/50 border border-border p-3 rounded-md">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      {isTableBlock ? 'Table Block' : isListBlock ? 'List Block' : isHeadingBlock ? 'Heading Block' : 'Paragraph Block'} {idx + 1}
                      <span className="text-[9px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        Page {currentContentPage}
                      </span>
                    </span>
                    {activeParagraphs.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          updateActiveParagraphs(activeParagraphs.filter((_, i) => i !== idx))
                        }
                        className="text-destructive hover:underline text-xs font-semibold"
                      >
                        Delete Block
                      </button>
                    )}
                  </div>

                  {/* Custom Table Block Editor */}
                  {isTableBlock ? (
                    <div className="space-y-3 text-xs pt-1">
                      <div className="flex items-center justify-between text-[11px] border-b border-border pb-1.5">
                        <span className="font-semibold text-foreground">Table Columns ({tableHeaders.length})</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newHeaders = [...tableHeaders, `Header ${tableHeaders.length + 1}`];
                            const newRows = tableRows.map((r) => [...r, '']);
                            updateTableBlock(newHeaders, newRows);
                          }}
                          className="text-xs text-[#7f469b] dark:text-[#a862c8] hover:underline flex items-center gap-1 font-semibold"
                        >
                          <Plus className="w-3 h-3" /> Add Column
                        </button>
                      </div>

                      {/* Column Headers Inputs */}
                      <div className="grid grid-cols-2 gap-1.5 bg-muted/40 p-2 rounded-md border border-border/60">
                        {tableHeaders.map((h, hIdx) => (
                          <div key={hIdx} className="space-y-0.5">
                            <label className="text-[10px] text-muted-foreground font-semibold">Col {hIdx + 1}</label>
                            <div className="flex items-center gap-1">
                              <Input
                                type="text"
                                value={h}
                                onChange={(e) => {
                                  const newHeaders = [...tableHeaders];
                                  newHeaders[hIdx] = e.target.value;
                                  updateTableBlock(newHeaders, tableRows);
                                }}
                                placeholder="Header title..."
                                className="h-7 text-xs bg-background font-semibold"
                              />
                              {tableHeaders.length > 1 && (
                                <button
                                  type="button"
                                  title="Delete Column"
                                  onClick={() => {
                                    const newHeaders = tableHeaders.filter((_, i) => i !== hIdx);
                                    const newRows = tableRows.map((r) => r.filter((_, i) => i !== hIdx));
                                    updateTableBlock(newHeaders, newRows);
                                  }}
                                  className="text-destructive p-1 hover:bg-accent rounded-md"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Rows Editor */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground font-medium">Table Rows ({tableRows.length})</span>
                          <button
                            type="button"
                            onClick={() => {
                              const emptyRow = new Array(tableHeaders.length).fill('');
                              updateTableBlock(tableHeaders, [...tableRows, emptyRow]);
                            }}
                            className="text-xs text-[#7f469b] dark:text-[#a862c8] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Plus className="w-3 h-3" /> Add Row
                          </button>
                        </div>

                        {tableRows.map((r, rIdx) => (
                          <div key={rIdx} className="bg-background border border-input p-2 rounded-md space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                              <span className="font-semibold">Row {rIdx + 1}</span>
                              {tableRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newRows = tableRows.filter((_, i) => i !== rIdx);
                                    updateTableBlock(tableHeaders, newRows);
                                  }}
                                  className="text-destructive hover:underline font-semibold"
                                >
                                  Delete Row
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {r.map((cellVal, cIdx) => (
                                <Input
                                  key={cIdx}
                                  type="text"
                                  value={cellVal}
                                  onChange={(e) => {
                                    const newRows = tableRows.map((rowArr, ri) =>
                                      ri === rIdx
                                        ? rowArr.map((cv, ci) => (ci === cIdx ? e.target.value : cv))
                                        : rowArr
                                    );
                                    updateTableBlock(tableHeaders, newRows);
                                  }}
                                  placeholder={tableHeaders[cIdx] ? `${tableHeaders[cIdx]}...` : `Cell ${cIdx + 1}...`}
                                  className="h-7 text-xs bg-background/80"
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : isListBlock ? (
                    <div className="space-y-2 text-xs pt-1">
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateListBlock('decimal', listItems)}
                          className={`py-1 px-2 rounded text-[11px] font-semibold transition ${
                            listStyle === 'decimal'
                              ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                              : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Numbered List (1, 2, 3...)
                        </button>
                        <button
                          type="button"
                          onClick={() => updateListBlock('disc', listItems)}
                          className={`py-1 px-2 rounded text-[11px] font-semibold transition ${
                            listStyle === 'disc'
                              ? 'bg-gradient-to-r from-[#7f469b] to-[#4d2a7c] text-white shadow-xs'
                              : 'bg-muted text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Bullet Points (•)
                        </button>
                      </div>

                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground font-medium">List Items ({listItems.length})</span>
                          <button
                            type="button"
                            onClick={() => updateListBlock(listStyle, [...listItems, ''])}
                            className="text-xs text-[#7f469b] dark:text-[#a862c8] hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Plus className="w-3 h-3" /> Add Item
                          </button>
                        </div>

                        {listItems.map((itemText, itemIdx) => (
                          <div key={itemIdx} className="flex items-center gap-1 bg-background border border-input p-1.5 rounded-md">
                            <span className="text-[10px] text-muted-foreground font-semibold px-1 min-w-4">
                              {listStyle === 'decimal' ? `${itemIdx + 1}.` : '•'}
                            </span>
                            <Input
                              id={`list-block-${currentContentPage}-${idx}-item-${itemIdx}`}
                              type="text"
                              value={itemText}
                              onChange={(e) => {
                                const updatedItems = [...listItems];
                                updatedItems[itemIdx] = e.target.value;
                                updateListBlock(listStyle, updatedItems);
                              }}
                              placeholder="List item text..."
                              className="bg-transparent border-none text-xs flex-1 font-sans focus-visible:ring-0 p-1"
                            />
                            <button
                              type="button"
                              title="Format Highlighted Text as Bold"
                              onClick={() =>
                                applySelectionFormatting(
                                  `list-block-${currentContentPage}-${idx}-item-${itemIdx}`,
                                  '**',
                                  '**',
                                  'bold text',
                                  itemText,
                                  (newVal) => {
                                    const updatedItems = [...listItems];
                                    updatedItems[itemIdx] = newVal;
                                    updateListBlock(listStyle, updatedItems);
                                  }
                                )
                              }
                              className="px-1.5 py-0.5 text-[10px] font-bold bg-muted hover:bg-accent rounded text-foreground"
                            >
                              B
                            </button>
                            <button
                              type="button"
                              title="Format Highlighted Text as Italic"
                              onClick={() =>
                                applySelectionFormatting(
                                  `list-block-${currentContentPage}-${idx}-item-${itemIdx}`,
                                  '*',
                                  '*',
                                  'italic text',
                                  itemText,
                                  (newVal) => {
                                    const updatedItems = [...listItems];
                                    updatedItems[itemIdx] = newVal;
                                    updateListBlock(listStyle, updatedItems);
                                  }
                                )
                              }
                              className="px-1.5 py-0.5 text-[10px] italic bg-muted hover:bg-accent rounded text-foreground"
                            >
                              I
                            </button>
                            <button
                              type="button"
                              title="Format Highlighted Text as Underline"
                              onClick={() =>
                                applySelectionFormatting(
                                  `list-block-${currentContentPage}-${idx}-item-${itemIdx}`,
                                  '<u>',
                                  '</u>',
                                  'underlined text',
                                  itemText,
                                  (newVal) => {
                                    const updatedItems = [...listItems];
                                    updatedItems[itemIdx] = newVal;
                                    updateListBlock(listStyle, updatedItems);
                                  }
                                )
                              }
                              className="px-1.5 py-0.5 text-[10px] underline bg-muted hover:bg-accent rounded text-foreground"
                            >
                              U
                            </button>
                            {listItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateListBlock(
                                    listStyle,
                                    listItems.filter((_, i) => i !== itemIdx)
                                  )
                                }
                                className="text-destructive p-1 hover:bg-accent rounded-md"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* Quill Rich Text Editor for Paragraph / Heading */
                    <RichTextEditor
                      value={para}
                      onChange={(newHtml) => {
                        const updated = [...activeParagraphs];
                        updated[idx] = newHtml;
                        updateActiveParagraphs(updated);
                      }}
                      placeholder={isHeadingBlock ? "Type section heading title..." : "Type paragraph content..."}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Add Block Actions for Active Selected Page */}
        <div className="pt-2 grid grid-cols-4 gap-1.5 border-t border-border/50">
          <button
            type="button"
            onClick={() => updateActiveParagraphs([...activeParagraphs, ''])}
            className="text-[11px] py-2 bg-muted hover:bg-accent text-foreground rounded-md flex items-center justify-center gap-1 font-semibold transition cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Paragraph
          </button>
          <button
            type="button"
            onClick={() => updateActiveParagraphs([...activeParagraphs, '# Section Heading Title'])}
            className="text-[11px] py-2 bg-muted hover:bg-accent text-foreground rounded-md flex items-center justify-center gap-1 font-semibold transition cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Heading
          </button>
          <button
            type="button"
            onClick={() =>
              updateActiveParagraphs([...activeParagraphs, '<ol class="decimal"><li>First numbered item</li></ol>'])
            }
            className="text-[11px] py-2 bg-muted hover:bg-accent text-foreground rounded-md flex items-center justify-center gap-1 font-semibold transition cursor-pointer"
          >
            <Plus className="w-3 h-3" /> List
          </button>
          <button
            type="button"
            onClick={() =>
              updateActiveParagraphs([
                ...activeParagraphs,
                buildTableHtml(['Item / Description', 'Details'], [['Phase 1 Delivery', 'Completed']]),
              ])
            }
            className="text-[11px] py-2 bg-muted hover:bg-accent text-foreground rounded-md flex items-center justify-center gap-1 font-semibold transition cursor-pointer"
          >
            <Plus className="w-3 h-3" /> Table
          </button>
        </div>
      </div>

      {/* Closing Salutation & Footer Date/Place Metadata */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Closing Salutation & Bottom Footer Meta
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
  );
};
