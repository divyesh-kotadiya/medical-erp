'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resendOtp, verifyOtp } from '@/store/slices/auth';
import { Shield, Clock, RefreshCw } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthButton } from '@/components/auth/AuthButton';

export default function VerificationPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  const { userIdForOtp } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
    
    setCountdown(30);
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInputChange = (index: number, value: string) => {
    if (error) setError(null);
    
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtp(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.some(digit => !digit)) {
      setError("Please enter all 6 digits");
      return;
    }

    try {
      setLoading(true);
      if (!userIdForOtp) {
        setError("No user ID found for OTP verification");
        return;
      }
      
      const otpString = otp.join('');
      const resultAction = await dispatch(verifyOtp({ userId: userIdForOtp, otp: otpString }));

      if (verifyOtp.fulfilled.match(resultAction)) {
        enqueueSnackbar("Verification successful!", { variant: "success" });
        router.push("/onboarding");
      } else {
        const errorMessage = (resultAction.payload as { message?: string })?.message || "Verification failed";
        setError(errorMessage);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    try {
      setResendLoading(true);
      if (!userIdForOtp) {
        setError("No user ID found for OTP verification");
        return;
      }
      
      const resultAction = await dispatch(resendOtp(userIdForOtp));

      if (resendOtp.fulfilled.match(resultAction)) {
        enqueueSnackbar("OTP resent successfully", { variant: "success" });
        setCountdown(30);
        setOtp(Array(6).fill(''));
        if (inputRefs.current[0]) {
          inputRefs.current[0]?.focus();
        }
      } else {
        const errorMessage = (resultAction.payload as { message?: string })?.message || "Failed to resend OTP";
        setError(errorMessage);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setResendLoading(false);
    }
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-accent" />,
      title: "Secure Verification",
      description: "Two-factor authentication for enhanced security"
    },
    {
      icon: <Clock className="h-6 w-6 text-accent" />,
      title: "Time-Limited",
      description: "OTP expires in 10 minutes for your security"
    }
  ];

  return (
    <AuthLayout
      subtitle="Secure verification to protect your healthcare data and ensure authorized access."
      features={features}
    >
      <AuthCard
        title="Secure Verification"
        description="Enter the 6-digit code sent to your email"
        icon={<Shield className="h-6 w-6 text-white" />}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg text-sm border border-destructive/20">
              {error}
            </div>
          )}
          
          <div className="flex justify-center space-x-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  ref={el => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  maxLength={1}
                  className={`
                    w-12 h-12 text-center text-xl font-semibold border-2 rounded-lg 
                    focus:ring-2 focus:ring-primary/20 focus:border-primary 
                    outline-none transition-medical
                    ${digit ? 'border-primary bg-primary/5' : 'border-input'}
                  `}
                  autoComplete="one-time-code"
                  aria-label={`OTP digit ${index + 1}`}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {digit && (
                    <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <AuthButton
            type="submit"
            loading={loading}
            disabled={otp.some(digit => !digit)}
          >
            Verify Code
          </AuthButton>
          
          <div className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive the code?{' '}
            <button 
              type="button" 
              className={`
                font-medium transition-colors duration-200
                ${countdown > 0 || resendLoading 
                  ? 'text-muted-foreground cursor-not-allowed' 
                  : 'text-primary hover:text-primary-hover underline'
                }
              `}
              onClick={handleResendOtp}
              disabled={countdown > 0 || resendLoading}
            >
              {resendLoading ? (
                <span className="flex items-center justify-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Sending...
                </span>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                "Resend OTP"
              )}
            </button>
          </div>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>For your security, this code will expire in 10 minutes</p>
          </div>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}