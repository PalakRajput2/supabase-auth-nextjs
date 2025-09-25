"use client";

import React, { useState } from "react";
import { forgotPassword } from "@/actions/auth";
import { useToast } from "./Toasts/ToastProvider";


export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast(); // get toast function

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await forgotPassword(formData);

      if (result.status === "success") {
        addToast("✅ Password reset link sent to your email.", "success");
      } else {
        addToast(`❌ ${result.status || "Failed to send reset link."}`, "error");
      }
    } catch (err) {
      console.error(err);
      addToast("❌ Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mt-12">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="text-sm font-medium text-gray-700">
          Email
          <input
            type="email"
            name="email"
            required
            placeholder="Enter your email"
            className="mt-1 w-full px-3 py-2 border rounded-md"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 px-4 rounded-md"
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
