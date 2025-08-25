'use client'
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import AccountSettings from "@/components/dashboard/settings/AccountSettings";
import UserProfile from "@/components/dashboard/settings/UserProfile";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        
        <div className="flex border-b border-border mb-6">
          <button
            className={`py-3 px-6 font-medium ${activeTab === "profile" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={`py-3 px-6 font-medium ${activeTab === "account" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            onClick={() => setActiveTab("account")}
          >
            Account Settings
          </button>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-8">
          {activeTab === "profile" ? <UserProfile /> : <AccountSettings />}
        </div>
      </div>
    </DashboardLayout>
  );
}
