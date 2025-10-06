'use client';

import React, { useState, useEffect } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { IncidentStatus, IncidentType } from '@/constants/Incidents';

interface Incident {
  _id: string;
  incidentType: IncidentType;
  status: IncidentStatus;
}

interface Props {
  incidents: Incident[];
}

const STATUS_COLORS: Record<IncidentStatus, string> = {
  OPEN: '#EF4444',
  IN_REVIEW: '#F59E0B',
  IN_PROGRESS: '#3B82F6',
  RESOLVED: '#10B981',
};

const TYPE_COLORS: Record<IncidentType, string> = {
  'Unauthorized Access': '#6366F1',
  'Data Loss': '#EC4899',
  'Improper Disclosure': '#F97316',
  Other: '#8B5CF6',
};

export default function IncidentAnalytics({ incidents }: Props) {
  const [viewMode, setViewMode] = useState<'status' | 'type'>('status');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(darkModeQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handleChange);

    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  const statusCounts = Object.values(IncidentStatus).map((status) => ({
    name: status.replace('_', ' '),
    value: incidents.filter((i) => i.status === status).length,
  }));

  const typeCounts = Object.values(IncidentType).map((type) => ({
    name: type,
    value: incidents.filter((i) => i.incidentType === type).length,
  }));

  const activeData = viewMode === 'status' ? statusCounts : typeCounts;
  const activeColors =
    viewMode === 'status'
      ? Object.values(STATUS_COLORS)
      : Object.values(TYPE_COLORS);

  const chartTextColor = isDarkMode ? '#F8FAFC' : '#0F172A';
  const chartGridColor = isDarkMode ? '#334155' : '#E2E8F0';
  const chartBgColor = isDarkMode ? '#1E293B' : '#FFFFFF';

  return (
    <Card>
      <div className="h-[400px] p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={activeData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={140}
                  label={({ name, percent }) => (
                    <text fill={chartTextColor} fontSize={12}>
                      {`${name}: ${(percent * 100).toFixed(0)}%`}
                    </text>
                  )}
                  labelLine={{ stroke: chartTextColor }}
                >
                  {activeData.map((_, i) => (
                    <Cell key={i} fill={activeColors[i % activeColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartBgColor,
                    borderColor: chartGridColor,
                    color: chartTextColor,
                    borderRadius: '0.5rem',
                  }}
                  itemStyle={{ color: chartTextColor }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-lg p-4 border border-border flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis dataKey="name" stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <YAxis allowDecimals={false} stroke={chartTextColor} tick={{ fill: chartTextColor }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: chartBgColor,
                    borderColor: chartGridColor,
                    color: chartTextColor,
                    borderRadius: '0.5rem',
                  }}
                  itemStyle={{ color: chartTextColor }}
                />
                <Legend wrapperStyle={{ color: chartTextColor }} />
                <Bar dataKey="value">
                  {activeData.map((_, i) => (
                    <Cell key={i} fill={activeColors[i % activeColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </Card>
  );
}