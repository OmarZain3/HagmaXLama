import React from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-[#EECC4E] text-[#083F5E] hover:opacity-90',
  secondary: 'bg-[#99BFDE] text-[#083F5E] hover:opacity-90',
  danger: 'bg-[#A71F26] text-white hover:opacity-90',
  ghost: 'bg-transparent text-[#EECC4E] border border-[#EECC4E] hover:bg-[#EECC4E]/20',
};

export function Button({
  children,
  variant = 'primary',
  loading = false,
  fullWidth,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`
        font-poppins font-semibold rounded-lg px-4 py-2.5 transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
