import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';
import { Truck, FilterX, Printer, Search } from 'lucide-react';

const VendorLedger = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch vendors from localStorage
    const storedVendors = JSON.parse(localStorage.getItem('vendors')) || [
        { id: 'vend-001', name: 'Supplier Alpha Inc.', openingBalance: 1500, openingBalanceDate: '2025-01-01' },
        { id: 'vend-002', name: 'Service Provider Beta', openingBalance: 0, openingBalanceDate: '2025-01-01' }
    ];
    const formattedVendors = storedVendors.map(vend => ({
      id: vend.vendorNumber || vend.id,
      name: vend.name,
      openingBalance: parseFloat(vend.openingBalance) || 0,
      openingBalanceDate: vend.openingBalanceDate ? parseISO(vend.openingBalanceDate) : new Date(new Date().getFullYear(), 0, 1)
    }));
    setVendors(formattedVendors);
    if (formattedVendors.length > 0) {
      setSelectedVendorId(formattedVendors[0].id);
    }
  }, []);

  useEffect(() => {
    if (!selectedVendorId) return;

    // Mock transaction fetching logic for a vendor.
    const purchaseBills = JSON.parse(localStorage.getItem('purchaseBills')) || [];
    const payments = JSON.parse(localStorage.getItem('payments')) || [];
    const purchaseReturns = JSON.parse(localStorage.getItem('purchaseReturns')) || [];
    const debitNotes = JSON.parse(localStorage.getItem('debitNotes')) || [];
    
    const vendorTransactions = [];

    purchaseBills
      .filter(bill => bill.vendorId === selectedVendorId)
      .forEach(bill => vendorTransactions.push({
        date: parseISO(bill.billDate),
        type: 'Purchase Bill',
        ref: bill.billNumber,
        narration: `Bill for ${bill.lineItems?.length || 0} items`,
        debit: 0,
        credit: parseFloat(bill.grandTotal) || 0,
      }));

    payments
      .filter(pmt => pmt.paymentTo === selectedVendorId) // Assuming paymentTo holds vendorId for payments
      .forEach(pmt => vendorTransactions.push({
        date: parseISO(pmt.date),
        type: 'Payment',
        ref: pmt.paymentNumber,
        narration: pmt.narration || 'Payment made',
        debit: parseFloat(pmt.amount) || 0,
        credit: 0,
      }));

    purchaseReturns
      .filter(ret => ret.vendorId === selectedVendorId)
      .forEach(ret => vendorTransactions.push({
          date: parseISO(ret.returnDate),
          type: 'Purchase Return',
          ref: ret.returnNumber,
          narration: `Return of ${ret.lineItems?.length || 0} items`,
          debit: parseFloat(ret.grandTotal) || 0,
          credit: 0,
      }));
    
    debitNotes
      .filter(dn => dn.creditAccount === selectedVendorId) // Assuming creditAccount is vendor for DN
      .forEach(dn => vendorTransactions.push({
          date: parseISO(dn.date),
          type: 'Debit Note',
          ref: dn.debitNoteNumber,
          narration: dn.narration || 'Debit note issued',
          debit: parseFloat(dn.amount) || 0,
          credit: 0,
      }));

    setTransactions(vendorTransactions);
  }, [selectedVendorId]);

  const selectedVendorDetails = useMemo(() => {
    return vendors.find(vend => vend.id === selectedVendorId);
  }, [vendors, selectedVendorId]);

  const processedTransactions = useMemo(() => {
    if (!selectedVendorDetails) return [];

    let runningBalance = selectedVendorDetails.openingBalance; // Vendor balance: Credit is positive (money owed to vendor)
    const openingBalanceDate = selectedVendorDetails.openingBalanceDate || new Date(new Date().getFullYear(), 0, 1);
    
    const ledgerEntries = [];
    ledgerEntries.push({
      date: openingBalanceDate,
      type: 'Opening Balance',
      ref: '-',
      narration: 'Opening Balance',
      debit: selectedVendorDetails.openingBalance < 0 ? Math.abs(selectedVendorDetails.openingBalance) : 0,
      credit: selectedVendorDetails.openingBalance >= 0 ? selectedVendorDetails.openingBalance : 0,
      balance: runningBalance,
    });

    const sortedTransactions = [...transactions]
      .sort((a, b) => a.date - b.date);

    sortedTransactions.forEach(tx => {
      runningBalance += (tx.credit || 0) - (tx.debit || 0);
      ledgerEntries.push({ ...tx, balance: runningBalance });
    });

    return ledgerEntries;
  }, [transactions, selectedVendorDetails]);

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
              <Truck size={28} className="mr-3 text-accent dark:text-dark-accent" /> Vendor Ledger
            </CardTitle>
            <Button onClick={handlePrint} variant="outline" size="sm" className="self-start sm:self-center">
              <Printer size={16} className="mr-2" /> Print
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label htmlFor="vendorSelect" className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">Select Vendor</label>
              <Select value={selectedVendorId} onValueChange={setSelectedVendorId}>
                <SelectTrigger id="vendorSelect"><SelectValue placeholder="Choose a vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map(vend => (
                    <SelectItem key={vend.id} value={vend.id}>{vend.name} ({vend.id})</SelectItem>
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

          {selectedVendorDetails && (
            <div className="p-3 bg-primary/5 dark:bg-dark-primary/10 rounded-md border border-primary/20 dark:border-dark-primary/20">
              <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">{selectedVendorDetails.name}</h3>
              <p className="text-sm text-muted-foreground dark:text-dark-muted-foreground">
                Vendor ID: {selectedVendorDetails.id}
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
                      No transactions found for this vendor.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredTransactions.length > 0 && (
            <div className="flex justify-end pt-2 text-sm font-semibold text-primary dark:text-dark-primary">
              Final Balance: {filteredTransactions[filteredTransactions.length -1].balance.toFixed(2)}
              { filteredTransactions[filteredTransactions.length -1].balance >= 0 ? " (Payable)" : " (Receivable)"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorLedger;