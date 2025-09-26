"use client";
import React, { useState } from "react";

import { signInWithGoogle } from "@/actions/auth";
import { useToast } from "./Toasts/ToastProvider";
import { FaGoogle, FaGoogleDrive } from "react-icons/fa";

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

       <div
          onClick={handleGoogleSignUp}
          className="w-full gap-3 hover:cursor-pointer mt-6 h-12 bg-green-600 rounded-md p-4 flex justify-center items-center"
        >
          <FaGoogle className="text-white" />
          <p className="text-white">
            {loading ? "Redirecting..." : "Signup with Google"}
          </p>
        </div>
  );
}
