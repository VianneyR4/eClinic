"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeSlash, SmsTracking } from "iconsax-react";
import { apiService } from "@/services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null); // TEST ONLY: shown when API provides debug_verification_code

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.login(email, password);

      if (response.success) {
        if (response.data?.token) {
          localStorage.setItem("token", response.data.token);
          router.push("/dashboard");
        }
      } else {
        if (response.requires_verification) {
          setShowVerification(true);
          setSuccess("Verification code sent. Please check your email to continue.");
          if (response.debug_verification_code) {
            // NOTE: This code is displayed only in local/testing to help QA. Do not show in production.
            setDebugCode(response.debug_verification_code);
          }
        } else {
          setError(response.message || "Login failed. Please check your credentials.");
        }
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An error occurred during login. Please try again.";
      setError(errorMessage);

      if (err.response?.data?.requires_verification) {
        setShowVerification(true);
        setSuccess("Verification code sent to your email. Please check your inbox.");
        if (err.response?.data?.debug_verification_code) {
          // NOTE: This code is displayed only in local/testing to help QA. Do not show in production.
          setDebugCode(err.response.data.debug_verification_code);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.verifyEmail(email, verificationCode);

      if (response.success) {
        if (response.data?.token) {
          localStorage.setItem("token", response.data.token);
          setSuccess("Email verified successfully! Redirecting...");
          setTimeout(() => {
            router.push("/dashboard");
          }, 1000);
        }
      } else {
        setError(response.message || "Invalid verification code. Please try again.");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Invalid verification code. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.resendVerificationCode(email);
      if (response.success) {
        setSuccess("Verification code resent to your email.");
        if (response.debug_verification_code) {
          // NOTE: This code is displayed only in local/testing to help QA. Do not show in production.
          setDebugCode(response.debug_verification_code);
        }
      } else {
        setError(response.message || "Failed to resend verification code.");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to resend verification code.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary mb-1">eClinic</h1>
            <p className="text-sm text-gray-600">Sign in to your account</p>
          </div>


          {/* Error Message */}
          {error && (
            <div className="mb-4 border border-red-200 rounded-md p-3 text-sm text-red-700 bg-red-50/50">
              {error}
            </div>
          )}


          {/* {success && (
            <p className="mb-4 text-sm text-green-600 font-medium text-center">{success}</p>
          )} */}


          {/* Modern Success / Info Message */}
          {/* {success && (
            <div className="mb-4 border border-gray-200 rounded-md p-3 flex items-start gap-3 bg-gray-50">
              <SmsTracking size={18} className="text-primary mt-0.5" />
              <div className="text-sm text-gray-800 leading-snug">{success}</div>
            </div>
          )} */}

          {!showVerification ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-gray-700 mb-1.5"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition pr-9 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  >
                    {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-2 text-sm rounded-md font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isLoading ? "Signing in..." : <>Sign In <ArrowRight size={16} /></>}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Simplified Email Verification Info */}
            <div className="mb-4 border border-gray-200 rounded-md p-3 flex items-start gap-3 bg-gray-50">
                <SmsTracking size={48} className="text-primary" style={{ marginTop: '-13px' }} />
                <div className="text-sm text-gray-800 leading-snug">
                  <p className="font-medium">Email Verification Required</p>
                  <p>
                    We&rsquo;ve sent a 6-digit code to{" "}
                    <span className="font-semibold">{email}</span>. Please check
                    your inbox and enter it below to continue.
                  </p>
                </div>
              </div>

              {debugCode && (
                <div className="mb-4 border border-yellow-200 rounded-md p-3 bg-yellow-50 text-sm">
                  <p className="font-medium text-yellow-800">Test-only: Verification Code</p>
                  <p className="text-yellow-800">
                    Use this code in local/testing environments: <span className="font-mono font-semibold">{debugCode}</span>
                  </p>
                  {/* NOTE: Do not display this in production. Controlled by backend env and local/testing checks. */}
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label
                    htmlFor="code"
                    className="block text-xs font-medium text-gray-700 mb-1.5"
                  >
                    Enter Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    maxLength={6}
                    disabled={isLoading}
                    className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:ring-1 focus:ring-primary focus:border-transparent outline-none transition text-center tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="000000"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-primary text-white py-2 text-sm rounded-md font-medium hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                >
                  {isLoading ? "Verifying..." : <>Verify Email <ArrowRight size={16} /></>}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="w-full text-primary py-1.5 text-xs hover:underline transition disabled:opacity-50"
                >
                  Resend verification code
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowVerification(false);
                    setVerificationCode("");
                    setError(null);
                    setSuccess(null);
                  }}
                  disabled={isLoading}
                  className="w-full text-gray-600 py-1.5 text-xs hover:text-gray-800 transition disabled:opacity-50"
                >
                  Back to login
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
