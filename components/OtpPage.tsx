"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifyOtp } from "@/actions/auth";
import { useToast } from "./Toasts/ToastProvider";

export default function OtpPage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Get email from localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem("otp_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      addToast("No email found. Please restart the login process.", "error");
      router.push("/login");
    }
  }, [router, addToast]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp) {
      addToast("Please enter OTP ❌", "error");
      return;
    }

    if (!email) {
      addToast("Email not found. Please try again.", "error");
      return;
    }

    // Validate OTP format (6 digits)
    const otpRegex = /^\d{6}$/;
    if (!otpRegex.test(otp)) {
      addToast("Please enter a valid 6-digit OTP ❌", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("token", otp.trim());
      
      const res = await verifyOtp(formData);
      
      if (res.status === "success") {
        addToast("Login successful! ✅", "success");
        // Clear stored email
        localStorage.removeItem("otp_email");
        router.push("/");
      } else {
        addToast(res.status || "Invalid or expired OTP ❌", "error");
        // Clear OTP field on error
        setOtp("");
      }
    } catch (err) {
      console.error("OTP verification error:", err);
      addToast("Something went wrong ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", email);
      
      const response = await fetch('/api/auth/otp', { // You'll need to create this API route
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        addToast("OTP resent successfully ✅", "success");
        setOtp(""); // Clear previous OTP
      } else {
        addToast("Failed to resend OTP ❌", "error");
      }
    } catch (err) {
      console.error("Resend OTP error:", err);
      addToast("Failed to resend OTP ❌", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleVerifyOtp} className="space-y-4 p-6 bg-white rounded-md shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold text-center">Enter OTP</h2>
        
        {/* Show the email that OTP was sent to */}
        {email && (
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600">OTP sent to: <strong>{email}</strong></p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-2">6-Digit OTP Code</label>
          <input 
            type="text" 
            value={otp} 
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} 
            required 
            className="w-full px-3 py-2 border rounded-md text-center text-lg font-mono" 
            placeholder="Enter 6-digit code" 
            maxLength={6}
            pattern="\d{6}"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">Enter the 6-digit code sent to your email</p>
        </div>
        
        <button 
          type="submit" 
          disabled={loading || otp.length !== 6}
          className="w-full py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        
        <button 
          type="button"
          onClick={handleResendOtp}
          disabled={loading}
          className="w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Resend OTP"}
        </button>
      </form>
    </div>
  );
}