"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { resetPassword } from '@/store/slices/auth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const dispatch = useAppDispatch();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setIsFormValid(
      password.length >= 8 && 
      confirmPassword.length > 0 &&
      password === confirmPassword
    );
  }, [password, confirmPassword]);

  async function onSubmit() {
    if (!password || !confirmPassword) {
      enqueueSnackbar("Please fill in all fields.", { variant: "warning" });
      return;
    }
    
    if (password.length < 8) {
      enqueueSnackbar("Password must be at least 8 characters.", { variant: "warning" });
      return;
    }
    
    if (password !== confirmPassword) {
      enqueueSnackbar("Passwords do not match.", { variant: "error" });
      return;
    }
    
    if (!token) {
      enqueueSnackbar("Invalid or missing reset token.", { variant: "error" });
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(
        resetPassword({ token, newPassword: password })
      );
      if (resetPassword.fulfilled.match(resultAction)) {
        enqueueSnackbar("Password reset successfully.", { variant: "success" });
        router.push("/login");
      } else {
        enqueueSnackbar(resultAction?.payload?.message || "Failed to reset password", { variant: "error" });
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || "Something went wrong", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center 
        bg-gradient-to-br from-blue-500 via-blue-600 to-emerald-500 
        text-white p-12 relative overflow-hidden w-full">

        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-emerald-400/10 animate-pulse" />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-white rounded-full transform -translate-x-12 -translate-y-12"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 border-4 border-white rounded-full transform translate-x-16 translate-y-16"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-white transform rotate-45"></div>
        </div>

        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 text-center max-w-2xl">
          <div className="mb-8">
            <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl mx-auto border border-white/20 animate-pulse">
              <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
            MedAtlas
          </h1>
          
          <p className="text-xl font-light mb-10 leading-7 max-w-md mx-auto text-center text-white/90">
            Reset your password and regain secure access to your MedAtlas account.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-white/80 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-400/20 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Secure Reset</h3>
              <p className="text-sm">One-time secure password reset process</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-blue-400/20 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Strong Passwords</h3>
              <p className="text-sm">Ensure your new password meets security standards</p>
            </div>
          </div>
        </div>

        <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-white/30 animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6 rounded-full bg-white/20 animate-pulse delay-300"></div>
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-white/40 animate-pulse delay-700"></div>
      </div>

      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>Set a new password for your account</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
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
                        className={`h-1 flex-1 rounded-full ${
                          i <= passwordStrength 
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
                  placeholder="Confirm new password"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-background pr-10 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:outline-none transition-colors"
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
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-xs text-red-500">Passwords do not match</p>
              )}
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md disabled:opacity-70 disabled:cursor-not-allowed" 
              onClick={onSubmit} 
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting Password...
                </div>
              ) : 'Reset Password'}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground pt-2">
              Remember your password?{' '}
              <a href="/login" className="text-blue-500 hover:underline font-medium">
                Sign in
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}