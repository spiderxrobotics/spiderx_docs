'use client';

import { useState, useEffect, useCallback } from 'react';
import { DocumentData } from '@/types/letterhead';
import { DEFAULT_DOCUMENT, BLANK_GUEST_DOCUMENT } from '@/utils/defaultTemplates';
import { UserRole } from '@/components/AccountLoginModal';

export interface SavedDocumentItem {
  id: string;
  title: string;
  refNumber: string;
  updatedAt: string;
  data: DocumentData;
}

export function useDocumentStorage() {
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [document, setDocumentState] = useState<DocumentData>(DEFAULT_DOCUMENT);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'editing' | 'restored'>('saved');
  const [savedLibrary, setSavedLibrary] = useState<SavedDocumentItem[]>([]);
  const [historyStack, setHistoryStack] = useState<DocumentData[]>([]);
  const [redoStack, setRedoStack] = useState<DocumentData[]>([]);

  // Helper to get storage key per role
  const getStorageKey = (role: UserRole) => `spiderx_letterhead_doc_${role}`;

  // Load saved role & initial document state on mount
  useEffect(() => {
    try {
      const savedRole = (localStorage.getItem('spiderx_user_role') as UserRole) || 'admin';
      setUserRole(savedRole);

      const targetKey = `spiderx_letterhead_doc_${savedRole}`;
      // Fallback for legacy key
      const savedDocStr = localStorage.getItem(targetKey) || localStorage.getItem('spiderx_letterhead_doc');
      const baseDefault = savedRole === 'guest' ? BLANK_GUEST_DOCUMENT : DEFAULT_DOCUMENT;

      if (savedDocStr) {
        const parsed = JSON.parse(savedDocStr);
        setDocumentState({
          ...baseDefault,
          ...parsed,
          recipient: {
            ...baseDefault.recipient,
            ...(parsed.recipient || {}),
          },
          body: {
            ...baseDefault.body,
            ...(parsed.body || {}),
          },
          signatory: {
            ...baseDefault.signatory,
            ...(parsed.signatory || {}),
          },
        });
        setSaveStatus('restored');
      } else {
        setDocumentState(baseDefault);
      }

      const libraryStr = localStorage.getItem(`spiderx_docs_saved_library_${savedRole}`);
      if (libraryStr) {
        setSavedLibrary(JSON.parse(libraryStr));
      }
    } catch (err) {
      console.error('Failed to parse saved document data from LocalStorage:', err);
    }
  }, []);

  // Save document change to LocalStorage & push to history
  const updateDocument = useCallback(
    (updated: DocumentData) => {
      setHistoryStack((prev) => [...prev.slice(-30), document]); // Keep last 30 states
      setRedoStack([]);
      setDocumentState(updated);
      setSaveStatus('editing');

      try {
        const key = getStorageKey(userRole);
        localStorage.setItem(key, JSON.stringify(updated));
        setTimeout(() => setSaveStatus('saved'), 600);
      } catch (err) {
        console.error('Failed to save document to LocalStorage:', err);
      }
    },
    [document, userRole]
  );

  // Switch role between Admin and Guest
  const switchUserRole = useCallback(
    (targetRole: UserRole) => {
      try {
        // Save current role document state first
        localStorage.setItem(getStorageKey(userRole), JSON.stringify(document));

        // Switch role state
        setUserRole(targetRole);
        localStorage.setItem('spiderx_user_role', targetRole);

        // Load target role document state
        const targetKey = getStorageKey(targetRole);
        const targetSavedStr = localStorage.getItem(targetKey);
        const baseDefault = targetRole === 'guest' ? BLANK_GUEST_DOCUMENT : DEFAULT_DOCUMENT;

        if (targetSavedStr) {
          const parsed = JSON.parse(targetSavedStr);
          setDocumentState({
            ...baseDefault,
            ...parsed,
            recipient: {
              ...baseDefault.recipient,
              ...(parsed.recipient || {}),
            },
            body: {
              ...baseDefault.body,
              ...(parsed.body || {}),
            },
            signatory: {
              ...baseDefault.signatory,
              ...(parsed.signatory || {}),
            },
          });
        } else {
          setDocumentState(baseDefault);
        }

        // Load target role library
        const libraryStr = localStorage.getItem(`spiderx_docs_saved_library_${targetRole}`);
        if (libraryStr) {
          setSavedLibrary(JSON.parse(libraryStr));
        } else {
          setSavedLibrary([]);
        }

        // Reset undo/redo history stack for new workspace profile
        setHistoryStack([]);
        setRedoStack([]);
        setSaveStatus('saved');
      } catch (err) {
        console.error('Failed to switch user role profile:', err);
      }
    },
    [document, userRole]
  );

  // Undo document edit (Ctrl+Z)
  const undo = useCallback(() => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    const newHistory = historyStack.slice(0, historyStack.length - 1);

    setRedoStack((prev) => [...prev, document]);
    setHistoryStack(newHistory);
    setDocumentState(previous);
    setSaveStatus('saved');

    try {
      localStorage.setItem(getStorageKey(userRole), JSON.stringify(previous));
    } catch {}
  }, [historyStack, document, userRole]);

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
      localStorage.setItem(getStorageKey(userRole), JSON.stringify(next));
    } catch {}
  }, [redoStack, document, userRole]);

  // Keyboard shortcut listener for Ctrl+Z and Ctrl+Y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = window.document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as HTMLElement).isContentEditable);

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
        localStorage.setItem(`spiderx_docs_saved_library_${userRole}`, JSON.stringify(updatedLib));
      } catch (err) {
        console.error('Failed to save to library:', err);
      }
    },
    [document, savedLibrary, userRole]
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
        localStorage.setItem(`spiderx_docs_saved_library_${userRole}`, JSON.stringify(updatedLib));
      } catch {}
    },
    [savedLibrary, userRole]
  );

  // Reset to default
  const resetToDefault = useCallback(() => {
    const defaultTarget = userRole === 'guest' ? BLANK_GUEST_DOCUMENT : DEFAULT_DOCUMENT;
    if (confirm(`Are you sure you want to reset all document fields to ${userRole === 'admin' ? 'SpiderX Official' : 'Blank Guest'} defaults?`)) {
      setDocumentState(defaultTarget);
      setHistoryStack([]);
      setRedoStack([]);
      localStorage.removeItem(getStorageKey(userRole));
      setSaveStatus('saved');
    }
  }, [userRole]);

  return {
    userRole,
    switchUserRole,
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
