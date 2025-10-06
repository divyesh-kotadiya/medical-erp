'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { forgotPassword } from '@/store/slices/auth';
import { Shield, Mail, Lock } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink } from '@/components/auth/AuthLink';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
  });

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {
      email: '',
    };

    if (email && !emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    setIsFormValid(
      email.length > 0 &&
        emailRegex.test(email) &&
        Object.values(newErrors).every((error) => error === ''),
    );
  }, [email]);

  async function onSubmit() {
    if (!email) {
      enqueueSnackbar('Please enter your email.', { variant: 'warning' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      enqueueSnackbar('Please enter a valid email address.', { variant: 'warning' });
      return;
    }

    try {
      const resultAction = await dispatch(forgotPassword(email));

      if (forgotPassword.fulfilled.match(resultAction)) {
        enqueueSnackbar('Password reset OTP sent to your email.', { variant: 'success' });
        router.push('/reset-password');
      } else if (forgotPassword.rejected.match(resultAction)) {
        const errorMessage =
          (resultAction?.payload as { message?: string })?.message ||
          'Failed to send reset email. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  }

  const features = [
    {
      icon: <Mail className="h-6 w-6 text-accent" />,
      title: 'Email Recovery',
      description: 'Secure password reset link sent to your email',
    },
    {
      icon: <Lock className="h-6 w-6 text-accent" />,
      title: 'Secure Process',
      description: 'One-time secure password reset process',
    },
  ];

  return (
    <AuthLayout
      subtitle="Reset your password and regain secure access to your MedAtlas account."
      features={features}
    >
      <AuthCard
        title="Forgot Password"
        description="Enter your email to reset your password"
        icon={<Shield className="h-6 w-6 text-white" />}
      >
        <div className="space-y-6">
          <AuthInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <AuthButton onClick={onSubmit} loading={loading} disabled={!isFormValid}>
            Send OTP
          </AuthButton>

          <div className="text-center text-sm text-muted-foreground">
            Remembered your password? <AuthLink href="/login">Sign in</AuthLink>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
