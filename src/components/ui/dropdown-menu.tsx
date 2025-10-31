import React, { useState, useRef, useEffect } from 'react';

interface DropdownMenuContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | undefined>(undefined);

export const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block" ref={dropdownRef}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
};

export const DropdownMenuTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuTrigger must be used within DropdownMenu');

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    context.setIsOpen(!context.isOpen);
  };

  // If asChild is true, clone the child and add onClick handler
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as React.HTMLAttributes<HTMLElement>);
  }

  return <div onClick={handleClick}>{children}</div>;
};

export const DropdownMenuContent = ({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuContent must be used within DropdownMenu');

  if (!context.isOpen) return null;

  return (
    <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border ${className}`} style={style}>
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

export const DropdownMenuItem = ({ children, onClick, style, className = '' }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties; className?: string }) => {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error('DropdownMenuItem must be used within DropdownMenu');

  const handleClick = () => {
    onClick?.();
    context.setIsOpen(false);
  };

  return (
    <button
      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center transition-colors ${className}`}
      onClick={handleClick}
      style={style}
    >
      {children}
    </button>
  );
};
