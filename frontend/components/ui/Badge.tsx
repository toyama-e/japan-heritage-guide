'use client';

import type { ReactNode } from 'react';

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

const BASE_BADGE_CLASS_NAME =
  'inline-flex items-center rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-800';

export const Badge = ({ children, className }: BadgeProps) => {
  return (
    <span
      className={
        className
          ? `${BASE_BADGE_CLASS_NAME} ${className}`
          : BASE_BADGE_CLASS_NAME
      }
    >
      {children}
    </span>
  );
};
