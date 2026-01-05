'use client';

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'date';
};

const BASE_INPUT_CLASS_NAME =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm';

export const Input = ({
  value,
  onChange,
  placeholder,
  type = 'text',
}: InputProps) => {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={BASE_INPUT_CLASS_NAME}
    />
  );
};
