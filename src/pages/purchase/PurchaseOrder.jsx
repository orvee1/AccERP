import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PurchaseOrder = () => {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-ecb-primary">Purchase Orders</h1>
        <Button 
          className="bg-ecb-accent text-ecb-primary hover:bg-ecb-accent/90"
          onClick={() => toast({ title: "New Purchase Order", description: "Form to create new purchase order coming soon!"})}
        >
          <PlusCircle size={20} className="mr-2" /> Create Purchase Order
        </Button>
      </div>
      <div className="p-10 bg-white rounded-lg shadow text-center">
        <ShoppingCart size={48} className="mx-auto mb-4 text-ecb-secondary" />
        <h2 className="text-xl font-semibold text-ecb-secondary mb-4">Purchase Order Management</h2>
        <p className="text-ecb-textDark/70">
          Manage your purchase orders here. Create new POs, send them to vendors, track their status (e.g., pending, partially received, received), and convert them into purchase bills.
        </p>
        <img  alt="Illustration of purchase orders and supply chain" class="mx-auto mt-8 w-1/2 max-w-xs opacity-70" src="https://images.unsplash.com/photo-1689870917577-884cf905638f" />
      </div>
      <p className="text-xs text-ecb-textDark/60">This is a placeholder. Full functionality will be implemented soon.</p>
    </div>
  );
};
export default PurchaseOrder;