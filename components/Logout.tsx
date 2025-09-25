"use client";
import React, { useState } from "react";
import { signOut } from "@/actions/auth";
import { useToast } from "./Toasts/ToastProvider";
import { useRouter } from "next/navigation";

const Logout = () => {
  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { error } = await signOut();

      if (error) {
        console.error("Logout error:", error);
        addToast("Failed to sign out.", "error");
      } else {
        addToast("Signed out successfully!", "success");
        router.push("/login");
      }
    } catch (err: any) {
      console.error("Unexpected logout error:", err);
      addToast("Failed to sign out.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-600 text-white text-sm px-4 py-2 rounded-md cursor-pointer">
      <form onSubmit={handleLogout}>
        <button type="submit" disabled={loading}>
          {loading ? "Signing out..." : "Sign out"}
        </button>
      </form>
    </div>
  );
};

export default Logout;
