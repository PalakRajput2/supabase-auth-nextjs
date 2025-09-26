"use client";

import React, { useState } from "react";
import { useToast } from "./Toasts/ToastProvider";
import { FaGoogle } from "react-icons/fa";
import { signInWithGoogle } from "@/actions/auth";

export default function SigninGoogle() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const result = await signInWithGoogle();

      if (result?.success && result.redirectUrl) {
        addToast("Redirecting to Google...", "success");
        // Client-side redirect
        window.location.href = result.redirectUrl;
        return;
      }
      if (!result?.success) {
        addToast(result?.message || "Failed to sign in with Google", "error");
      }
    } catch (err) {
      console.error(err);
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleGoogleSignUp}
      className="w-full gap-3 hover:cursor-pointer mt-4 h-12 bg-green-600 rounded-md p-3 flex justify-center items-center"
    >
      <FaGoogle className="text-white" />
      <p className="text-white">{loading ? "Redirecting..." : "Signup with Google"}</p>
    </div>
  );
}