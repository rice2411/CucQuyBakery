import React from 'react';
import { Settings } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
      <Settings className="w-16 h-16 mb-4 opacity-20" />
      <h2 className="text-xl font-semibold mb-2">System Settings</h2>
      <p>Coming Soon</p>
    </div>
  );
};

export default SettingsPage;