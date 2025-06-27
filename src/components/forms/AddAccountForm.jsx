import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Save } from 'lucide-react';

const accountTypes = ["Asset", "Liability", "Equity", "Revenue", "Expense", "Cost of Goods Sold"];
const NO_PARENT_ACCOUNT_VALUE = "__none__";

const AddAccountForm = ({ existingAccounts = [], onSave, onCancel, initialData, isEditMode }) => {
  const { toast } = useToast();
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState('');
  const [subAccountOf, setSubAccountOf] = useState(NO_PARENT_ACCOUNT_VALUE);
  const [openingBalance, setOpeningBalance] = useState('');
  const [openingBalanceDate, setOpeningBalanceDate] = useState(undefined);
  const [originalId, setOriginalId] = useState(null);


  useEffect(() => {
    if (isEditMode && initialData) {
      setAccountName(initialData.accName || '');
      setAccountNumber(initialData.accNum || '');
      setAccountType(initialData.accType || '');
      setSubAccountOf(initialData.subAccountOf || NO_PARENT_ACCOUNT_VALUE);
      setOpeningBalance(initialData.openingBalance?.toString() || '');
      setOpeningBalanceDate(initialData.openingBalanceDate ? new Date(initialData.openingBalanceDate) : undefined);
      setOriginalId(initialData.id || initialData.accNum); 
    } else {
      resetForm();
    }
  }, [initialData, isEditMode]);

  const resetForm = () => {
    setAccountName('');
    setAccountNumber('');
    setAccountType('');
    setSubAccountOf(NO_PARENT_ACCOUNT_VALUE);
    setOpeningBalance('');
    setOpeningBalanceDate(undefined);
    setOriginalId(null);
  };

  const handleSubmit = (e, closeAfterSave = true) => {
    e.preventDefault();
    if (!accountName || !accountType) {
      toast({
        title: "Validation Error",
        description: "Account Name and Account Type are required.",
        variant: "destructive",
      });
      return;
    }

    const accountData = {
      id: originalId || `acc-${Date.now()}`, 
      accName: accountName,
      accNum: accountNumber || (originalId ? originalId.split('-')[1] || String(Date.now()).slice(-4) : String(Date.now()).slice(-4)),
      accType: accountType,
      subAccountOf: subAccountOf === NO_PARENT_ACCOUNT_VALUE ? null : subAccountOf,
      openingBalance: parseFloat(openingBalance) || 0,
      openingBalanceDate: openingBalanceDate ? openingBalanceDate.toISOString().split('T')[0] : null,
    };
    
    onSave(accountData, isEditMode);

    toast({
      title: `Account ${isEditMode ? 'Updated' : 'Saved'}!`,
      description: `${accountName} has been successfully ${isEditMode ? 'updated' : 'added'}.`,
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
        <DialogTitle>{isEditMode ? 'Edit Account' : 'Add New Account'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update the details of the existing account.' : 'Fill in the details to create a new account.'}
        </DialogDescription>
      </DialogHeader>
      <div>
        <Label htmlFor="accountName">Account Name <span className="text-red-500">*</span></Label>
        <Input
          id="accountName"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="e.g., Main Bank Account"
          className="mt-1"
          required
        />
      </div>
      <div>
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          id="accountNumber"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="e.g., 1010"
          className="mt-1"
          disabled={isEditMode} 
        />
         {isEditMode && <p className="text-xs text-muted-foreground">Account number cannot be changed after creation.</p>}
      </div>
      <div>
        <Label htmlFor="accountType">Account Type <span className="text-red-500">*</span></Label>
        <Select onValueChange={setAccountType} value={accountType} required>
          <SelectTrigger id="accountType" className="w-full mt-1">
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            {accountTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="subAccountOf">Sub-Account of</Label>
        <Select onValueChange={setSubAccountOf} value={subAccountOf}>
          <SelectTrigger id="subAccountOf" className="w-full mt-1">
            <SelectValue placeholder="Select parent account (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NO_PARENT_ACCOUNT_VALUE}>None</SelectItem>
            {existingAccounts.filter(acc => acc.accNum !== originalId).map(acc => (
              <SelectItem key={acc.accNum} value={acc.accNum}>{acc.accName} ({acc.accNum})</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <div>
        <DatePicker 
            date={openingBalanceDate} 
            setDate={setOpeningBalanceDate} 
            className="mt-1 w-full" 
            disabled={isEditMode}
        />
        </div>
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
          <Save size={18} className="mr-2" /> {isEditMode ? 'Update Account' : 'Save & Close'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddAccountForm;
