'use client';

import type { ReactNode } from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
};

const BASE_CARD_CLASS_NAME =
  'rounded-lg  p-4 shadow-[5px_7px_10px_-5px_#919191]';

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
