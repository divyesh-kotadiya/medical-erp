'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TextAreaField from '@/components/layout/Fields/TextAreaField';
import CustomDropdown from '@/components/layout/Dropdown/Dropdown';
import InputField from '@/components/layout/Fields/InputField';
import Button from '@/components/layout/Button/Button';
import Checkbox from '@/components/layout/Fields/CheckboxGroup';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createIncident } from '@/store/slices/incidents';
import { IncidentType } from '@/constants/Incidents';
import Loading from '@/app/loading';

const PHI_OPTIONS = [
  { id: 'name', label: 'Name' },
  { id: 'dob', label: 'DOB' },
  { id: 'ssn', label: 'SSN' },
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'financial', label: 'Financial' },
  { id: 'images', label: 'Images' },
];

const INCIDENT_OPTIONS = [
  { label: 'Unauthorized Access', value: IncidentType.UNAUTHORIZED_ACCESS },
  { label: 'Data Breach', value: IncidentType.DATA_LOSS },
  { label: 'Improper Disposal', value: IncidentType.IMPROPER_DISCLOSURE },
  { label: 'Other', value: IncidentType.OTHER },
];

const schema = z.object({
  tenantId: z.string().min(1, 'tenantId required'),
  reportedBy: z.string().min(1, 'User id required'),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  incidentType: z.string().min(1, 'Please select an incident type'),
  individualsAffected: z.string().refine((val) => Number(val) >= 0, 'Must be 0 or greater'),
  occurrenceDate: z.string().min(1, 'Occurrence date is required'),
  discoveryDate: z.string().min(1, 'Discovery date is required'),
  phiDataTypes: z.array(z.string()).min(1, 'Select at least one PHI type'),
});

type FormData = z.infer<typeof schema>;

export default function IncidentReportForm() {
  const dispatch = useAppDispatch();
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAppSelector((s) => s.auth);
  const { currentOrganization } = useAppSelector((state) => state.organizations);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      tenantId: '',
      reportedBy: '',
      title: '',
      description: '',
      incidentType: '',
      phiDataTypes: [],
      individualsAffected: '0',
      occurrenceDate: '',
      discoveryDate: '',
    },
  });

  React.useEffect(() => {
    if (currentOrganization?.id) {
      setValue('tenantId', currentOrganization.id);
    }
  }, [currentOrganization?.id, setValue]);

  React.useEffect(() => {
    if (user?.id) {
      setValue('reportedBy', user.id);
    }
  }, [user?.id, setValue]);

  useEffect(() => {
    if (currentOrganization?.id) {
      setValue('tenantId', currentOrganization.id);
    }
  }, [currentOrganization?.id, setValue]);

  useEffect(() => {
    if (user?.id) {
      setValue('reportedBy', user.id);
    }
  }, [user?.id, setValue]);

  const phiDataTypes = watch('phiDataTypes');
  const router = useRouter();

  const togglePhiDataType = (id: string) => {
    const updated = phiDataTypes.includes(id)
      ? phiDataTypes.filter((t) => t !== id)
      : [...phiDataTypes, id];
    setValue('phiDataTypes', updated, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    try {
      setGlobalError(null);
      setSubmitted(false);

      await dispatch(createIncident(data)).unwrap();
      
      setSubmitted(true);
      
      setTimeout(() => {
        router.replace('/incidents');
      }, 1500);
    } catch (err: any) {
      setGlobalError(err?.message || 'Failed to create incident. Please try again.');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    handleSubmit(onSubmit)(e);
  };

  return (
    <div className="min-h-screen max-w-8xl shadow-inner rounded-sm m-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Report Security Incident</h1>
          <p className="text-muted-foreground mt-2">
            Submit details about potential PHI exposure or a security breach
          </p>
        </div>

        {globalError && (
          <div className="bg-destructive/10 border-l-4 border-destructive p-4 rounded-lg shadow-sm">
            <p className="text-sm text-destructive">{globalError}</p>
          </div>
        )}

        {submitted && (
          <div className="bg-success/10 border-l-4 border-success p-4 rounded-lg shadow-sm flex items-center gap-2">
            <Check className="h-4 w-4 text-success" />
            <p className="text-sm text-success">Incident submitted successfully!</p>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 rounded-xl bg-card">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-lg font-medium text-foreground">Incident Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Incident Title"
                {...register('title')}
                placeholder="Brief summary"
                error={errors.title?.message}
              />

              <CustomDropdown
                label="Incident Type"
                options={INCIDENT_OPTIONS}
                value={watch('incidentType')}
                onChange={(val) => {
                  console.log('🔄 Incident type changed to:', val);
                  setValue('incidentType', val, { shouldValidate: true });
                }}
                placeholder="Select incident type"
                error={errors.incidentType?.message}
                buttonClassName={`py-3.5 mt-2 ${errors.incidentType && 'border-destructive'}`}
              />

              <div className="md:col-span-2">
                <TextAreaField
                  label="Detailed Description"
                  {...register('description')}
                  placeholder="Provide a detailed description..."
                  rows={4}
                  error={errors.description?.message}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-lg font-medium text-foreground">Impact & Timeline</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputField
                label="Individuals Affected"
                type="number"
                {...register('individualsAffected')}
                placeholder="0"
                error={errors.individualsAffected?.message}
              />

              <InputField
                label="Occurrence Date"
                type="datetime-local"
                {...register('occurrenceDate')}
                error={errors.occurrenceDate?.message}
              />

              <InputField
                label="Discovery Date"
                type="datetime-local"
                {...register('discoveryDate')}
                error={errors.discoveryDate?.message}
              />
            </div>
          </div>

          <div
            className={`bg-card rounded-xl border border-border p-6 space-y-6 ${errors.phiDataTypes && 'border-destructive'}`}
          >
            <label className="text-lg font-medium text-foreground">Select PHI Types</label>
            {errors.phiDataTypes?.message && (
              <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                <TriangleAlert className="h-4 w-4" /> {errors.phiDataTypes.message}
              </p>
            )}
            <div className="grid grid-cols-3 gap-3">
              {PHI_OPTIONS.map(({ id, label }) => (
                <Checkbox
                  key={id}
                  label={label}
                  checked={phiDataTypes.includes(id)}
                  onChange={() => togglePhiDataType(id)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <span>Errors: {Object.keys(errors).length}</span>
              <span>|</span>
              <span>Submitting: {isSubmitting ? 'Yes' : 'No'}</span>
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loading /> : 'Submit Incident Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}