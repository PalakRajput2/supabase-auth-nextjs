"use client";
import React, { useState } from "react";

import { signInWithGoogle } from "@/actions/auth";
import { useToast } from "./Toasts/ToastProvider";

export default function GoogleSignUpButton() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await signInWithGoogle();
      if (error) {
        console.error("Google sign-in error:", error);
        addToast("Failed to sign in with Google.", "error");
      } else {
        addToast("Redirecting to Google...", "success");
      }
    } catch (err) {
      console.error(err);
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignUp}
      disabled={loading}
      className=" flex justify-center items-center gap-2 px-8 mt-4 py-2 bg-green-500 text-center text-white rounded-md hover:bg-green-600 transition"
    >
      {loading ? "Redirecting..." : "Sign up with Google"}
    </button>
  );
}
