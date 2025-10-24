import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
}

export const Label = ({ children, className = '', ...props }: LabelProps) => (
  <label className={`block text-sm font-medium mb-1 ${className}`} {...props}>
    {children}
  </label>
);
