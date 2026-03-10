import React from "react";

export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
  
  const variants = {
    primary: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-300',
    ghost: 'hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 focus-visible:ring-zinc-500',
    outline: 'border border-zinc-200 bg-transparent hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 focus-visible:ring-zinc-500'
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 py-2 text-sm',
    lg: 'h-10 px-8 text-base'
  };

  const buttonClasses = `${baseStyles} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  return (
    <button 
      className={buttonClasses} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
