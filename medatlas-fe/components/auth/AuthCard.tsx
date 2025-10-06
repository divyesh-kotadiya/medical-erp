'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface AuthCardProps {
  children: ReactNode;
  title: string;
  description: string;
  icon?: ReactNode;
}

export function AuthCard({ children, title, description, icon }: AuthCardProps) {
  return (
    <Card className="w-full shadow-elevated border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto mb-4 h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center shadow-card">
          {icon || <Shield className="h-6 w-6 text-white" />}
        </div>
        <CardTitle className="text-2xl font-bold text-card-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
}
