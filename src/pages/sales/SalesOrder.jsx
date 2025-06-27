import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ShoppingCart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SalesOrder = () => {
  const { toast } = useToast();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-ecb-primary">Sales Orders</h1>
        <Button 
          className="bg-ecb-accent text-ecb-primary hover:bg-ecb-accent/90"
          onClick={() => toast({ title: "New Sales Order", description: "Form to create new sales order coming soon!"})}
        >
          <PlusCircle size={20} className="mr-2" /> Create Sales Order
        </Button>
      </div>
      <div className="p-10 bg-white rounded-lg shadow text-center">
        <ShoppingCart size={48} className="mx-auto mb-4 text-ecb-secondary" />
        <h2 className="text-xl font-semibold text-ecb-secondary mb-4">Sales Order Management</h2>
        <p className="text-ecb-textDark/70">
          This is where you'll manage sales orders. Create new orders, track their status (e.g., pending, fulfilled, invoiced), and convert them into sales invoices.
        </p>
        <img  alt="Illustration of sales order documents and process flow" class="mx-auto mt-8 w-1/2 max-w-xs opacity-70" src="https://images.unsplash.com/photo-1693501063463-c4efd7afa14e" />
      </div>
      <p className="text-xs text-ecb-textDark/60">This is a placeholder. Full functionality will be implemented soon.</p>
    </div>
  );
};
export default SalesOrder;