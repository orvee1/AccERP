import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { useToast } from '@/components/ui/use-toast';
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Save } from 'lucide-react';

const AddVendorForm = ({ onSave, onCancel, initialData, isEditMode }) => {
  const { toast } = useToast();
  const [vendorName, setVendorName] = useState('');
  const [proprietorName, setProprietorName] = useState('');
  const [vendorNumber, setVendorNumber] = useState('');
  const [address, setAddress] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingBalanceDate, setOpeningBalanceDate] = useState(undefined);
  const [originalId, setOriginalId] = useState(null);

  useEffect(() => {
    if (isEditMode && initialData) {
      setVendorName(initialData.name || '');
      setProprietorName(initialData.proprietorName || '');
      setVendorNumber(initialData.vendorNumber || '');
      setAddress(initialData.address || '');
      setOpeningBalance(initialData.openingBalance?.toString() || '');
      setOpeningBalanceDate(initialData.openingBalanceDate ? new Date(initialData.openingBalanceDate) : undefined);
      setOriginalId(initialData.id || initialData.vendorNumber);
    } else {
      resetForm();
    }
  }, [initialData, isEditMode]);

  const resetForm = () => {
    setVendorName('');
    setProprietorName('');
    setVendorNumber('');
    setAddress('');
    setOpeningBalance('');
    setOpeningBalanceDate(undefined);
    setOriginalId(null);
  };

  const handleSubmit = (e, closeAfterSave = true) => {
    e.preventDefault();
    if (!vendorName) {
      toast({
        title: "Validation Error",
        description: "Vendor Name is required.",
        variant: "destructive",
      });
      return;
    }

    const vendorData = {
      id: originalId || `vend-${Date.now()}`,
      name: vendorName,
      proprietorName,
      vendorNumber: vendorNumber || (originalId ? originalId.split('-')[1] || String(Date.now()).slice(-4) : `V${String(Date.now()).slice(-4)}`),
      address,
      openingBalance: parseFloat(openingBalance) || 0,
      openingBalanceDate: openingBalanceDate ? openingBalanceDate.toISOString().split('T')[0] : null,
    };

    onSave(vendorData, isEditMode);

    toast({
      title: `Vendor ${isEditMode ? 'Updated' : 'Saved'}!`,
      description: `${vendorName} has been successfully ${isEditMode ? 'updated' : 'added'}.`,
    });

    if (closeAfterSave) {
      onCancel();
    } else if (!isEditMode) {
      resetForm();
    }
  };

  return (
    <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4 py-2">
      <DialogHeader className="hidden">
        <DialogTitle>{isEditMode ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update vendor details.' : 'Fill in the details to add a new vendor.'}
        </DialogDescription>
      </DialogHeader>
      <div>
        <Label htmlFor="vendorName">Vendor Name <span className="text-red-500">*</span></Label>
        <Input
          id="vendorName"
          value={vendorName}
          onChange={(e) => setVendorName(e.target.value)}
          placeholder="e.g., Supplier Alpha Inc."
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="proprietorName">Proprietor Name</Label>
        <Input
          id="proprietorName"
          value={proprietorName}
          onChange={(e) => setProprietorName(e.target.value)}
          placeholder="e.g., John Doe"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="vendorNumber">Vendor Number</Label>
        <Input
          id="vendorNumber"
          value={vendorNumber}
          onChange={(e) => setVendorNumber(e.target.value)}
          placeholder="e.g., V001"
          className="mt-1"
          disabled={isEditMode}
        />
        {isEditMode && <p className="text-xs text-muted-foreground">Vendor number cannot be changed after creation.</p>}
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., 123 Supply Chain Rd"
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="openingBalance">Opening Balance</Label>
        <Input
          id="openingBalance"
          type="number"
          value={openingBalance}
          onChange={(e) => setOpeningBalance(e.target.value)}
          placeholder="0.00"
          className="mt-1"
          disabled={isEditMode}
        />
        {isEditMode && <p className="text-xs text-muted-foreground">Opening balance cannot be changed after creation.</p>}
      </div>
      <div>
        <Label htmlFor="openingBalanceDate">Opening Balance As of Date</Label>
        <DatePicker 
            date={openingBalanceDate} 
            setDate={setOpeningBalanceDate} 
            className="mt-1 w-full" 
            disabled={isEditMode}
        />
        {isEditMode && <p className="text-xs text-muted-foreground">Opening balance date cannot be changed after creation.</p>}
      </div>
      <DialogFooter className="pt-6">
        <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        {!isEditMode && (
          <Button type="button" onClick={(e) => handleSubmit(e, false)} variant="secondary">
            <Save size={18} className="mr-2" /> Save & New
          </Button>
        )}
        <Button type="submit">
          <Save size={18} className="mr-2" /> {isEditMode ? 'Update Vendor' : 'Save & Close'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddVendorForm;
