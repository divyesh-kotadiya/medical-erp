'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  Clock,
  BarChart3,
  Calendar,
  FileText,
  ArrowRight,
  Star
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'HIPAA-compliant infrastructure ensuring your medical data stays protected.'
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Efficiently manage your healthcare team with role-based access controls.'
  },
  {
    icon: Calendar,
    title: 'Smart Scheduling',
    description: 'Automated scheduling system that optimizes staff allocation and patient care.'
  },
  {
    icon: Clock,
    title: 'Time Tracking',
    description: 'Comprehensive timesheet management for accurate payroll and compliance.'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Real-time insights and detailed reports to improve operational efficiency.'
  },
  {
    icon: FileText,
    title: 'Document Management',
    description: 'Centralized document storage with version control and secure sharing.'
  }
];

const testimonials = [
  {
    name: 'Dr. Michael Chen',
    role: 'Chief Medical Officer',
    hospital: 'Metropolitan General',
    content: 'MedAtlas transformed our workflow efficiency by 40%. The intuitive interface makes staff management effortless.',
    rating: 5
  },
  {
    name: 'Sarah Williams',
    role: 'Nursing Director',
    hospital: 'City Medical Center',
    content: 'Finally, a healthcare management system that actually understands our needs. Scheduling has never been easier.',
    rating: 5
  }
];

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">MedAtlas</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="secondary">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 bg-white/20 text-white border-white/30 hover:bg-white/30">
                Trusted by 500+ Healthcare Facilities
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Streamline Your
                <span className="block bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                  Healthcare Operations
                </span>
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-2xl">
                The all-in-one platform for healthcare management. Schedule staff, track time, manage incidents, and generate insights—all in one secure, HIPAA-compliant system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg"  className="border-white text-white hover:bg-white/10">
                  Watch Demo
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-elevated bg-white/10 backdrop-blur-sm p-8">
                <div className="text-center text-white">
                  <Shield className="h-24 w-24 mx-auto mb-4 opacity-80" />
                  <h3 className="text-2xl font-bold mb-2">MedAtlas Dashboard</h3>
                  <p className="text-white/80">Comprehensive healthcare management platform</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-green-400/20 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Features</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Everything you need to manage healthcare operations
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From staff scheduling to incident tracking, MedAtlas provides comprehensive tools designed specifically for healthcare environments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-elevated transition-all duration-300 border-border/50">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="h-12 w-12 bg-gradient-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Trusted by healthcare professionals
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card shadow-card">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 italic">&ldquo;{testimonial.content}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.hospital}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to transform your healthcare operations?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of healthcare facilities already using MedAtlas to improve efficiency and patient care.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" className="border-white text-white bg-white/10 hover:bg-white/10">
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">MedAtlas</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 MedAtlas. All rights reserved. HIPAA Compliant.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
