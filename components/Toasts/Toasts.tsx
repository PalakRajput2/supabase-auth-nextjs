// components/Toast/Toast.tsx
"use client";

import React, { useEffect } from "react";

export interface ToastProps {
  id: string;
  message: string;
  type?: "success" | "error";
  duration?: number;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type = "success",
  duration = 4000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div
      className={`px-4 py-2 rounded-md text-white shadow-lg ${bgColor} animate-slide-in`}
    >
      {message}
    </div>
  );
};

export default Toast;
