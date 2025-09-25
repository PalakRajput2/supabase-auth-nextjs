// components/Toast/ToastProvider.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast, { ToastProps } from "./Toasts";
import { v4 as uuidv4 } from "uuid";

interface ToastContextType {
  addToast: (message: string, type?: "success" | "error", duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = (message: string, type: "success" | "error" = "success", duration = 3000) => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type, duration, onClose }]);
    
    function onClose(idToRemove: string) {
      setToasts((prev) => prev.filter((t) => t.id !== idToRemove));
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
