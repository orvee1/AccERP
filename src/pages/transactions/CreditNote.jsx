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
import { Save, FilePlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import mockAccounts from '@/data/mockAccounts';

const CreditNote = () => {
  const { toast } = useToast();
  const [noteDate, setNoteDate] = useState(new Date());
  const [creditAccount, setCreditAccount] = useState(''); // Account to be credited (e.g., Sales Returns, Income)
  const [debitAccount, setDebitAccount] = useState(''); // Account to be debited (typically Customer/Party)
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [reference, setReference] = useState(''); // e.g. Original Sales Invoice No.
  const [creditNoteNumber, setCreditNoteNumber] = useState(`CN-${String(Date.now()).slice(-6)}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!debitAccount || !creditAccount || !amount || parseFloat(amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please select Debit and Credit accounts, and enter a valid Amount.",
        variant: "destructive",
      });
      return;
    }
    const creditNoteData = {
      id: `creditnote-${Date.now()}`,
      creditNoteNumber,
      date: noteDate,
      debitAccount,
      creditAccount,
      amount: parseFloat(amount),
      narration,
      reference,
    };
    console.log("Credit Note Data:", creditNoteData);
    const existingCreditNotes = JSON.parse(localStorage.getItem('creditNotes') || '[]');
    localStorage.setItem('creditNotes', JSON.stringify([...existingCreditNotes, creditNoteData]));
    toast({
      title: "Credit Note Saved",
      description: `Credit Note ${creditNoteNumber} for ${parseFloat(amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} has been saved.`,
      className: "bg-green-500 text-white",
    });
    setNoteDate(new Date());
    setDebitAccount('');
    setCreditAccount('');
    setAmount('');
    setNarration('');
    setReference('');
    setCreditNoteNumber(`CN-${String(Date.now()).slice(-6)}`);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-border dark:border-dark-border">
        <CardHeader className="bg-muted/50 dark:bg-dark-muted/50 p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <FilePlus size={32} className="mr-3 text-accent dark:text-dark-accent" /> New Credit Note
            </CardTitle>
            <div className="text-muted-foreground dark:text-dark-muted-foreground font-mono text-sm bg-muted dark:bg-dark-muted px-2 py-1 rounded self-start sm:self-center">
              {creditNoteNumber}
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="noteDate" className="font-semibold">Date <span className="text-destructive">*</span></Label>
                <DatePicker date={noteDate} setDate={setNoteDate} id="noteDate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount" className="font-semibold">Amount <span className="text-destructive">*</span></Label>
                <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" min="0.01" step="0.01" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="debitAccount" className="font-semibold">Debit Account (Party/Customer) <span className="text-destructive">*</span></Label>
                <Select value={debitAccount} onValueChange={setDebitAccount}>
                  <SelectTrigger id="debitAccount"><SelectValue placeholder="Select account to debit" /></SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="creditAccount" className="font-semibold">Credit Account <span className="text-destructive">*</span></Label>
                <Select value={creditAccount} onValueChange={setCreditAccount}>
                  <SelectTrigger id="creditAccount"><SelectValue placeholder="Select account to credit" /></SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference" className="font-semibold">Original Invoice/Reference No.</Label>
              <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g., Original Sales Invoice No." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="narration" className="font-semibold">Reason/Narration</Label>
              <Textarea id="narration" value={narration} onChange={(e) => setNarration(e.target.value)} placeholder="e.g., Goods returned by customer, Price adjustment" />
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 dark:bg-dark-muted/30 rounded-b-lg p-6 flex justify-end space-x-3 border-t border-border dark:border-dark-border">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary/90">
              <Save size={18} className="mr-2" /> Save Credit Note
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
export default CreditNote;
