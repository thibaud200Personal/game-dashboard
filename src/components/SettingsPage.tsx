import React from 'react';
import { SettingsPageView } from '@/views/SettingsPageView';
import { useSettingsPage } from '@/hooks/useSettingsPage';

export default function SettingsPage() {
  const logic = useSettingsPage();
  return <SettingsPageView {...logic} />;
}
