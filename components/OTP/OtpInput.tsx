"use client";

import { ChangeEvent, KeyboardEvent } from "react";

interface OtpInputProps {
  value: string[];
  onChange: (idx: number, val: string) => void;
  onBackspace: (idx: number) => void;
inputRefs: React.RefObject<HTMLInputElement | null>[];
}

export default function OtpInput({ value, onChange, onBackspace, inputRefs }: OtpInputProps) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      {value.map((digit, idx) => (
        <input
          key={idx}
          type="text"
          value={digit}
          ref={inputRefs[idx]}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(idx, e.target.value.replace(/\D/g, ""))
          }
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) =>
            e.key === "Backspace" && !digit && onBackspace(idx)
          }
          maxLength={1}
          className="w-12 h-12 text-center text-2xl border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      ))}
    </div>
  );
}
