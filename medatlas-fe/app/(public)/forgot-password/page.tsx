"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { forgotPassword } from '@/store/slices/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({
    email: ''
  });
  
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let newErrors = {
      email: ''
    };

    if (email && !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    setIsFormValid(
      email.length > 0 && 
      emailRegex.test(email) &&
      Object.values(newErrors).every(error => error === '')
    );
  }, [email]);

  async function onSubmit() {
    if (!email) {
      enqueueSnackbar("Please enter your email.", { variant: "warning" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      enqueueSnackbar("Please enter a valid email address.", { variant: "warning" });
      return;
    }

    try {
      const resultAction = await dispatch(forgotPassword(email));
      
      if (forgotPassword.fulfilled.match(resultAction)) {
        enqueueSnackbar("Password reset link sent to your email.", { variant: "success" });
      } else if (forgotPassword.rejected.match(resultAction)) {
        const errorMessage = resultAction?.payload || "Failed to send reset email. Please try again.";
        enqueueSnackbar(errorMessage?.message as string, { variant: "error" });
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || "Something went wrong", { variant: "error" });
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Email Recovery</h3>
              <p className="text-sm">Secure password reset link sent to your email</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-blue-400/20 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Secure Process</h3>
              <p className="text-sm">One-time secure password reset process</p>
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
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>Enter your email to reset your password</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 border border-gray-300 rounded-lg bg-background focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-3 rounded-lg transition-all duration-200 transform shadow-md disabled:opacity-70 disabled:cursor-not-allowed" 
              onClick={onSubmit}
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : 'Send Reset Link'}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground pt-2">
              Remembered your password?{' '}
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