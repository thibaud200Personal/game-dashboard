import React from 'react';
import { DashboardView } from '@/views/DashboardView';
import { useDashboard } from '@/hooks/useDashboard';

export default function Dashboard() {
  const logic = useDashboard();
  return <DashboardView {...logic} darkMode={true} />;
}
