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
import { PlusCircle, Trash2, Save, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import mockAccounts from '@/data/mockAccounts';

const ManualJournal = () => {
  const { toast } = useToast();
  const [journalDate, setJournalDate] = useState(new Date());
  const [journalNumber, setJournalNumber] = useState(`MJ-${String(Date.now()).slice(-6)}`);
  const [overallNarration, setOverallNarration] = useState('');
  const [journalLines, setJournalLines] = useState([
    { id: Date.now() + 1, accountId: '', debit: '', credit: '', lineNarration: '' },
    { id: Date.now() + 2, accountId: '', debit: '', credit: '', lineNarration: '' },
  ]);
  const [totalDebits, setTotalDebits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);

  useEffect(() => {
    let debits = 0;
    let credits = 0;
    journalLines.forEach(line => {
      debits += parseFloat(line.debit) || 0;
      credits += parseFloat(line.credit) || 0;
    });
    setTotalDebits(parseFloat(debits.toFixed(2)));
    setTotalCredits(parseFloat(credits.toFixed(2)));
  }, [journalLines]);

  const handleAddLine = () => {
    setJournalLines([...journalLines, { id: Date.now(), accountId: '', debit: '', credit: '', lineNarration: '' }]);
  };

  const handleRemoveLine = (idToRemove) => {
    if (journalLines.length <= 2) {
        toast({ title: "Cannot Remove", description: "A journal entry must have at least two lines.", variant: "destructive"});
        return;
    }
    setJournalLines(journalLines.filter(line => line.id !== idToRemove));
  };

  const handleLineChange = (id, field, value) => {
    setJournalLines(journalLines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value };
        if (field === 'debit' && parseFloat(value) > 0) updatedLine.credit = '';
        if (field === 'credit' && parseFloat(value) > 0) updatedLine.debit = '';
        return updatedLine;
      }
      return line;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (journalLines.some(line => !line.accountId || (line.debit === '' && line.credit === ''))) {
      toast({ title: "Validation Error", description: "All lines must have an account and either a debit or credit amount.", variant: "destructive" });
      return;
    }
    if (totalDebits !== totalCredits) {
      toast({ title: "Validation Error", description: "Total Debits must equal Total Credits.", variant: "destructive" });
      return;
    }
    if (totalDebits === 0) {
        toast({ title: "Validation Error", description: "Journal entry amounts cannot be zero.", variant: "destructive"});
        return;
    }

    const journalData = {
      id: `journal-${Date.now()}`,
      journalNumber,
      date: journalDate,
      overallNarration,
      lines: journalLines.filter(line => line.accountId && (line.debit !== '' || line.credit !== '')),
      totalDebits,
      totalCredits,
    };
    console.log("Manual Journal Data:", journalData);
    const existingJournals = JSON.parse(localStorage.getItem('manualJournals') || '[]');
    localStorage.setItem('manualJournals', JSON.stringify([...existingJournals, journalData]));
    toast({
      title: "Manual Journal Saved",
      description: `Journal ${journalNumber} has been saved.`,
      className: "bg-green-500 text-white",
    });
    setJournalDate(new Date());
    setOverallNarration('');
    setJournalLines([
        { id: Date.now() + 1, accountId: '', debit: '', credit: '', lineNarration: '' },
        { id: Date.now() + 2, accountId: '', debit: '', credit: '', lineNarration: '' },
    ]);
    setJournalNumber(`MJ-${String(Date.now()).slice(-6)}`);
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-xl border-border dark:border-dark-border">
        <CardHeader className="bg-muted/50 dark:bg-dark-muted/50 p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <BookOpen size={32} className="mr-3 text-accent dark:text-dark-accent" /> New Manual Journal
            </CardTitle>
             <div className="text-muted-foreground dark:text-dark-muted-foreground font-mono text-sm bg-muted dark:bg-dark-muted px-2 py-1 rounded self-start sm:self-center">
              {journalNumber}
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="journalDate" className="font-semibold">Date <span className="text-destructive">*</span></Label>
                <DatePicker date={journalDate} setDate={setJournalDate} id="journalDate" />
              </div>
              <div className="space-y-2">
                 <Label htmlFor="overallNarration" className="font-semibold">Overall Narration</Label>
                 <Input id="overallNarration" value={overallNarration} onChange={(e) => setOverallNarration(e.target.value)} placeholder="e.g., Year-end adjustments" />
              </div>
            </div>

            <div className="overflow-x-auto border border-border dark:border-dark-border rounded-lg">
              <table className="w-full min-w-[700px]">
                <thead className="bg-muted dark:bg-dark-muted">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-primary dark:text-dark-primary w-[35%]">Account <span className="text-destructive">*</span></th>
                    <th className="p-3 text-right text-sm font-semibold text-primary dark:text-dark-primary w-[15%]">Debit <span className="text-destructive">*</span></th>
                    <th className="p-3 text-right text-sm font-semibold text-primary dark:text-dark-primary w-[15%]">Credit <span className="text-destructive">*</span></th>
                    <th className="p-3 text-left text-sm font-semibold text-primary dark:text-dark-primary w-[30%]">Line Narration</th>
                    <th className="p-3 text-center text-sm font-semibold text-primary dark:text-dark-primary w-[5%]"></th>
                  </tr>
                </thead>
                <tbody>
                  {journalLines.map((line, index) => (
                    <tr key={line.id} className="border-b border-border dark:border-dark-border last:border-b-0 hover:bg-muted/50 dark:hover:bg-dark-muted/50">
                      <td className="p-2">
                        <Select value={line.accountId} onValueChange={(value) => handleLineChange(line.id, 'accountId', value)}>
                          <SelectTrigger className="text-sm"><SelectValue placeholder="Select account" /></SelectTrigger>
                          <SelectContent>
                            {mockAccounts.map(acc => (
                              <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.category})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-2">
                        <Input type="number" value={line.debit} onChange={(e) => handleLineChange(line.id, 'debit', e.target.value)} placeholder="0.00" className="w-full text-right text-sm" min="0" step="0.01" disabled={!!line.credit && parseFloat(line.credit) > 0} />
                      </td>
                      <td className="p-2">
                        <Input type="number" value={line.credit} onChange={(e) => handleLineChange(line.id, 'credit', e.target.value)} placeholder="0.00" className="w-full text-right text-sm" min="0" step="0.01" disabled={!!line.debit && parseFloat(line.debit) > 0} />
                      </td>
                      <td className="p-2">
                        <Input value={line.lineNarration} onChange={(e) => handleLineChange(line.id, 'lineNarration', e.target.value)} placeholder="Line specific note" className="w-full text-sm" />
                      </td>
                      <td className="p-2 text-center">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveLine(line.id)} className="text-destructive dark:text-red-400 hover:text-destructive/80 h-8 w-8">
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/70 dark:bg-dark-muted/70 font-semibold">
                    <tr>
                        <td className="p-3 text-right text-primary dark:text-dark-primary">Totals:</td>
                        <td className="p-3 text-right text-primary dark:text-dark-primary">{totalDebits.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        <td className="p-3 text-right text-primary dark:text-dark-primary">{totalCredits.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td>
                        <td className="p-3" colSpan="2">
                            {totalDebits !== totalCredits && <span className="text-destructive dark:text-red-400 text-xs">Debits and Credits must balance. Difference: {(totalDebits - totalCredits).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>}
                        </td>
                    </tr>
                </tfoot>
              </table>
            </div>
            <Button type="button" onClick={handleAddLine} variant="outline" className="mt-4 text-accent dark:text-dark-accent border-accent dark:border-dark-accent hover:bg-accent/10 dark:hover:bg-dark-accent/10">
              <PlusCircle size={18} className="mr-2" /> Add Line
            </Button>
          </CardContent>
          <CardFooter className="bg-muted/30 dark:bg-dark-muted/30 rounded-b-lg p-6 flex justify-end space-x-3 border-t border-border dark:border-dark-border">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary/90">
              <Save size={18} className="mr-2" /> Save Journal
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
export default ManualJournal;
