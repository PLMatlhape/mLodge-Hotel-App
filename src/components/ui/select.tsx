import React, { useState, useRef, useEffect } from 'react';

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

export const Select = ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  // Update selected label when value changes from parent
  useEffect(() => {
    // Find the label from children when value changes
    React.Children.forEach(children, child => {
      if (React.isValidElement(child) && child.type === SelectContent) {
        React.Children.forEach(child.props.children, item => {
          if (React.isValidElement(item) && item.props.value === value) {
            const label = typeof item.props.children === 'string' ? item.props.children : value;
            setSelectedLabel(label);
          }
        });
      }
    });
  }, [value, children]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, selectedLabel, setSelectedLabel }}>
      <div className="relative" ref={selectRef}>
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = ({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectTrigger must be used within Select');

  return (
    <div
      className={`w-full px-3 py-2 border rounded-md cursor-pointer flex items-center justify-between ${className}`}
      style={style}
      onClick={() => context.setIsOpen(!context.isOpen)}
    >
      {children}
      <svg
        className={`w-4 h-4 transition-transform ${context.isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
};

export const SelectValue = ({ placeholder = 'Select...' }: { placeholder?: string } = {}) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectValue must be used within Select');

  // Show the selected label if available, otherwise show placeholder
  const displayText = context.selectedLabel || placeholder;
  
  return <span className={context.selectedLabel ? 'text-black' : 'text-gray-400'}>{displayText}</span>;
};

export const SelectContent = ({ children, style, className = '' }: { children: React.ReactNode; style?: React.CSSProperties; className?: string }) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectContent must be used within Select');

  if (!context.isOpen) return null;

  return (
    <div className={`absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto ${className}`} style={style}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            ...child.props,
            isSelected: child.props.value === context.value 
          } as Record<string, unknown>);
        }
        return child;
      })}
    </div>
  );
};

export const SelectItem = ({ 
  children, 
  value, 
  style, 
  className = '',
  isSelected
}: { 
  children: React.ReactNode; 
  value: string; 
  style?: React.CSSProperties; 
  className?: string;
  isSelected?: boolean;
}) => {
  const context = React.useContext(SelectContext);
  if (!context) throw new Error('SelectItem must be used within Select');

  const handleClick = () => {
    context.onValueChange(value);
    context.setSelectedLabel(typeof children === 'string' ? children : value);
    context.setIsOpen(false);
  };

  return (
    <div
      className={`px-3 py-2 cursor-pointer transition-colors ${
        isSelected 
          ? 'bg-blue-primary/10 text-black font-medium' 
          : 'hover:bg-blue-primary/10 text-black'
      } ${className}`}
      style={style}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};
