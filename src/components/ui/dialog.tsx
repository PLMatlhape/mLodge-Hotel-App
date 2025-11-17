import React from 'react';

export const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
  <>
    {open && (
      <div
        className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        onClick={() => onOpenChange(false)}
      >
        {/*
          Use a centered container that is responsive: on very small screens the
          dialog will be full-width (padded), on larger screens it will use the
          child's width (DialogContent controls max-width).
        */}
        <div className="w-full max-w-4xl mx-auto" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    )}
  </>
);

export const DialogContent = ({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => (
  <div className={`bg-white rounded-lg p-6 w-full mx-auto ${className}`} style={style}>
    {children}
  </div>
);

export const DialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">
    {children}
  </div>
);

export const DialogTitle = ({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => (
  <h2 className={`text-lg font-semibold ${className}`} style={style}>
    {children}
  </h2>
);
