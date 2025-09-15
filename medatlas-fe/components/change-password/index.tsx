'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Eye, EyeOff, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { enqueueSnackbar } from 'notistack';
import { useAppDispatch } from '@/store/hooks';
import { changePassword } from '@/store/slices/auth';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const dispatch = useAppDispatch();
  const [password, setPassword] = useState("");
  const [CurrentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
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
      CurrentPassword.length > 0
    );
  }, [password, CurrentPassword]);

  async function onSubmit() {
    if (!password || !CurrentPassword) {
      enqueueSnackbar("Please fill in all fields.", { variant: "warning" });
      return;
    }

    if (password.length < 8) {
      enqueueSnackbar("Password must be at least 8 characters.", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(
        changePassword({ currentPassword: CurrentPassword, newPassword: password })
      );
      if (changePassword.fulfilled.match(resultAction)) {
        enqueueSnackbar("Password reset successfully.", { variant: "success" });
        onClose();
      } else {
        const errorMessage = (resultAction?.payload as { message?: string })?.message || "Failed to reset password";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Something went wrong";
      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  // Close modal when clicking outside
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 animate-in fade-in-90 zoom-in-90">
        <div className="bg-gray-50 px-4  border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1.5 items-center py-2 ">
              <div className="w-4 h-4 rounded-full bg-red-400 flex justify-center items-center"   onClick={onClose}>
                  <X size={10} className='text-red-700 hover:text-white' />
              </div>
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <div className="w-4 h-4 rounded-full bg-green-400"></div>
            </div>
            <span className="text-sm font-medium py-2 px-4 text-gray-700 bg-gray-200">Change Password</span>
          </div>
        </div>

        <div className="p-6">
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="mx-auto mb-2 h-16 w-16 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Reset Password
              </CardTitle>
              <CardDescription className="text-base">
                Set a new secure password for your MedAtlas account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your current password"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white pr-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
                    value={CurrentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a new password"
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white pr-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-colors"
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
                          className={`h-1.5 flex-1 rounded-full ${i <= passwordStrength
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

              <div className="pt-2">
                <Button
                  className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-md"
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}