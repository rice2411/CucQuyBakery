import React from 'react';
import { Package } from 'lucide-react';

const InventoryPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
      <Package className="w-16 h-16 mb-4 opacity-20" />
      <h2 className="text-xl font-semibold mb-2">Inventory Management</h2>
      <p>Coming Soon</p>
    </div>
  );
};

export default InventoryPage;