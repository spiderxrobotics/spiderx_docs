'use client';

import { useState, useEffect, useCallback } from 'react';
import { DocumentData } from '@/types/letterhead';
import { DEFAULT_DOCUMENT } from '@/utils/defaultTemplates';

export interface SavedDocumentItem {
  id: string;
  title: string;
  refNumber: string;
  updatedAt: string;
  data: DocumentData;
}

export function useDocumentStorage() {
  const [document, setDocumentState] = useState<DocumentData>(DEFAULT_DOCUMENT);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'editing' | 'restored'>('saved');
  const [savedLibrary, setSavedLibrary] = useState<SavedDocumentItem[]>([]);
  const [historyStack, setHistoryStack] = useState<DocumentData[]>([]);
  const [redoStack, setRedoStack] = useState<DocumentData[]>([]);

  // Load saved document state on mount
  useEffect(() => {
    try {
      const savedDocStr = localStorage.getItem('spiderx_letterhead_doc');

      if (savedDocStr) {
        const parsed = JSON.parse(savedDocStr);
        setDocumentState({
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
        setSaveStatus('restored');
      }

      const libraryStr = localStorage.getItem('spiderx_docs_saved_library');
      if (libraryStr) {
        setSavedLibrary(JSON.parse(libraryStr));
      }
    } catch (err) {
      console.error('Failed to parse saved document data from LocalStorage:', err);
    }
  }, []);

  // Save document change to LocalStorage & push to history
  const updateDocument = useCallback((updated: DocumentData) => {
    setHistoryStack((prev) => [...prev.slice(-30), document]); // Keep last 30 states
    setRedoStack([]);
    setDocumentState(updated);
    setSaveStatus('editing');

    try {
      localStorage.setItem('spiderx_letterhead_doc', JSON.stringify(updated));
      setTimeout(() => setSaveStatus('saved'), 600);
    } catch (err) {
      console.error('Failed to save document to LocalStorage:', err);
    }
  }, [document]);

  // Undo document edit (Ctrl+Z)
  const undo = useCallback(() => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    const newHistory = historyStack.slice(0, historyStack.length - 1);

    setRedoStack((prev) => [document, ...prev]);
    setHistoryStack(newHistory);
    setDocumentState(previous);
    setSaveStatus('saved');

    try {
      localStorage.setItem('spiderx_letterhead_doc', JSON.stringify(previous));
    } catch {}
  }, [historyStack, document]);

  // Redo document edit (Ctrl+Y)
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, redoStack.length - 1);

    setHistoryStack((prev) => [...prev, document]);
    setRedoStack(newRedo);
    setDocumentState(next);
    setSaveStatus('saved');

    try {
      localStorage.setItem('spiderx_letterhead_doc', JSON.stringify(next));
    } catch {}
  }, [redoStack, document]);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = window.document.activeElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable);
      
      if (!isTyping && (e.ctrlKey || e.metaKey)) {
        if (e.key === 'z') {
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
        } else if (e.key === 'y') {
          e.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Save current document to saved library
  const saveToLibrary = useCallback(
    (name?: string) => {
      const docTitle = name || document.title || 'Untitled Document';
      const newItem: SavedDocumentItem = {
        id: `doc-${Date.now()}`,
        title: docTitle,
        refNumber: document.refNumber || 'REF: UNTITLED',
        updatedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        data: document,
      };

      const updatedLib = [newItem, ...savedLibrary.filter((x) => x.id !== newItem.id)];
      setSavedLibrary(updatedLib);
      try {
        localStorage.setItem('spiderx_docs_saved_library', JSON.stringify(updatedLib));
      } catch (err) {
        console.error('Failed to save to library:', err);
      }
    },
    [document, savedLibrary]
  );

  // Load document item from saved library
  const loadFromLibrary = useCallback(
    (item: SavedDocumentItem) => {
      updateDocument(item.data);
    },
    [updateDocument]
  );

  // Delete item from saved library
  const deleteFromLibrary = useCallback(
    (id: string) => {
      const updatedLib = savedLibrary.filter((x) => x.id !== id);
      setSavedLibrary(updatedLib);
      try {
        localStorage.setItem('spiderx_docs_saved_library', JSON.stringify(updatedLib));
      } catch {}
    },
    [savedLibrary]
  );

  // Reset to default
  const resetToDefault = useCallback(() => {
    setDocumentState(DEFAULT_DOCUMENT);
    setHistoryStack([]);
    setRedoStack([]);
    localStorage.removeItem('spiderx_letterhead_doc');
    setSaveStatus('saved');
  }, []);

  return {
    document,
    updateDocument,
    saveStatus,
    savedLibrary,
    saveToLibrary,
    loadFromLibrary,
    deleteFromLibrary,
    resetToDefault,
    undo,
    redo,
    canUndo: historyStack.length > 0,
    canRedo: redoStack.length > 0,
  };
}
