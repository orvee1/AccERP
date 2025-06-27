import React, { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Save, Repeat } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import mockAccounts from '@/data/mockAccounts';

const Contra = () => {
  const { toast } = useToast();
  const [contraDate, setContraDate] = useState(new Date());
  const [fromAccount, setFromAccount] = useState('');
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [reference, setReference] = useState('');
  const [contraNumber, setContraNumber] = useState(`CONT-${String(Date.now()).slice(-6)}`);

  const cashAndBankAccounts = mockAccounts.filter(acc => acc.category === 'Cash' || acc.category === 'Bank');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fromAccount || !toAccount || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please select From and To accounts, and enter a valid Amount.",
        variant: "destructive",
      });
      return;
    }
    if (fromAccount === toAccount) {
      toast({
        title: "Validation Error",
        description: "From Account and To Account cannot be the same.",
        variant: "destructive",
      });
      return;
    }
    const contraData = {
      id: `contra-${Date.now()}`,
      contraNumber,
      date: contraDate,
      fromAccount,
      toAccount,
      amount: parseFloat(amount),
      narration,
      reference,
    };
    console.log("Contra Data:", contraData);
    const existingContra = JSON.parse(localStorage.getItem('contraEntries') || '[]');
    localStorage.setItem('contraEntries', JSON.stringify([...existingContra, contraData]));
    toast({
      title: "Contra Entry Saved",
      description: `Contra entry ${contraNumber} for ${parseFloat(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been saved.`,
      className: "bg-green-500 text-white",
    });
    setContraDate(new Date());
    setFromAccount('');
    setToAccount('');
    setAmount('');
    setNarration('');
    setReference('');
    setContraNumber(`CONT-${String(Date.now()).slice(-6)}`);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-border dark:border-dark-border">
        <CardHeader className="bg-muted/50 dark:bg-dark-muted/50 p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <Repeat size={32} className="mr-3 text-accent dark:text-dark-accent" /> New Contra Entry
            </CardTitle>
            <div className="text-muted-foreground dark:text-dark-muted-foreground font-mono text-sm bg-muted dark:bg-dark-muted px-2 py-1 rounded self-start sm:self-center">
              {contraNumber}
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contraDate" className="font-semibold">Date <span className="text-destructive">*</span></Label>
                <DatePicker date={contraDate} setDate={setContraDate} id="contraDate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="font-semibold">Amount <span className="text-destructive">*</span></Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fromAccount" className="font-semibold">From Account (Credit) <span className="text-destructive">*</span></Label>
                <Select value={fromAccount} onValueChange={setFromAccount}>
                  <SelectTrigger id="fromAccount"><SelectValue placeholder="Select Cash/Bank account" /></SelectTrigger>
                  <SelectContent>
                    {cashAndBankAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="toAccount" className="font-semibold">To Account (Debit) <span className="text-destructive">*</span></Label>
                <Select value={toAccount} onValueChange={setToAccount}>
                  <SelectTrigger id="toAccount"><SelectValue placeholder="Select Cash/Bank account" /></SelectTrigger>
                  <SelectContent>
                    {cashAndBankAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference" className="font-semibold">Reference No.</Label>
              <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g., Transfer ID, Slip #" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="narration" className="font-semibold">Narration</Label>
              <Textarea id="narration" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="e.g., Cash deposited to bank, Cash withdrawal for office use" />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 dark:bg-dark-muted/30 rounded-b-lg p-6 flex justify-end space-x-3 border-t border-border dark:border-dark-border">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary/90">
              <Save size={18} className="mr-2" /> Save Contra Entry
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
export default Contra;
