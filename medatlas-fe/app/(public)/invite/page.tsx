"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootState } from "@/store";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { enqueueSnackbar } from "notistack";
import { useSearchParams } from "next/navigation";
import { registerWithInvite } from "@/store/slices/auth";

export default function InvitePage() {
  const dispatch = useAppDispatch();
  const { loading: accepting, error } = useAppSelector((state: RootState) => state.auth);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState<boolean | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useAuthRedirect("/dashboard", "Account created successfully");

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordMatch(password === confirmPassword);
    } else {
      setPasswordMatch(null);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    setPasswordStrength(strength);
  }, [password]);

  async function onSubmit() {
    if (!fullName || !password || !token) {
      enqueueSnackbar("Please fill all fields.", { variant: "warning" });
      return;
    }
    if (password !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", { variant: "error" });
      return;
    }

    try {
      const resultAction = await dispatch(
        registerWithInvite({
          token,
          name: fullName,
          password,
        })
      );

      if (!registerWithInvite.fulfilled.match(resultAction)) {
        enqueueSnackbar(error || "Invite could not be accepted.", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-500 text-white p-12">
        <h1 className="text-5xl font-bold mb-6">Welcome to MedAtlas</h1>
        <p className="text-xl font-light mb-10 max-w-md text-center">
          Complete your registration using the invitation link sent to your email.
        </p>
      </div>
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Complete Your Registration</CardTitle>
            <CardDescription>Accept your invitation to MedAtlas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full p-3 border border-gray-300 rounded-lg bg-background focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:outline-none transition-colors"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-background pr-10 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${i <= passwordStrength
                            ? passwordStrength === 1 ? 'bg-red-500' :
                              passwordStrength === 2 ? 'bg-orange-500' :
                                passwordStrength === 3 ? 'bg-yellow-500' : 'bg-green-500'
                            : 'bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {passwordStrength === 0 ? 'Enter a password' :
                      passwordStrength === 1 ? 'Weak password' :
                        passwordStrength === 2 ? 'Fair password' :
                          passwordStrength === 3 ? 'Good password' : 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className={`w-full p-3 border rounded-lg bg-background pr-10 focus:ring-2 focus:outline-none transition-colors
                    ${passwordMatch === false ? 'border-red-500 focus:ring-red-200' :
                      passwordMatch === true ? 'border-green-500 focus:ring-green-200' :
                        'border-gray-300 focus:ring-blue-200 focus:border-blue-400'}`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {confirmPassword.length > 0 && (
                <p className={`text-sm ${passwordMatch ? 'text-green-600' : 'text-red-600'}`}>
                  {passwordMatch ? 'Passwords match!' : 'Passwords do not match'}
                </p>
              )}
            </div>

            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md"
              onClick={onSubmit}
              disabled={accepting || !token}
            >
              {accepting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : "Complete Registration"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}