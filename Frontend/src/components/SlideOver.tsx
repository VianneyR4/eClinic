"use client";

import { useEffect } from "react";

interface SlideOverProps {
  open: boolean;
  title?: string;
  widthClass?: string; // e.g. max-w-md, max-w-lg
  onClose: () => void;
  children: React.ReactNode;
}

export default function SlideOver({ open, title, widthClass = "max-w-md", onClose, children }: SlideOverProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`absolute right-0 top-0 h-full w-full ${widthClass} bg-white shadow-xl border-l border-gray-200 flex flex-col`}
        role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">Close</button>
        </div>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
