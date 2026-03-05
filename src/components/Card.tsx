import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
  return (
    <div
      className={`
        rounded-xl bg-[#F79C22] p-4 text-[#083F5E] shadow-lg
        ${hover ? 'transition-transform hover:scale-[1.02]' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
