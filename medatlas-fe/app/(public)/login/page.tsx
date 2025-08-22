'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, selectAuth } from '@/store/slices/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { enqueueSnackbar } from 'notistack';
import Loader from '@/components/loader';
export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector(selectAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  useAuthRedirect();

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let newErrors = {
      email: '',
      password: ''
    };

    if (email && !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (password && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    setIsFormValid(
      email.length > 0 &&
      password.length >= 6 &&
      emailRegex.test(email) &&
      Object.values(newErrors).every(error => error === '')
    );
  }, [email, password]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      if (!email) {
        enqueueSnackbar("Please enter your email", { variant: "warning" });
      } else if (!password) {
        enqueueSnackbar("Please enter your password", { variant: "warning" });
      }
      return;
    }

    try {
      const resultAction = await dispatch(login({ email, password }));

      if (login.rejected.match(resultAction)) {
        const errorMessage = resultAction?.payload?.message;
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (err: any) {
      enqueueSnackbar(err.message || "Something went wrong.", { variant: "error" });
    }
  };

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
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
            MedAtlas
          </h1>

          <p className="text-xl font-light mb-10 leading-7 max-w-md mx-auto text-center text-white/90">
            Your unified platform for managing healthcare organizations, tenants, and user access seamlessly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-white/80 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-400/20 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Secure Access</h3>
              <p className="text-sm">Multi-factor authentication and encrypted connections</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-blue-400/20 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">Role-Based Access</h3>
              <p className="text-sm">Custom permissions tailored to user responsibilities</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-400/20 flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-1">HIPAA Compliant</h3>
              <p className="text-sm">Full compliance with healthcare data protection standards</p>
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
            <CardTitle className="text-2xl">Welcome to MedAtlas</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-3 rounded-lg transition-all duration-200 transform shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading || !isFormValid}
              >
                {loading ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Loader />
                    Signing In...
                  </div>
                ) : 'Sign In'}
              </Button>
            </form>

            <div className="text-right text-sm">
              <Link href="/forgot-password" className="text-blue-500 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-500 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}