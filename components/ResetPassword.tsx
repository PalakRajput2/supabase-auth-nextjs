"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { resetPassword } from "@/actions/auth";
import { useToast } from "./Toasts/ToastProvider";


export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToast } = useToast(); // toast hook
  const [loading, setLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const code = searchParams.get("code"); 

  useEffect(() => {
    const err = searchParams.get("error_description");
    if (err) addToast(err, "error"); // show initial error as toast
  }, [searchParams, addToast]);

  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!code) {
      addToast("Invalid or missing reset code", "error");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await resetPassword(formData, code);

      if (result.status === "success") {
        addToast(" Password reset successfully!", "success");
        router.push("/login?message=reset_success");
      } else {
        addToast(result.status || "Failed to reset password", "error");
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
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
        <label className="text-sm font-medium">New Password</label>
        <input
          ref={passwordRef}
          type="password"
          name="password"
          required
          className="px-3 py-2 border rounded-md"
          placeholder="Enter new password"
        />
        <button
          type="submit"
          disabled={loading || !code}
          className={`py-2 rounded-md text-white ${
            loading || !code ? "bg-gray-400" : "bg-blue-600"
          }`}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
