'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserPlus } from 'lucide-react';
import { UserRole } from '@/constants/UserRole/role';
import CustomDropdown from '../Dropdown/Dropdown';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { enqueueSnackbar } from 'notistack';
import { inviteMember } from '@/store/slices/invite';
import Loader from '@/components/Loading';

const inviteSchema = z.object({
  email: z.string().email('Invalid email'),
  role: z.nativeEnum(UserRole),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export default function InviteStaffDialog() {
  const { loading } = useAppSelector((state) => state.invite);
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const [roleOpen, setRoleOpen] = useState(false);
  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: InviteFormValues) => {
    try {
      const resultAction = await dispatch(
        inviteMember({
          ...data
        })
      );

      if (inviteMember.fulfilled.match(resultAction)) {
        enqueueSnackbar(resultAction.payload.message || "Invite sent successfully!", {
          variant: "success",
        });
        setOpen(false);
        reset();
      } else if (inviteMember.rejected.match(resultAction)) {
        const errorMessage = (resultAction.payload as { message?: string })?.message || "Something went wrong";
        enqueueSnackbar(errorMessage, {
          variant: "error",
        });
      }
    } catch {
      enqueueSnackbar("Something went wrong", { variant: "error" });
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-primary-foreground bg-gradient-primary shadow-card hover:opacity-90 transition"
      >
        <UserPlus className="h-4 w-4" />
        Invite Staff
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-elevated border border-border">
            <h2 className="text-lg font-semibold text-foreground">Invite Member</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Send an invitation email to a new member.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  {...register('email')}
                  placeholder="member@example.com"
                  className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="relative">
                <CustomDropdown
                  label="Role"
                  options={Object.values(UserRole).map((role) => ({
                    label: role,
                    value: role,
                  }))}
                  value={selectedRole}
                  onChange={(val) => setValue('role', val as UserRole)}
                  error={errors.role?.message}
                />
                {roleOpen && (
                  <ul className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-card shadow-md">
                    {Object.values(UserRole).map((role) => (
                      <li
                        key={role}
                        onClick={() => {
                          setValue('role', role as UserRole);
                          setRoleOpen(false);
                        }}
                        className={`cursor-pointer px-3 py-2 text-sm hover:bg-primary/10 ${selectedRole === role ? 'bg-primary/10 font-medium text-primary' : 'text-foreground'
                          }`}
                      >
                        {role}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                  className="rounded-lg border border-border w-20 px-4 py-2 text-sm hover:bg-muted text-foreground"
                >
                  Cancel
                </button>

                <button
                  disabled={loading}
                  type="submit"
                  className="rounded-lg bg-gradient-primary w-20 px-4 py-2 flex justify-center text-sm text-primary-foreground shadow-card hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader /> : 'Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}