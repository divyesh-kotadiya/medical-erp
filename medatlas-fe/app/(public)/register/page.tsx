"use client";
import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTenant } from '@/store/slices/auth';
import type { RootState } from '@/store';
import Link from 'next/link';
import { enqueueSnackbar } from 'notistack';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Loader from '@/components/loader';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { loading: creating, error } = useAppSelector((state: RootState) => state.auth);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  useAuthRedirect("/dashboard", "Account created successfully");

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
  }, [email, password]);

  useEffect(() => {
    setIsFormValid(
      fullName.length > 0 &&
      email.length > 0 &&
      password.length >= 8 &&
      orgName.length > 0
    );
  }, [fullName, email, password, orgName]);

  async function onSubmit() {
    if (!fullName || !email || !password || !orgName) {
      enqueueSnackbar("Please fill all fields.", { variant: "warning" });
      return;
    }

    try {
      const resultAction = await dispatch(
        createTenant({
          organization: orgName,
          email,
          password,
          name: fullName,
        })
      );
      if (!createTenant.fulfilled.match(resultAction)) {
        enqueueSnackbar(error, { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
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
            <CardTitle className="text-2xl">Create MedAtlas Account</CardTitle>
            <CardDescription>Get started with healthcare management</CardDescription>
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
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}

              {/* Password Strength Indicator */}
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
              <label className="text-sm font-medium">Organization</label>
              <input
                type="text"
                placeholder="Enter organization name"
                className="w-full p-3 border border-gray-300 rounded-lg bg-background focus:ring-2 focus:ring-blue-200 focus:border-blue-400 focus:outline-none transition-colors"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-3 rounded-lg transition-all duration-200 transform shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
              onClick={onSubmit}
              disabled={creating || !isFormValid}
            >
              {creating ? (
                <div className="flex items-center gap-2 justify-center">
                  <Loader />
                  Creating Account...
                </div>
              ) : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{' '}
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