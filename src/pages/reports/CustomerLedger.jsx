import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { User, FilterX, Printer, Search } from 'lucide-react';

const CustomerLedger = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch customers from localStorage
    const storedCustomers = JSON.parse(localStorage.getItem('customers')) || [
        { id: 'cust-001', name: 'Client Omega Corp.', openingBalance: 2800, openingBalanceDate: '2025-01-01' },
        { id: 'cust-002', name: 'Customer Zeta Ltd.', openingBalance: 0, openingBalanceDate: '2025-01-01' }
    ];
    const formattedCustomers = storedCustomers.map(cust => ({
      id: cust.customerNumber || cust.id,
      name: cust.name,
      openingBalance: parseFloat(cust.openingBalance) || 0,
      openingBalanceDate: cust.openingBalanceDate ? parseISO(cust.openingBalanceDate) : new Date(new Date().getFullYear(), 0, 1)
    }));
    setCustomers(formattedCustomers);
    if (formattedCustomers.length > 0) {
      setSelectedCustomerId(formattedCustomers[0].id);
    }
  }, []);

  useEffect(() => {
    if (!selectedCustomerId) return;

    // Mock transaction fetching logic for a customer.
    const salesInvoices = JSON.parse(localStorage.getItem('salesInvoices')) || [];
    const receipts = JSON.parse(localStorage.getItem('receipts')) || [];
    const salesReturns = JSON.parse(localStorage.getItem('salesReturns')) || [];
    const creditNotes = JSON.parse(localStorage.getItem('creditNotes')) || [];

    const customerTransactions = [];

    salesInvoices
      .filter(inv => inv.customerId === selectedCustomerId)
      .forEach(inv => customerTransactions.push({
        date: parseISO(inv.invoiceDate),
        type: 'Sales Invoice',
        ref: inv.invoiceNumber,
        narration: `Invoice for ${inv.lineItems?.length || 0} items`,
        debit: parseFloat(inv.grandTotal) || 0,
        credit: 0,
      }));

    receipts
      .filter(rec => rec.receivedFrom === selectedCustomerId) // Assuming receivedFrom holds customerId for receipts
      .forEach(rec => customerTransactions.push({
        date: parseISO(rec.date),
        type: 'Receipt',
        ref: rec.receiptNumber,
        narration: rec.narration || 'Payment received',
        debit: 0,
        credit: parseFloat(rec.amount) || 0,
      }));
    
    salesReturns
      .filter(ret => ret.customerId === selectedCustomerId)
      .forEach(ret => customerTransactions.push({
          date: parseISO(ret.returnDate),
          type: 'Sales Return',
          ref: ret.returnNumber,
          narration: `Return of ${ret.lineItems?.length || 0} items`,
          debit: 0,
          credit: parseFloat(ret.grandTotal) || 0,
      }));

    creditNotes
      .filter(cn => cn.debitAccount === selectedCustomerId) // Assuming debitAccount is customer for CN
      .forEach(cn => customerTransactions.push({
          date: parseISO(cn.date),
          type: 'Credit Note',
          ref: cn.creditNoteNumber,
          narration: cn.narration || 'Credit issued',
          debit: 0,
          credit: parseFloat(cn.amount) || 0,
      }));

    setTransactions(customerTransactions);
  }, [selectedCustomerId]);

  const selectedCustomerDetails = useMemo(() => {
    return customers.find(cust => cust.id === selectedCustomerId);
  }, [customers, selectedCustomerId]);

  const processedTransactions = useMemo(() => {
    if (!selectedCustomerDetails) return [];

    let runningBalance = selectedCustomerDetails.openingBalance; // Customer balance: Debit is positive
    const openingBalanceDate = selectedCustomerDetails.openingBalanceDate || new Date(new Date().getFullYear(), 0, 1);

    const ledgerEntries = [];
    ledgerEntries.push({
      date: openingBalanceDate,
      type: 'Opening Balance',
      ref: '-',
      narration: 'Opening Balance',
      debit: selectedCustomerDetails.openingBalance >= 0 ? selectedCustomerDetails.openingBalance : 0,
      credit: selectedCustomerDetails.openingBalance < 0 ? Math.abs(selectedCustomerDetails.openingBalance) : 0,
      balance: runningBalance,
    });

    const sortedTransactions = [...transactions]
      .sort((a, b) => a.date - b.date);

    sortedTransactions.forEach(tx => {
      runningBalance += (tx.debit || 0) - (tx.credit || 0);
      ledgerEntries.push({ ...tx, balance: runningBalance });
    });

    return ledgerEntries;
  }, [transactions, selectedCustomerDetails]);

  useEffect(() => {
    let filtered = processedTransactions;
    if (startDate) filtered = filtered.filter(tx => tx.date >= startDate);
    if (endDate) filtered = filtered.filter(tx => tx.date <= endDate);
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(tx =>
        tx.type.toLowerCase().includes(lowerSearchTerm) ||
        tx.ref.toLowerCase().includes(lowerSearchTerm) ||
        tx.narration.toLowerCase().includes(lowerSearchTerm)
      );
    }
    setFilteredTransactions(filtered);
  }, [processedTransactions, startDate, endDate, searchTerm]);

  const handlePrint = () => window.print();
  const clearFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSearchTerm('');
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <Card className="shadow-xl border-border dark:border-dark-border">
        <CardHeader className="bg-muted/50 dark:bg-dark-muted/50 p-4 md:p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <User size={28} className="mr-3 text-accent dark:text-dark-accent" /> Customer Ledger
            </CardTitle>
            <Button onClick={handlePrint} variant="outline" size="sm" className="self-start sm:self-center">
              <Printer size={16} className="mr-2" /> Print
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label htmlFor="customerSelect" className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">Select Customer</label>
              <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                <SelectTrigger id="customerSelect"><SelectValue placeholder="Choose a customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(cust => (
                    <SelectItem key={cust.id} value={cust.id}>{cust.name} ({cust.id})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="startDate" className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">From Date</label>
              <DatePicker date={startDate} setDate={setStartDate} id="startDate" placeholder="Start Date"/>
            </div>
            <div className="space-y-1">
              <label htmlFor="endDate" className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">To Date</label>
              <DatePicker date={endDate} setDate={setEndDate} id="endDate" placeholder="End Date"/>
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

          {selectedCustomerDetails && (
            <div className="p-3 bg-primary/5 dark:bg-dark-primary/10 rounded-md border border-primary/20 dark:border-dark-primary/20">
              <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">{selectedCustomerDetails.name}</h3>
              <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">
                Customer ID: {selectedCustomerDetails.id}
              </p>
            </div>
          )}

          <div className="overflow-x-auto border border-border dark:border-dark-border rounded-lg">
            <Table>
              <TableHeader className="bg-muted dark:bg-dark-muted">
                <TableRow>
                  <TableHead className="w-[100px]">Date</TableHead>
                  <TableHead>Type / Ref#</TableHead>
                  <TableHead>Narration</TableHead>
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
                      <TableCell>{tx.narration}</TableCell>
                      <TableCell className="text-right">{(tx.debit || 0) > 0 ? (tx.debit || 0).toFixed(2) : '-'}</TableCell>
                      <TableCell className="text-right">{(tx.credit || 0) > 0 ? (tx.credit || 0).toFixed(2) : '-'}</TableCell>
                      <TableCell className="text-right font-semibold">{tx.balance.toFixed(2)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground dark:text-dark-muted-foreground">
                      No transactions found for this customer.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
           {filteredTransactions.length > 0 && (
            <div className="flex justify-end pt-2 text-sm font-semibold text-primary dark:text-dark-primary">
              Final Balance: {filteredTransactions[filteredTransactions.length -1].balance.toFixed(2)}
               { filteredTransactions[filteredTransactions.length -1].balance >= 0 ? " (Receivable)" : " (Payable)"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerLedger;