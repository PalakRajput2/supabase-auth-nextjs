"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

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
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => handleClose(), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => onClose(id), 300); 
  };

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";

  return (
    <div
      className={`flex items-center justify-between gap-2 px-4 py-2 rounded-md text-white shadow-lg ${bgColor} ${
        closing ? "animate-slide-up-fade-out" : "animate-slide-down-fade-in"
      }`}
    >
      <span>{message}</span>
      <button
        onClick={handleClose}
        className="ml-2 text-white hover:text-gray-200 focus:outline-none"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
