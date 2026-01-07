'use client';

import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string; // ① 追加
};

const DEFAULT_BUTTON_TYPE: ButtonProps['type'] = 'button';

const BASE_BUTTON_CLASS_NAME =
  'w-full rounded-md px-4 py-2 disabled:opacity-50 shadow-[5px_5px_5px_-5px_#919191]';

export const Button = ({
  children,
  onClick,
  type = DEFAULT_BUTTON_TYPE,
  disabled = false,
  className, // ② 受け取る
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${BASE_BUTTON_CLASS_NAME} ${className ?? ''}`} // ③ 後ろに追加
    >
      {children}
    </button>
  );
};
