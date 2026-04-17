import React from 'react';
import { SettingsPageView } from './SettingsPageView';
import { useSettingsPage } from './useSettingsPage';

export default function SettingsPage() {
  const logic = useSettingsPage();
  return <SettingsPageView {...logic} />;
}
