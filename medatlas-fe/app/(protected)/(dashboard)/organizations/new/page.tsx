'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createOrganization, fetchOrganizations } from '@/store/slices/organizations';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { enqueueSnackbar } from 'notistack';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Building2, ChevronLeft, ChevronRight, Check, Plus, Users } from 'lucide-react';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import CustomDropdown from '@/components/layout/Dropdown/Dropdown';
import InputField from '@/components/layout/Fields/InputField';

export enum TenantType {
  HOSPITAL = 'hospital',
  CLINIC = 'clinic',
  PHARMACY = 'pharmacy',
  LABORATORY = 'laboratory',
  OTHER = 'other',
}

const organizationTypes = [
  { value: TenantType.HOSPITAL, label: 'Hospital', icon: '🏥' },
  { value: TenantType.CLINIC, label: 'Clinic', icon: '🏥' },
  { value: TenantType.PHARMACY, label: 'Pharmacy', icon: '💊' },
  { value: TenantType.LABORATORY, label: 'Laboratory', icon: '🧪' },
  { value: TenantType.OTHER, label: 'Other', icon: '🏢' },
];

const timezones = Intl.supportedValuesOf('timeZone');
const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];
const dateFormats = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];

const onboardingSchema = z.object({
  name: z.string().min(2, 'Organization name is required'),
  description: z.string().min(5, 'Description should be at least 5 characters'),
  type: z.nativeEnum(TenantType),

  email: z.string().email('Invalid email'),
  phone: z.string().min(7, 'Phone number is required'),
  website: z.string().url('Invalid URL').optional(),

  street: z.string().min(2, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  zipCode: z.string().min(3, 'Zip Code is required'),
  country: z.string().min(2, 'Country is required'),

  timezone: z.string().nonempty('Timezone is required'),
  currency: z.string().min(3, 'Currency is required'),
  dateFormat: z.string().min(3, 'Date format is required'),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

const Onboarding = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const {loading, creating, loaded } = useAppSelector(
    (state) => state.organizations
  );

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const [actionType, setActionType] = useState<'create' | 'join'>('create');

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    formState: { errors },
    reset,
  } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      description: '',
      type: TenantType.HOSPITAL,
      email: '',
      phone: '',
      website: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
    },
  });


  useEffect(() => {
    if (!loaded) {
      dispatch(fetchOrganizations());
    }
  }, [dispatch, loaded]);

  const onSubmit = async (formData: OnboardingForm) => {
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        contact: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
        },
        settings: {
          timezone: formData.timezone,
          currency: formData.currency,
          dateFormat: formData.dateFormat,
        },
      };

      await dispatch(createOrganization(payload)).unwrap();
      enqueueSnackbar('Organization created successfully!', { variant: 'success' });
      router.push('/dashboard');
    } catch {
      enqueueSnackbar('Failed to create organization', { variant: 'error' });
    }
  };

  const handleNext = async () => {
    // For step 0, just move to the next step
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    let fieldsToValidate: (keyof OnboardingForm)[] = [];

    if (currentStep === 1) fieldsToValidate = ['name', 'description', 'type'];
    if (currentStep === 2)
      fieldsToValidate = ['email', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
    if (currentStep === 3)
      fieldsToValidate = ['timezone', 'currency', 'dateFormat'];

    const valid = await trigger(fieldsToValidate);

    if (valid) {
      if (currentStep < totalSteps - 1) setCurrentStep((s) => s + 1);
      else handleSubmit(onSubmit)();
    } else {
      enqueueSnackbar('Please fill all required fields', { variant: 'error' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleActionSelect = (action: 'create' | 'join') => {
    setActionType(action);
    if (action === 'create') {
      setCurrentStep(1);
    } else {
      // Handle join organization logic
      enqueueSnackbar('Join organization feature coming soon!', { variant: 'info' });
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Onboarding
          </CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {totalSteps}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStep === 0 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Welcome to the Platform</h2>
              <p className="text-center text-muted-foreground">
                Get started by creating a new organization or joining an existing one
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleActionSelect('create')}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg">Create Organization</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Set up a new organization from scratch
                    </p>
                  </CardContent>
                </Card>
                
                <Card 
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleActionSelect('join')}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-medium text-lg">Join Organization</h3>
                    <p className="text-sm text-center text-muted-foreground">
                      Join an existing organization with an invitation code
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <InputField label="Organization Name" {...register('name')} error={errors.name?.message} />
              <InputField label="Description" {...register('description')} error={errors.description?.message} />

              <CustomDropdown
                label="Organization Type"
                options={organizationTypes.map((type) => ({ label: type.label, value: type.value }))}
                value={getValues('type')}
                onChange={(val) => setValue('type', val, { shouldValidate: true })}
                error={errors.type?.message}
                placeholder="Select organization type"
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <InputField label="Email" {...register('email')} error={errors.email?.message} />
              <InputField label="Phone" {...register('phone')} error={errors.phone?.message} />
              <InputField label="Website" {...register('website')} error={errors.website?.message} />
              <InputField label="Street" {...register('street')} error={errors.street?.message} />

              <div className="grid grid-cols-2 gap-2">
                <InputField label="City" {...register('city')} error={errors.city?.message} />
                <InputField label="State" {...register('state')} error={errors.state?.message} />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <InputField label="Zip Code" {...register('zipCode')} error={errors.zipCode?.message} />
                <InputField label="Country" {...register('country')} error={errors.country?.message} />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <CustomDropdown
                label="Timezone"
                options={timezones.map((tz) => ({ label: tz, value: tz }))}
                value={getValues('timezone')}
                onChange={(val) => setValue('timezone', val, { shouldValidate: true })}
                error={errors.timezone?.message}
                placeholder="Select timezone"
              />

              <CustomDropdown
                label="Currency"
                options={currencies.map((cur) => ({ label: cur, value: cur }))}
                value={getValues('currency')}
                onChange={(val) => setValue('currency', val, { shouldValidate: true })}
                error={errors.currency?.message}
                placeholder="Select currency"
              />

              <CustomDropdown
                label="Date Format"
                options={dateFormats.map((fmt) => ({ label: fmt, value: fmt }))}
                value={getValues('dateFormat')}
                onChange={(val) => setValue('dateFormat', val, { shouldValidate: true })}
                error={errors.dateFormat?.message}
                placeholder="Select date format"
              />
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={handlePrev} 
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button onClick={handleNext} disabled={creating}>
              {currentStep === totalSteps - 1 ? (
                <>
                  Create <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;