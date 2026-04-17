import React from 'react';
import { DashboardView } from './DashboardView';
import { useDashboard } from './useDashboard';
import { useDarkMode } from '@/shared/contexts/DarkModeContext';

export default function Dashboard() {
  const logic = useDashboard();
  const { darkMode } = useDarkMode();
  return <DashboardView {...logic} darkMode={darkMode} />;
}
