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
import { PlusCircle, Save, UploadCloud } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import mockAccounts from '@/data/mockAccounts';

const Payment = () => {
  const { toast } = useToast();
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [paymentFromAccount, setPaymentFromAccount] = useState('');
  const [paymentToAccount, setPaymentToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [reference, setReference] = useState('');
  const [paymentNumber, setPaymentNumber] = useState(`PMT-${String(Date.now()).slice(-6)}`);

  const cashBankAccounts = mockAccounts.filter(acc => acc.category === 'Cash' || acc.category === 'Bank');
  const otherAccounts = mockAccounts.filter(acc => acc.category !== 'Cash' && acc.category !== 'Bank');


  useEffect(() => {
    const defaultCashAccount = cashBankAccounts.find(acc => acc.category === 'Cash');
    if (defaultCashAccount) {
      setPaymentFromAccount(defaultCashAccount.id);
    } else if (cashBankAccounts.length > 0) {
      setPaymentFromAccount(cashBankAccounts[0].id);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!paymentFromAccount || !paymentToAccount || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields: Payment From, Payment To, and a valid Amount.",
        variant: "destructive",
      });
      return;
    }
    const paymentData = {
      id: `payment-${Date.now()}`,
      paymentNumber,
      date: paymentDate,
      paymentFrom: paymentFromAccount,
      paymentTo: paymentToAccount,
      amount: parseFloat(amount),
      narration,
      reference,
    };
    console.log("Payment Data:", paymentData);
    const existingPayments = JSON.parse(localStorage.getItem('payments') || '[]');
    localStorage.setItem('payments', JSON.stringify([...existingPayments, paymentData]));
    toast({
      title: "Payment Saved",
      description: `Payment ${paymentNumber} for ${parseFloat(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been saved.`,
      className: "bg-green-500 text-white",
    });
    setPaymentDate(new Date());
    setPaymentToAccount('');
    setAmount('');
    setNarration('');
    setReference('');
    setPaymentNumber(`PMT-${String(Date.now()).slice(-6)}`);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-border dark:border-dark-border">
        <CardHeader className="bg-muted/50 dark:bg-dark-muted/50 p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <UploadCloud size={32} className="mr-3 text-accent dark:text-dark-accent" /> New Payment
            </CardTitle>
             <div className="text-muted-foreground dark:text-dark-muted-foreground font-mono text-sm bg-muted dark:bg-dark-muted px-2 py-1 rounded self-start sm:self-center">
              {paymentNumber}
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paymentDate" className="font-semibold">Payment Date <span className="text-destructive">*</span></Label>
                <DatePicker date={paymentDate} setDate={setPaymentDate} id="paymentDate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentFrom" className="font-semibold">Payment From (Credit) <span className="text-destructive">*</span></Label>
                <Select value={paymentFromAccount} onValueChange={setPaymentFromAccount}>
                  <SelectTrigger id="paymentFrom"><SelectValue placeholder="Select account (Cash/Bank)" /></SelectTrigger>
                  <SelectContent>
                    {cashBankAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                     {otherAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="paymentTo" className="font-semibold">Payment To (Debit) <span className="text-destructive">*</span></Label>
                <Select value={paymentToAccount} onValueChange={setPaymentToAccount}>
                  <SelectTrigger id="paymentTo"><SelectValue placeholder="Select destination account" /></SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="font-semibold">Amount <span className="text-destructive">*</span></Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference" className="font-semibold">Reference No.</Label>
              <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g., Bill #, Check #" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="narration" className="font-semibold">Narration</Label>
              <Textarea id="narration" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="Describe the transaction..." />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 dark:bg-dark-muted/30 rounded-b-lg p-6 flex justify-end space-x-3 border-t border-border dark:border-dark-border">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary/90">
              <Save size={18} className="mr-2" /> Save Payment
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
export default Payment;
