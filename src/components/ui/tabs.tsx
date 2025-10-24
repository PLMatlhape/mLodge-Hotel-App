import React, { useState, createContext, useContext } from 'react';

interface TabsContextType {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export const Tabs = ({ 
  children, 
  defaultValue, 
  value, 
  onValueChange 
}: { 
  children: React.ReactNode; 
  defaultValue?: string; 
  value?: string; 
  onValueChange?: (value: string) => void;
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const currentValue = value !== undefined ? value : internalValue;
  const handleValueChange = onValueChange || setInternalValue;

  return (
    <TabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className="w-full">
        {children}
      </div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

export const TabsTrigger = ({ 
  children, 
  value,
  className = '' 
}: { 
  children: React.ReactNode; 
  value: string;
  className?: string;
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`px-4 py-2 font-medium transition-colors border-b-2 ${
        isActive 
          ? 'border-[#0F51AF] text-[#0F51AF]' 
          : 'border-transparent text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ 
  children, 
  value,
  className = '' 
}: { 
  children: React.ReactNode; 
  value: string;
  className?: string;
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};
