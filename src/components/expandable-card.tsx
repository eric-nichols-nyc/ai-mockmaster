import React, { useState } from 'react';

interface ExpandableCardProps {
  title: string;
  children: React.ReactNode;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div className="border rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center p-4 cursor-pointer" onClick={toggleOpen}>
        <h3 className="text-lg font-semibold">{title}</h3>
        <span>{isOpen ? '−' : '+'}</span> {/* Toggle icon */}
      </div>
      {isOpen && (
        <div className="p-4 border-t">
          {children}
        </div>
      )}
    </div>
  );
};
