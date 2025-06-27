
import React from 'react';
import { Factory, Settings, PackagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Production = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-ecb-primary flex items-center">
          <Factory size={32} className="mr-3 text-ecb-accent" /> Production Management
        </h1>
        <Button className="bg-ecb-accent text-ecb-primary hover:bg-ecb-accent/90">
          <PackagePlus size={20} className="mr-2" /> Start New Production Order
        </Button>
      </div>

      <div className="p-10 bg-white rounded-lg shadow text-center">
        <Settings size={48} className="mx-auto mb-4 text-ecb-secondary" />
        <h2 className="text-xl font-semibold text-ecb-secondary mb-4">Under Construction</h2>
        <p className="text-ecb-textDark/70">
          The Production module is currently under development. We are designing a comprehensive
          solution inspired by recognized software to manage your manufacturing processes,
          including Bill of Materials (BOM), Work Orders, Material Requirements Planning (MRP),
          and production tracking.
        </p>
        <img  alt="Illustration of factory and gears" class="mx-auto mt-8 w-1/2 max-w-sm opacity-60" src="https://images.unsplash.com/photo-1677664540213-b46bae078aff" />
        <p className="mt-6 text-sm text-ecb-textDark/60">
          Stay tuned for updates on this powerful feature!
        </p>
      </div>
      <p className="text-xs text-ecb-textDark/60">This is a placeholder. Full functionality will be implemented soon.</p>
    </div>
  );
};

export default Production;
