import React from 'react';
import { DashboardView } from './DashboardView';
import { useDashboard } from './useDashboard';

export default function Dashboard() {
  const logic = useDashboard();
  return <DashboardView {...logic} />;
}
