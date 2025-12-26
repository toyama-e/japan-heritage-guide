'use client';

type InputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

const BASE_INPUT_CLASS_NAME =
  'w-full rounded-md border border-gray-300 px-3 py-2 text-sm';

export const Input = ({ value, onChange, placeholder }: InputProps) => {
  return (
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={BASE_INPUT_CLASS_NAME}
    />
  );
};
