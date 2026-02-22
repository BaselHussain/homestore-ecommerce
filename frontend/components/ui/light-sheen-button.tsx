'use client';

import React from 'react';

interface LightSheenButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  withSheen?: boolean;
}

const LightSheenButton: React.FC<LightSheenButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  withSheen = true,
  ...props
}) => {
  const baseClasses = 'relative overflow-hidden transition-all duration-300';

  const sheenClasses = withSheen
    ? 'before:content-[""] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-[100%]'
    : '';

  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/50 hover:scale-[1.02]',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-lg hover:shadow-primary/20 hover:scale-[1.02]',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02]',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/50 hover:scale-[1.02]',
    ghost: 'hover:bg-accent hover:text-accent-foreground hover:shadow-md hover:shadow-primary/20',
    link: 'text-primary underline-offset-4 hover:underline',
  };

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-sm px-6 py-3',
  };

  const buttonClasses = `${baseClasses} ${sheenClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
};

export default LightSheenButton;
