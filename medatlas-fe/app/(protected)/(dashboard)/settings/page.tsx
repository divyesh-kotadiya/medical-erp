'use client';

import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { useSnackbar } from 'notistack';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { fetchMe, updateProfile } from '@/store/slices/auth';

export default function UserProfile() {
  const { user } = useAppSelector((state) => state.auth);
  const { organizations, loading } = useAppSelector((state) => state.organizations);
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    role: user?.role || '',
    avatar: user?.avatar || '',
  });

  const computeAvatarUrl = (raw: string): string | undefined => {
    if (!raw || !raw.trim()) return undefined;
    const trimmed = raw.trim();
    if (trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    if (trimmed.startsWith('/')) {
      const base = process.env.NEXT_PUBLIC_IMAGE_API_BASE_URL || '';
      if (!base) return trimmed;
      return `${base.replace(/\/$/, '')}${trimmed}`;
    }
    return trimmed;
  };

  const avatarUrl = computeAvatarUrl(profileData.avatar);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [updating, setUpdating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfileData((prev) => ({ ...prev, avatar: previewUrl }));
    setSelectedFile(file);
  };

  const handleRemoveAvatar = () => {
    setProfileData((prev) => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Fucation call workring")
    setUpdating(true);
    try {
      const res = await dispatch(
        updateProfile({
          name: profileData.name,
          phone: profileData.phone,
          avatar: selectedFile,
        }),
      ).unwrap();
      enqueueSnackbar(res?.message || 'Profile updated successfully', { variant: 'success' });
    } catch (err: any) {
      const msg =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message?: string }).message || 'Update failed'
          : 'Update failed';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const getInitials = (fullName: string) => {
    const parts = (fullName || '').trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return (first + last).toUpperCase();
  };

  const isAdminOfOrg = async (orgId: string): boolean => {
    const org = await organizations.find((o) => o.id === orgId);

    if (!org) return false;

    return org.role === 'ADMIN';
  };

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-6">Profile Information</h2>

        <div className="flex flex-col md:flex-row items-center mb-8 gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shadow-md ring-4 ring-white dark:ring-gray-800 bg-gradient-to-br from-blue-100 to-purple-100">
              {avatarUrl == undefined ? (
                <div
                  className="w-full h-full flex items-center justify-center text-4xl font-bold text-blue-700 select-none"
                  aria-label={profileData.name || 'User'}
                  title={profileData.name || 'User'}
                >
                  {getInitials(profileData.name || 'User')}
                </div>
              ) : (
                <Image
                  width={100}
                  height={100}
                  unoptimized
                  priority
                  src={avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer bg-black/40 rounded-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                Upload New Photo
              </button>

              {profileData.avatar && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="flex items-center justify-center gap-2 border border-border hover:bg-muted px-4 py-2.5 rounded-md text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              )}
            </div>

            <p className="text-xs text-muted-foreground max-w-xs">
              Recommended: JPG, PNG or GIF, Max 5MB
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                required
                className="w-full p-3.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                required
                className="w-full p-3.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="block text-sm font-medium">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                className="w-full p-3.5 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end items-center pt-4 border-t border-border">
            <div className="flex gap-3">
              <button
                type="button"
                className="px-5 py-2.5 border border-border rounded-lg font-medium hover:bg-muted transition-colors duration-200"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 shadow-sm ${updating ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary/90'}`}
                disabled={updating}
                aria-busy={updating}
              >
                {updating && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                )}
                <span>{updating ? 'Saving…' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Your Organizations</h2>
          <Button
            onClick={() => router.push('/organizations/new')}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Create New Organization
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading organizations...</div>
        ) : organizations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No organizations yet</h3>
              <p className="text-muted-foreground mb-4 text-center max-w-md">
                You haven't joined any organizations yet. Create a new one to get started.
              </p>
              <Button
                onClick={() => router.push('/onboarding')}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map((org) => (
              <Card key={org.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{org.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{org.type}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {org.description || 'No description available'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {isAdminOfOrg(org.id) ? 'Admin' : 'Member'}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/organizations/${org.id}`)}
                      className="text-xs"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
