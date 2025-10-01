'use client'
import ChangePasswordModal from "@/components/change-password";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function AccountSettings() {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Account Settings</h2>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-4 border border-border rounded-md bg-card">
          <h3 className="font-medium mb-2">Change Password</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Update your password associated with your account.
          </p>

          <button 
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Change Password
          </button>
        </div>

        <div className="p-4 border border-destructive rounded-md bg-destructive/5">
          <h3 className="font-medium mb-2 text-destructive">Danger Zone</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-destructive/90 transition-colors">
            Delete Account
          </button>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen} 
        onClose={() => setIsChangePasswordModalOpen(false)} 
      />
    </div>
  );
}