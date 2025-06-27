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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Save, DownloadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import mockAccounts from '@/data/mockAccounts';

const Receipt = () => {
  const { toast } = useToast();
  const [receiptDate, setReceiptDate] = useState(new Date());
  const [receivedToAccount, setReceivedToAccount] = useState('');
  const [receivedFromAccount, setReceivedFromAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [reference, setReference] = useState('');
  const [receiptNumber, setReceiptNumber] = useState(`RCPT-${String(Date.now()).slice(-6)}`);

  const cashBankAccounts = mockAccounts.filter(acc => acc.category === 'Cash' || acc.category === 'Bank');
  const otherAccounts = mockAccounts.filter(acc => acc.category !== 'Cash' && acc.category !== 'Bank');

  useEffect(() => {
    // Set default "Received To" account to the first cash account if available
    const defaultCashAccount = cashBankAccounts.find(acc => acc.category === 'Cash');
    if (defaultCashAccount) {
      setReceivedToAccount(defaultCashAccount.id);
    } else if (cashBankAccounts.length > 0) {
      setReceivedToAccount(cashBankAccounts[0].id);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!receivedToAccount || !receivedFromAccount || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Received To, Received From, and a valid Amount.",
        variant: "destructive",
      });
      return;
    }
    const receiptData = {
      id: `receipt-${Date.now()}`,
      receiptNumber,
      date: receiptDate,
      receivedTo: receivedToAccount,
      receivedFrom: receivedFromAccount,
      amount: parseFloat(amount),
      narration,
      reference,
    };
    console.log("Receipt Data:", receiptData);
    // In a real app, save to localStorage or API
    const existingReceipts = JSON.parse(localStorage.getItem('receipts') || '[]');
    localStorage.setItem('receipts', JSON.stringify([...existingReceipts, receiptData]));

    toast({
      title: "Receipt Saved",
      description: `Receipt ${receiptNumber} for ${parseFloat(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been saved.`,
      className: "bg-green-500 text-white",
    });
    // Reset form
    setReceiptDate(new Date());
    // Keep receivedToAccount as is (default)
    setReceivedFromAccount('');
    setAmount('');
    setNarration('');
    setReference('');
    setReceiptNumber(`RCPT-${String(Date.now()).slice(-6)}`);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-border dark:border-dark-border">
        <CardHeader className="bg-muted/50 dark:bg-dark-muted/50 p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <DownloadCloud size={32} className="mr-3 text-accent dark:text-dark-accent" /> New Receipt
            </CardTitle>
            <div className="text-muted-foreground dark:text-dark-muted-foreground font-mono text-sm bg-muted dark:bg-dark-muted px-2 py-1 rounded self-start sm:self-center">
              {receiptNumber}
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="receivedTo" className="font-semibold">Received To (Debit) <span className="text-destructive">*</span></Label>
                <Select value={receivedToAccount} onValueChange={setReceivedToAccount}>
                  <SelectTrigger id="receivedTo"><SelectValue placeholder="Select account (Cash/Bank)" /></SelectTrigger>
                  <SelectContent>
                    {cashBankAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                    {otherAccounts.map(acc => ( // Allow selecting other accounts too
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receivedFrom" className="font-semibold">Received From (Credit) <span className="text-destructive">*</span></Label>
                <Select value={receivedFromAccount} onValueChange={setReceivedFromAccount}>
                  <SelectTrigger id="receivedFrom"><SelectValue placeholder="Select source account" /></SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount" className="font-semibold text-lg">Amount <span className="text-destructive">*</span></Label>
                <Input 
                  id="amount" 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder="0.00" 
                  min="0.01" 
                  step="0.01"
                  className="text-xl font-semibold" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiptDate" className="font-semibold">Receipt Date <span className="text-destructive">*</span></Label>
                <DatePicker date={receiptDate} setDate={setReceiptDate} id="receiptDate" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference" className="font-semibold">Reference No.</Label>
              <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g., Invoice #, Check #" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="narration" className="font-semibold">Narration</Label>
              <Textarea id="narration" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Describe the transaction..." />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 dark:bg-dark-muted/30 rounded-b-lg p-6 flex justify-end space-x-3 border-t border-border dark:border-dark-border">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary/90">
              <Save size={18} className="mr-2" /> Save Receipt
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
export default Receipt;
