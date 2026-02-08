import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: boolean;
  className?: string;
  fullWidth?: boolean;
  disabled?: boolean;
}
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  icon = false,
  className = '',
  fullWidth = false,
  disabled = false
}) => {
  const baseStyles = 'flex items-center justify-center gap-2 py-2 px-2 rounded-full font-medium text-lg transition-all duration-300';
  const variantStyles = {
    primary: 'bg-[#3EFEFE] text-black hover:bg-[#00e2e2]',
    secondary: 'bg-black text-white border border-white hover:bg-gray-900'
  };
  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
  return <button onClick={onClick} className={`${baseStyles} ${variantStyles[variant]} ${widthClass} ${className} ${disabledClass}`} disabled={disabled}>
      {children}
      {icon && <ArrowRightIcon size={20} />}
    </button>;
};
export default Button;