'use client';

import type { ChangeEvent } from 'react';

type TextareaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
};

const DEFAULT_ROWS = 4;

const BASE_TEXTAREA_CLASS_NAME =
  'w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50';

export const Textarea = ({
  value,
  onChange,
  placeholder,
  rows = DEFAULT_ROWS,
  disabled = false,
}: TextareaProps) => {
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    // DOMイベントを画面に漏らさず、親が扱いやすい「文字列」だけ渡す
    onChange(e.target.value);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={BASE_TEXTAREA_CLASS_NAME}
    />
  );
};
