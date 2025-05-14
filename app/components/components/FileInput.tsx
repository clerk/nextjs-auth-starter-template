// components/FileInput.tsx
import React from "react";

type FileInputProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
  className?: string;
};

export const FileInput: React.FC<FileInputProps> = ({
  onChange,
  accept = "image/*",
  multiple = true,
  inputRef,
  className = "hidden",
}) => {
  return (
    <input
      type="file"
      ref={inputRef}
      className={className}
      accept={accept}
      multiple={multiple}
      onChange={onChange}
    />
  );
};
