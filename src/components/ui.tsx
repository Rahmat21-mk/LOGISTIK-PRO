import React from 'react';

export function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: any) => void;
  disabled?: boolean;
}

export function Button({ children, variant = 'primary', icon: Icon, className = '', ...props }: ButtonProps) {
  const baseStyle = "flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-teal-600 text-white hover:bg-teal-700 shadow-sm",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
    danger: "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200",
    outline: "border border-slate-200 text-slate-700 hover:border-teal-600 hover:text-teal-700 bg-transparent"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={14} strokeWidth={2.5} />}
      {children}
    </button>
  );
}
