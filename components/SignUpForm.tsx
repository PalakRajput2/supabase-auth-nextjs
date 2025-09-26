"use client";
import React, { useState } from "react";
import AuthButton from "./AuthButton";
import { useRouter } from "next/navigation";
import { signUp } from "@/actions/auth";
import { useToast } from "./Toasts/ToastProvider";


const SignUpForm = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const result = await signUp(formData);

    if (result.status === "success") {
      addToast("Account created successfully 🎉 Please login.", "success");
      router.push("/login");
    } else {
      addToast(result.status || "Signup failed ", "error");
    }

    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-black">
            Username
          </label>
          <input
            type="text"
            placeholder="Username"
            id="username"
            name="username"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black">
            Email
          </label>
          <input
            type="email"
            placeholder="Email"
            id="email"
            name="email"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black">
            Password
          </label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            id="password"
            className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
          />
        </div>
        <div className="mt-2">
          <AuthButton type="Sign up" loading={loading} />
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;
