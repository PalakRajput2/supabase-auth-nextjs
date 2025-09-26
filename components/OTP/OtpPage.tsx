"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp, resendOtp } from "@/actions/auth";
import { useToast } from "@/components/Toasts/ToastProvider";
import OtpInput from "./OtpInput";



export default function OtpPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [loadingResend, setLoadingResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // create refs for each OTP input
  const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  // countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // get email from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("otp_email");
      if (storedEmail) setEmail(storedEmail);
      else {
        addToast("No email found. Please restart login.", "error");
        setTimeout(() => router.replace("/login"), 500);
      }
    }
  }, []);

  const handleChange = (idx: number, val: string) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputRefs[idx + 1].current?.focus();
  };

  const handleBackspace = (idx: number) => {
    if (idx > 0) inputRefs[idx - 1].current?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpStr = otp.join("");

    // Check if any box is empty
    if (otp.some((digit) => digit.trim() === "")) {
      addToast("Please enter OTP. Your boxes are empty ", "error");
      return;
    }

    // Validate full format (must be exactly 6 digits)
    if (!/^\d{6}$/.test(otpStr)) {
      addToast("Please enter a valid 6-digit OTP ", "error");
      return;
    }
    setLoadingVerify(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("token", otpStr);

      const res = await verifyOtp(formData);
      if (res.status === "success") {
        addToast("Login successful ", "success");
        localStorage.removeItem("otp_email");
        router.push("/");
      } else {
        addToast(res.status || "Invalid or expired OTP ", "error");
        setOtp(["", "", "", "", "", ""]);
        inputRefs[0].current?.focus();
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      addToast("Something went wrong ", "error");
    } finally {
      setLoadingVerify(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      addToast("Email not found. Please login again", "error");
      return;
    }
    setLoadingResend(true);
    try {
      const res = await resendOtp(email);
      if (res.status === "OTP resent successfully") {
        addToast(res.status, "success");
        setOtp(["", "", "", "", "", ""]);
        setResendTimer(30);
        inputRefs[0].current?.focus();
      } else {
        addToast(res.status || "Failed to resend OTP !!!", "error");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      addToast("Failed to resend OTP !!!", "error");
    } finally {
      setLoadingResend(false);
    }
  };

  return (
    <div className="flex items-center justify-center mt-10">
      <form
        onSubmit={handleVerifyOtp}
        className="space-y-6 p-6 bg-white rounded-md shadow-lg w-full max-w-md"
      >
        <h2 className="text-xl font-semibold text-center">Enter OTP</h2>

        {email && (
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600">
              OTP sent to: <strong>{email}</strong>
            </p>
          </div>
        )}

        <OtpInput
          value={otp}
          onChange={handleChange}
          onBackspace={handleBackspace}
          inputRefs={inputRefs}
        />
        <button
          type="submit"
          disabled={loadingVerify}
          className="w-full py-2 bg-green-700 text-white rounded-md hover:bg-green-800 disabled:opacity-80 cursor-pointer"
        >
          {loadingVerify ? "Verifying..." : "Verify OTP"}
        </button>


        <button
          type="button"
          onClick={handleResendOtp}
          disabled={loadingResend || resendTimer > 0}
          className="w-full py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 disabled:opacity-90 cursor-pointer"
        >
          {resendTimer > 0
            ? `Resend OTP in ${resendTimer}s`
            : loadingResend
              ? "Sending..."
              : "Resend OTP"}
        </button>
      </form>
    </div>
  );
}
