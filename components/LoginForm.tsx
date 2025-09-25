"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/actions/auth";
import { useToast } from "./Toasts/ToastProvider";


export default function LoginForm() {
  const router = useRouter();
  const { addToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await signIn(formData);

      if (result.user) {
        addToast("Logged in successfully ", "success");
        router.push("/");
      } else {
        addToast(result.status || "Login failed ❌", "error");
      }
    } catch (err) {
      console.error("Unexpected login error:", err);
      addToast("Something went wrong ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-6 bg-white rounded-lg shadow-md max-w-md "
    >
      
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input
          type="email"
          className="w-full px-3 py-2 border rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
