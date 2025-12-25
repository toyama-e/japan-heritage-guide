'use client';

import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

const DEFAULT_BUTTON_TYPE: ButtonProps['type'] = 'button';

const BASE_BUTTON_CLASS_NAME =
  'w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50';

export const Button = ({
  children,
  onClick,
  type = DEFAULT_BUTTON_TYPE,
  disabled = false,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={BASE_BUTTON_CLASS_NAME}
    >
      {children}
    </button>
  );
};
