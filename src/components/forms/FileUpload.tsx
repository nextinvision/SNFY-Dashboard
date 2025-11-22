'use client';

import { useRef } from "react";

interface FileUploadProps {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
}

export function FileUpload({ label, value, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-zinc-700">{label}</label>
      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 p-6 text-center"
        onClick={() => inputRef.current?.click()}
      >
        <p className="text-sm text-zinc-600">
          Drag & drop logo here or <span className="font-semibold">browse</span>
        </p>
        <p className="text-xs text-zinc-400">PNG, JPG up to 2 MB</p>
        {value && (
          <img
            src={value}
            alt="Logo preview"
            className="mt-4 h-12 w-12 rounded-md object-cover"
          />
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

