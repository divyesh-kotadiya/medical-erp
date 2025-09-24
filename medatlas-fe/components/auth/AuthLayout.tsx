'use client';

import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  subtitle: string;
  features?: Array<{
    icon: ReactNode;
    title: string;
    description: string;
  }>;
}

export function AuthLayout({ children, subtitle, features }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-hero text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 animate-pulse" />
        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 border-4 border-white rounded-full transform -translate-x-12 -translate-y-12" />
          <div className="absolute bottom-0 right-0 w-48 h-48 border-4 border-white rounded-full transform translate-x-16 translate-y-16" />
          <div className="absolute top-1/2 left-1/4 w-24 h-24 border-4 border-white transform rotate-45" />
        </div>

        <div className="absolute inset-0 bg-black/20" />

        <div className="relative z-10 text-center max-w-2xl">
          <div className="mb-8">
            <div className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-elevated mx-auto border border-white/20 animate-pulse">
              <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-card">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-accent/30">
            MedAtlas
          </h1>

          <p className="text-xl font-light mb-10 leading-7 max-w-md mx-auto text-center text-white/90">
            {subtitle}
          </p>

          {features && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 text-white/80 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-3">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      <div className="absolute top-1/4 left-1/4 w-4 h-4 rounded-full bg-white/30 animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-6 h-6 rounded-full bg-white/20 animate-pulse delay-300" />
        <div className="absolute top-1/3 right-1/4 w-3 h-3 rounded-full bg-white/40 animate-pulse delay-700" />
      </div>

      <div className="flex items-center justify-center p-6 bg-gradient-to-br from-background to-muted/30">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
