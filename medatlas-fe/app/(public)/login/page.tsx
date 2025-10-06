'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { login } from '@/store/slices/auth';
import { Shield, Users } from 'lucide-react';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import { enqueueSnackbar } from 'notistack';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink } from '@/components/auth/AuthLink';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  useAuthRedirect();

  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {
      email: '',
      password: '',
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
        Object.values(newErrors).every((error) => error === ''),
    );
  }, [email, password]);

  useEffect(() => {
    router.prefetch('/verify-otp');
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      if (!email) {
        enqueueSnackbar('Please enter your email', { variant: 'warning' });
      } else if (!password) {
        enqueueSnackbar('Please enter your password', { variant: 'warning' });
      }
      return;
    }

    try {
      const resultAction = await dispatch(login({ email, password }));

      if (login.fulfilled.match(resultAction)) {
        router.push('/verify-otp');
        enqueueSnackbar('Please verify the OTP sent to your email', { variant: 'info' });
      } else {
        const errorMessage =
          (resultAction?.payload as { message?: string })?.message || 'Login failed';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong.';
      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-accent" />,
      title: 'Secure Access',
      description: 'Multi-factor authentication and encrypted connections',
    },
    {
      icon: <Users className="h-6 w-6 text-accent" />,
      title: 'Role-Based Access',
      description: 'Custom permissions tailored to user responsibilities',
    },
  ];

  return (
    <AuthLayout
      subtitle="Your unified platform for managing healthcare organizations, tenants, and user access seamlessly."
      features={features}
    >
      <AuthCard
        title="Welcome to MedAtlas"
        description="Sign in to your account"
        icon={<Shield className="h-6 w-6 text-white" />}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <AuthInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <AuthInput
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            isPassword
          />

          <AuthButton type="submit" loading={loading} disabled={!isFormValid}>
            Sign In
          </AuthButton>
        </form>

        <div className="text-right text-sm">
          <AuthLink href="/forgot-password">Forgot password?</AuthLink>
        </div>

        <div className="text-center text-sm text-muted-foreground pt-2">
          Don&apos;t have an account? <AuthLink href="/register">Sign up</AuthLink>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}