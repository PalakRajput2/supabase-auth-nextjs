"use client";

import React, { useState } from "react";
import { forgotPassword } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(event.currentTarget);
    const result = await forgotPassword(formData);

    if (result.status === "success") {
      setSuccess(true);
    } else {
      setError(result.status);
    }

    setLoading(false);
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

      {error && <p className="text-red-500 mt-3">{error}</p>}
      {success && (
        <p className="text-green-600 mt-3">
          ✅ Password reset link sent to your email.
        </p>
      )}
    </div>
  );
}
