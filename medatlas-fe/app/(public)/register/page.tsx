'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register } from '@/store/slices/auth';
import { Shield, UserPlus, Building, CheckCircle } from 'lucide-react';
import { enqueueSnackbar } from 'notistack';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthButton } from '@/components/auth/AuthButton';
import { AuthLink } from '@/components/auth/AuthLink';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {
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
      fullName.length > 0 &&
      email.length > 0 &&
      password.length >= 8 &&
      emailRegex.test(email) &&
      Object.values(newErrors).every(error => error === '')
    );
  }, [fullName, email, password]);

  async function onSubmit() {
    if (!fullName || !email || !password) {
      enqueueSnackbar("Please fill all fields.", { variant: "warning" });
      return;
    }

    try {
      const resultAction = await dispatch(register({
        name: fullName,
        email,
        password
      }));

      if (register.fulfilled.match(resultAction)) {
        enqueueSnackbar("Please Varifiy Otp", { variant: "success" });
        router.push('/verify-otp');
      } else {
        const errorMessage = (resultAction?.payload as { message?: string })?.message || "Registration failed";
        enqueueSnackbar(errorMessage, { variant: "error" });
      }
    } catch {
      enqueueSnackbar("Something went wrong.", { variant: "error" });
    }
  }

  const features = [
    {
      icon: <UserPlus className="h-6 w-6 text-accent" />,
      title: "Easy Setup",
      description: "Quick and secure account creation process"
    },
    {
      icon: <Building className="h-6 w-6 text-accent" />,
      title: "Organization Management",
      description: "Manage your healthcare organization efficiently"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-accent" />,
      title: "HIPAA Compliant",
      description: "Full compliance with healthcare data protection standards"
    }
  ];

  return (
    <AuthLayout
      subtitle="Join thousands of healthcare professionals managing their organizations with MedAtlas."
      features={features}
    >
      <AuthCard
        title="Create MedAtlas Account"
        description="Get started with healthcare management"
        icon={<Shield className="h-6 w-6 text-white" />}
      >
        <div className="space-y-6">
          <AuthInput
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <AuthInput
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <div className="space-y-2">
            <AuthInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              isPassword
            />
            <PasswordStrength password={password} />
          </div>

          <AuthButton
            onClick={onSubmit}
            loading={loading}
            disabled={!isFormValid}
          >
            Create Account
          </AuthButton>

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <AuthLink href="/login">
              Sign in
            </AuthLink>
          </div>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}