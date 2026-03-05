import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-[#F8ECA7]">{label}</label>
      )}
      <input
        className={`
          w-full rounded-lg border-2 bg-[#F8ECA7] px-3 py-2 text-[#083F5E]
          placeholder:text-[#083F5E]/60
          focus:border-[#EECC4E] focus:outline-none focus:ring-2 focus:ring-[#EECC4E]/50
          disabled:opacity-60
          ${error ? 'border-[#A71F26]' : 'border-[#083F5E]/30'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[#A71F26]">{error}</p>}
    </div>
  );
}
