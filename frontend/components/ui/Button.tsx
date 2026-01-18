'use client';

import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
};

const BASE_BUTTON_CLASS_NAME =
  'w-full rounded-md p-4 disabled:opacity-50 shadow-[5px_5px_5px_-5px_#919191]';

export const Button = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BASE_BUTTON_CLASS_NAME} ${className}`}
    >
      {children}
    </button>
  );
};
