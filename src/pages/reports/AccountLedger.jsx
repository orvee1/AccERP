import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import mockAccountsData from '@/data/mockAccounts'; // Using mockAccounts for now
import { Eye, FilterX, Printer, Search } from 'lucide-react';

const AccountLedger = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // In a real app, fetch accounts from API or localStorage
    const storedAccounts = JSON.parse(localStorage.getItem('chartOfAccounts')) || mockAccountsData;
    const formattedAccounts = storedAccounts.map(acc => ({
      id: acc.accNum || acc.id, // Use accNum if from ChartOfAccounts, else id from mock
      name: acc.accName || acc.name,
      openingBalance: parseFloat(acc.openingBalance) || 0,
      openingBalanceDate: acc.openingBalanceDate ? parseISO(acc.openingBalanceDate) : new Date(new Date().getFullYear(), 0, 1)
    }));
    setAccounts(formattedAccounts);
    if (formattedAccounts.length > 0) {
      setSelectedAccountId(formattedAccounts[0].id);
    }
  }, []);

  useEffect(() => {
    if (!selectedAccountId) return;

    // Mock transaction fetching logic. In a real app, this would query various transaction types.
    // For demo, we'll create some dummy transactions.
    const dummyTransactions = [
      { date: '2025-06-01', type: 'Receipt', ref: 'RCPT-001', party: 'Customer A', narration: 'Payment received', debit: 0, credit: 500, accountId: accounts.length > 0 ? accounts[0].id : ''},
      { date: '2025-06-03', type: 'Payment', ref: 'PMT-001', party: 'Vendor X', narration: 'Office supplies', debit: 150, credit: 0, accountId: accounts.length > 0 ? accounts[0].id : ''},
      { date: '2025-06-05', type: 'Sales Invoice', ref: 'INV-002', party: 'Customer B', narration: 'Service provided', debit: 0, credit: 1200, accountId: accounts.find(a=>a.name.toLowerCase().includes("sales"))?.id || (accounts.length > 1 ? accounts[1].id : '')},
      { date: '2025-06-08', type: 'Purchase Bill', ref: 'BILL-003', party: 'Vendor Y', narration: 'Inventory purchase', debit: 800, credit: 0, accountId: accounts.find(a=>a.name.toLowerCase().includes("inventory") || a.name.toLowerCase().includes("purchase"))?.id || (accounts.length > 2 ? accounts[2].id : '')},
      { date: '2025-06-10', type: 'Manual Journal', ref: 'MJ-001', party: '-', narration: 'Month-end adjustment', debit: 50, credit: 0, accountId: accounts.length > 0 ? accounts[0].id : ''},
      { date: '2025-06-12', type: 'Manual Journal', ref: 'MJ-001', party: '-', narration: 'Month-end adjustment', debit: 0, credit: 50, accountId: accounts.find(a=>a.name.toLowerCase().includes("expense"))?.id || (accounts.length > 3 ? accounts[3].id : '')},
    ];
    
    // Filter transactions for the selected account
    const accountSpecificTransactions = dummyTransactions.filter(t => t.accountId === selectedAccountId);
    
    setTransactions(accountSpecificTransactions.map(t => ({...t, date: parseISO(t.date)})));
  }, [selectedAccountId, accounts]);

  const selectedAccountDetails = useMemo(() => {
    return accounts.find(acc => acc.id === selectedAccountId);
  }, [accounts, selectedAccountId]);

  const processedTransactions = useMemo(() => {
    if (!selectedAccountDetails) return [];

    let runningBalance = selectedAccountDetails.openingBalance;
    const openingBalanceDate = selectedAccountDetails.openingBalanceDate || new Date(new Date().getFullYear(), 0, 1);

    const ledgerEntries = [];

    // Add opening balance entry
    ledgerEntries.push({
      date: openingBalanceDate,
      type: 'Opening Balance',
      ref: '-',
      narration: 'Opening Balance',
      party: '-',
      debit: selectedAccountDetails.openingBalance >= 0 && (selectedAccountDetails.accType === 'Asset' || selectedAccountDetails.accType === 'Expense') ? selectedAccountDetails.openingBalance : 0,
      credit: selectedAccountDetails.openingBalance < 0 || (selectedAccountDetails.accType === 'Liability' || selectedAccountDetails.accType === 'Equity' || selectedAccountDetails.accType === 'Revenue') ? Math.abs(selectedAccountDetails.openingBalance) : 0,
      balance: runningBalance,
    });
    
    const sortedTransactions = [...transactions]
      .sort((a, b) => a.date - b.date);

    sortedTransactions.forEach(tx => {
      // Simplified logic for debit/credit effect on balance
      // Asset & Expense: Debit increases, Credit decreases
      // Liability, Equity, Revenue: Debit decreases, Credit increases
      if (selectedAccountDetails.accType === 'Asset' || selectedAccountDetails.accType === 'Expense') {
        runningBalance += (tx.debit || 0) - (tx.credit || 0);
      } else {
        runningBalance += (tx.credit || 0) - (tx.debit || 0);
      }
      ledgerEntries.push({ ...tx, balance: runningBalance });
    });

    return ledgerEntries;
  }, [transactions, selectedAccountDetails]);

  useEffect(() => {
    let filtered = processedTransactions;

    if (startDate) {
      filtered = filtered.filter(tx => tx.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(tx => tx.date <= endDate);
    }
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.type.toLowerCase().includes(lowerSearchTerm) ||
        tx.ref.toLowerCase().includes(lowerSearchTerm) ||
        tx.narration.toLowerCase().includes(lowerSearchTerm) ||
        tx.party.toLowerCase().includes(lowerSearchTerm)
      );
    }
    setFilteredTransactions(filtered);
  }, [processedTransactions, startDate, endDate, searchTerm]);
  
  const handlePrint = () => {
    window.print();
  };

  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchTerm('');
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="shadow-xl border-border dark:border-dark-border">
        <CardHeader className="bg-muted/50 dark:bg-dark-muted/50 p-4 md:p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <Eye size={28} className="mr-3 text-accent dark:text-dark-accent" /> Account Ledger
            </CardTitle>
            <Button onClick={handlePrint} variant="outline" size="sm" className="self-start sm:self-center">
              <Printer size={16} className="mr-2" /> Print
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label htmlFor="accountSelect" className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">Select Account</label>
              <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                <SelectTrigger id="accountSelect"><SelectValue placeholder="Choose an account" /></SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name} ({acc.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="startDate" className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">From Date</label>
              <DatePicker date={startDate} setDate={setStartDate} id="startDate" placeholder="Start Date" />
            </div>
            <div className="space-y-1">
              <label htmlFor="endDate" className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">To Date</label>
              <DatePicker date={endDate} setDate={setEndDate} id="endDate" placeholder="End Date" />
            </div>
          </div>
           <div className="flex flex-col sm:flex-row gap-2 items-center pt-2">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground dark:text-dark-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Button onClick={clearFilters} variant="outline" size="sm" className="w-full sm:w-auto">
              <FilterX size={16} className="mr-2"/> Clear Filters
            </Button>
          </div>

          {selectedAccountDetails && (
            <div className="p-3 bg-primary/5 dark:bg-dark-primary/10 rounded-md border border-primary/20 dark:border-dark-primary/20">
              <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">{selectedAccountDetails.name}</h3>
              <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">
                Account ID: {selectedAccountDetails.id} | Type: {selectedAccountDetails.accType || 'N/A'}
              </p>
            </div>
          )}

          <div className="overflow-x-auto border border-border dark:border-dark-border rounded-lg">
            <Table>
              <TableHeader className="bg-muted dark:bg-dark-muted">
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Type / Ref#</TableHead>
                  <TableHead>Narration / Party</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx, index) => (
                    <TableRow key={index} className="hover:bg-muted/50 dark:hover:bg-dark-muted/50">
                      <TableCell>{format(tx.date, 'dd-MMM-yy')}</TableCell>
                      <TableCell>
                        <div className="font-medium">{tx.type}</div>
                        <div className="text-xs text-muted-foreground dark:text-dark-muted-foreground">{tx.ref}</div>
                      </TableCell>
                      <TableCell>
                         <div>{tx.narration}</div>
                         {tx.party && tx.party !== '-' && <div className="text-xs text-muted-foreground dark:text-dark-muted-foreground">Party: {tx.party}</div>}
                      </TableCell>
                      <TableCell className="text-right">{ (tx.debit || 0) > 0 ? (tx.debit || 0).toFixed(2) : '-'}</TableCell>
                      <TableCell className="text-right">{ (tx.credit || 0) > 0 ? (tx.credit || 0).toFixed(2) : '-'}</TableCell>
                      <TableCell className="text-right font-semibold">{tx.balance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground dark:text-dark-muted-foreground">
                      No transactions found for the selected criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredTransactions.length > 0 && (
            <div className="flex justify-end pt-2 text-sm font-semibold text-primary dark:text-dark-primary">
              Final Balance: {filteredTransactions[filteredTransactions.length -1].balance.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountLedger;