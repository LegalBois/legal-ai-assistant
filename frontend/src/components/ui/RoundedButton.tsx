import clsx from 'clsx';
import { ButtonHTMLAttributes, FC } from 'react';

type TButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'filled' | 'outlined' | 'ghost';
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  icon?: string;
  onClick?: () => void;
  isPulsing?: boolean;
};

export const RoundedButton: FC<TButtonProps> = ({
  variant = 'filled',
  children,
  className,
  disabled = false,
  icon,
  onClick,
  isPulsing = false,
}) => {
  return (
    <div className="relative flex items-center justify-center">
      {isPulsing && (
        <>
          <div className="bg-primary-200/20 animate-pulse-custom absolute inset-0 rounded-full"></div>
          <div className="bg-primary-200/50 animate-pulse-delay absolute inset-0 rounded-full"></div>
        </>
      )}

      <button
        className={clsx(
          'relative z-10 flex min-h-12 items-center justify-center rounded-full p-2 text-base',
          {
            'text-primary-200 border border-gray-200 bg-gray-300': variant === 'filled',
            'border-primary-100 text-primary-100 border': variant === 'outlined',
            'text-primary-100': variant === 'ghost',
          },
          className,
        )}
        disabled={disabled}
        onClick={onClick}
      >
        {icon && <img src={icon} alt="Icon" />}
        {children}
      </button>
    </div>
  );
};
