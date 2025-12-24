'use client';

import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

const BASE_CARD_CLASS_NAME =
  'rounded-lg border border-gray-200 bg-white p-4 shadow-sm';

export const Card = ({ children, className }: CardProps) => {
  return (
    <div
      className={
        className
          ? `${BASE_CARD_CLASS_NAME} ${className}`
          : BASE_CARD_CLASS_NAME
      }
    >
      {children}
    </div>
  );
};
