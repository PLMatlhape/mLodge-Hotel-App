import React from 'react';

export const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open: boolean; onOpenChange: (open: boolean) => void }) => (
  <>
    {open && (
      <div className="fixed inset-0 z-50 bg-black/50" onClick={() => onOpenChange(false)}>
        <div 
          className="fixed top-1/2" 
          style={{ 
            left: '240px', // Start at sidebar end
            transform: 'translateY(-50%)' // Center vertically only
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    )}
  </>
);

export const DialogContent = ({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => (
  <div className={`bg-white rounded-lg p-6 max-w-md w-full mx-4 ${className}`} style={style}>
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
