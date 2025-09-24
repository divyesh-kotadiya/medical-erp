'use client'
import ChangePasswordModal from "@/components/change-password";
import { useState } from "react";

export default function AccountSettings() {
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

      <div className="space-y-6">
        <div className="p-4 border border-border rounded-md">
          <h3 className="font-medium mb-2">Change Password</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Update your password associated with your account.
          </p>

          <button 
            onClick={() => setIsChangePasswordModalOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
          >
            Change Password
          </button>
        </div>

        <div className="p-4 border border-destructive rounded-md">
          <h3 className="font-medium mb-2 text-destructive">Danger Zone</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="bg-destructive text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium">
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