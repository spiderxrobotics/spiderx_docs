'use client';

import React, { useEffect, useRef } from 'react';
import 'quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write resolution content, headings, bold text, or lists here...',
  minHeight = '120px',
}) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);
  const isUpdatingRef = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current || !wrapperRef.current) return;

    let isMounted = true;

    const initQuill = async () => {
      try {
        const QuillModule = (await import('quill')).default;
        if (!isMounted || !containerRef.current || !wrapperRef.current) return;

        // Remove any leftover duplicate toolbars inside wrapper before initializing
        const existingToolbars = wrapperRef.current.querySelectorAll('.ql-toolbar');
        existingToolbars.forEach((tb) => tb.remove());
        containerRef.current.innerHTML = '';

        // Custom Toolbar Options
        const toolbarOptions = [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ align: [] }],
          ['clean'],
        ];

        const quill = new QuillModule(containerRef.current, {
          theme: 'snow',
          placeholder,
          modules: {
            toolbar: toolbarOptions,
          },
        });

        quillRef.current = quill;

        // Set initial value if provided
        if (value) {
          isUpdatingRef.current = true;
          if (value.startsWith('<') || value.includes('</')) {
            quill.clipboard.dangerouslyPasteHTML(sanitizeHtmlForQuill(value));
          } else {
            // Handle plain text or markdown conversion for initial load
            const formattedVal = convertMarkdownToHtml(value);
            quill.clipboard.dangerouslyPasteHTML(sanitizeHtmlForQuill(formattedVal));
          }
          isUpdatingRef.current = false;
        }

        // Handle user edits
        quill.on('text-change', () => {
          if (isUpdatingRef.current) return;
          let html = containerRef.current?.querySelector('.ql-editor')?.innerHTML || '';
          html = html.replace(/<span class="ql-ui" contenteditable="false"><\/span>/gi, '');
          isUpdatingRef.current = true;
          onChange(html);
          setTimeout(() => {
            isUpdatingRef.current = false;
          }, 0);
        });
      } catch (err) {
        console.error('Failed to initialize Quill editor:', err);
      }
    };

    initQuill();

    return () => {
      isMounted = false;
      quillRef.current = null;
      if (wrapperRef.current) {
        const toolbars = wrapperRef.current.querySelectorAll('.ql-toolbar');
        toolbars.forEach((tb) => tb.remove());
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []); // Run once on mount

  // Sync external value changes when modified outside Quill
  useEffect(() => {
    if (!quillRef.current) return;
    if (isUpdatingRef.current) return;

    const currentHtml = containerRef.current?.querySelector('.ql-editor')?.innerHTML || '';

    const normValue = (value || '').trim();
    const normCurrent = (currentHtml || '').trim();

    if (normValue !== normCurrent) {
      isUpdatingRef.current = true;
      const range = quillRef.current.getSelection();
      if (normValue.startsWith('<') || normValue.includes('</')) {
        quillRef.current.clipboard.dangerouslyPasteHTML(sanitizeHtmlForQuill(normValue));
      } else {
        quillRef.current.clipboard.dangerouslyPasteHTML(sanitizeHtmlForQuill(convertMarkdownToHtml(normValue)));
      }
      if (range) {
        quillRef.current.setSelection(range);
      }
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [value]);

  return (
    <div ref={wrapperRef} className="spiderx-quill-wrapper rounded-md border border-input bg-background overflow-hidden">
      <div ref={containerRef} style={{ minHeight }} />
    </div>
  );
};

/**
 * Sanitizes HTML string for Quill, removing UI artifacts and converting embedded markdown
 */
function sanitizeHtmlForQuill(html: string): string {
  if (!html) return '';
  return html
    .replace(/<span class="ql-ui" contenteditable="false"><\/span>/gi, '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
}

/**
 * Converts legacy markdown syntax to clean HTML for Quill initialization
 */
function convertMarkdownToHtml(text: string): string {
  if (!text) return '';
  let html = text;

  // Convert headings
  if (html.startsWith('# ')) {
    html = `<h1>${html.slice(2)}</h1>`;
  } else if (html.startsWith('## ')) {
    html = `<h2>${html.slice(3)}</h2>`;
  } else if (html.startsWith('### ')) {
    html = `<h3>${html.slice(4)}</h3>`;
  } else {
    // Bold, Italic, Underline
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/<u>(.*?)<\/u>/g, '<u>$1</u>');
    html = `<p>${html}</p>`;
  }

  return html;
}
