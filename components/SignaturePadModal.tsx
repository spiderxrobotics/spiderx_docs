'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { X, Check, RotateCcw, Undo2, Redo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SignaturePadModalProps {
  isOpen: boolean;
  targetDirector?: 1 | 2;
  onClose: () => void;
  onSave: (dataUrl: string, targetDirector?: 1 | 2) => void;
}

export const SignaturePadModal: React.FC<SignaturePadModalProps> = ({
  isOpen,
  targetDirector = 1,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [strokeColor, setStrokeColor] = useState('#0f172a');
  const [strokeWidth, setStrokeWidth] = useState(3);

  // Stroke History Stack for Single-Stroke Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Initialize Canvas stroke styles
  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
      }
    }
  }, [isOpen, strokeColor, strokeWidth]);

  // Save current canvas snapshot into history stack
  const saveSnapshot = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, snapshot]);
    setRedoStack([]); // Clear redo stack on new stroke
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    saveSnapshot();
    setIsDrawing(true);
    setIsEmpty(false);
    draw(e);
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  // Undo last stroke (Ctrl+Z)
  const handleUndo = useCallback(() => {
    if (history.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current state to redo stack
    const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setRedoStack((prev) => [...prev, currentSnapshot]);

    // Pop last state from history
    const newHistory = [...history];
    const previousSnapshot = newHistory.pop();
    setHistory(newHistory);

    if (previousSnapshot) {
      ctx.putImageData(previousSnapshot, 0, 0);
      setIsEmpty(newHistory.length === 0);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    }
  }, [history]);

  // Redo stroke
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current state to history
    const currentSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev, currentSnapshot]);

    // Pop from redo stack
    const newRedoStack = [...redoStack];
    const nextSnapshot = newRedoStack.pop();
    setRedoStack(newRedoStack);

    if (nextSnapshot) {
      ctx.putImageData(nextSnapshot, 0, 0);
      setIsEmpty(false);
    }
  }, [redoStack]);

  // Keyboard Ctrl+Z listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleUndo, handleRedo]);

  const handleClear = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        setIsEmpty(true);
        setHistory([]);
        setRedoStack([]);
      }
    }
  };

  const handleSave = () => {
    if (canvasRef.current && !isEmpty) {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      onSave(dataUrl, targetDirector);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-xl overflow-hidden text-card-foreground">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-card">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              Draw Director {targetDirector} Signature
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Sign with mouse or touch screen. Signature is exported with transparent background.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground rounded-md"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Canvas Area */}
        <div className="p-5 flex flex-col items-center gap-4">
          <div className="relative border-2 border-dashed border-border rounded-lg bg-white overflow-hidden shadow-inner cursor-crosshair">
            <canvas
              ref={canvasRef}
              width={450}
              height={180}
              onMouseDown={startDrawing}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onMouseMove={draw}
              onTouchStart={startDrawing}
              onTouchEnd={stopDrawing}
              onTouchMove={draw}
              className="touch-none block"
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                Sign here...
              </div>
            )}
          </div>

          {/* Stroke Controls & Undo/Redo Buttons */}
          <div className="flex items-center justify-between w-full text-xs text-muted-foreground px-1">
            <div className="flex items-center gap-3">
              <span>Ink Color:</span>
              <button
                type="button"
                onClick={() => setStrokeColor('#0f172a')}
                className={`w-5 h-5 rounded-full bg-slate-900 border-2 ${
                  strokeColor === '#0f172a' ? 'border-[#7f469b] scale-110' : 'border-transparent'
                }`}
                title="Navy / Dark Slate"
              />
              <button
                type="button"
                onClick={() => setStrokeColor('#7f469b')}
                className={`w-5 h-5 rounded-full bg-[#7f469b] border-2 ${
                  strokeColor === '#7f469b' ? 'border-[#4d2a7c] scale-110' : 'border-transparent'
                }`}
                title="SpiderX Violet"
              />
              <button
                type="button"
                onClick={() => setStrokeColor('#000000')}
                className={`w-5 h-5 rounded-full bg-black border-2 ${
                  strokeColor === '#000000' ? 'border-[#7f469b] scale-110' : 'border-transparent'
                }`}
                title="Pure Black"
              />
            </div>

            <div className="flex items-center gap-2">
              <span>Thickness:</span>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-20 accent-[#7f469b] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-border bg-card">
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="text-xs gap-1 rounded-md px-2.5"
              title="Undo Stroke (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" /> Undo
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="text-xs gap-1 rounded-md px-2.5"
              title="Redo Stroke"
            >
              <Redo2 className="w-3.5 h-3.5" /> Redo
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-destructive gap-1 rounded-md px-2 ml-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs rounded-md">
              Cancel
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleSave}
              disabled={isEmpty}
              className="gap-1.5 text-xs font-bold rounded-md"
            >
              <Check className="w-3.5 h-3.5" /> Use Signature
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
