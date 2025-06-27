import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Search, Edit, Trash2, ArrowUpDown, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AddAccountForm from '@/components/forms/AddAccountForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialAccountsData = [
  { sl: 1, id: 'acc-1001', accNum: '1001', accName: 'Cash on Hand', accType: 'Asset', balance: 5000.00, openingBalance: 5000.00, openingBalanceDate: '2023-01-01', subAccountOf: null },
  { sl: 2, id: 'acc-1002', accNum: '1002', accName: 'Accounts Receivable', accType: 'Asset', balance: 12500.00, openingBalance: 12500.00, openingBalanceDate: '2023-01-01', subAccountOf: null },
  { sl: 3, id: 'acc-2001', accNum: '2001', accName: 'Accounts Payable', accType: 'Liability', balance: 7200.00, openingBalance: 7200.00, openingBalanceDate: '2023-01-01', subAccountOf: null },
  { sl: 4, id: 'acc-4001', accNum: '4001', accName: 'Sales Revenue', accType: 'Revenue', balance: 25000.00, openingBalance: 25000.00, openingBalanceDate: '2023-01-01', subAccountOf: null },
  { sl: 5, id: 'acc-1003', accNum: '1003', accName: 'Petty Cash', accType: 'Asset', balance: 500.00, openingBalance: 500.00, openingBalanceDate: '2023-01-01', subAccountOf: '1001' },
  { sl: 6, id: 'acc-5001', accNum: '5001', accName: 'Office Expenses', accType: 'Expense', balance: 1200.00, openingBalance: 1200.00, openingBalanceDate: '2023-01-01', subAccountOf: null },
];

const formatAccountForDisplay = (account) => ({
  ...account,
  balanceFormatted: (account.balance || 0).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
});

const SortableHeader = ({ children, columnKey, sortConfig, requestSort, isTextRight = false, className = "" }) => {
  const isSorted = sortConfig && sortConfig.key === columnKey;
  const direction = isSorted ? sortConfig.direction : null;

  return (
    <th scope="col" className={`px-4 py-3 cursor-pointer hover:bg-primary/10 dark:hover:bg-dark-primary/10 transition-colors ${isTextRight ? 'text-right' : 'text-left'} ${className}`} onClick={() => requestSort(columnKey)}>
      <div className={`flex items-center ${isTextRight ? 'justify-end' : 'justify-start'}`}>
        {!isTextRight && children}
        <span className={`mx-1 ${isTextRight ? 'mr-0 ml-1' : 'ml-0 mr-1'}`}>
          {isSorted ? (direction === 'ascending' ? '▲' : '▼') : <ArrowUpDown size={14} className="opacity-40" />}
        </span>
        {isTextRight && children}
      </div>
    </th>
  );
};


const ChartOfAccounts = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState(() => initialAccountsData.map(formatAccountForDisplay));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'sl', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  useEffect(() => {
    const storedAccounts = localStorage.getItem('chartOfAccounts');
    if (storedAccounts) {
      setAccounts(JSON.parse(storedAccounts).map(formatAccountForDisplay));
    } else {
      localStorage.setItem('chartOfAccounts', JSON.stringify(initialAccountsData));
    }
  }, []);

  const updateLocalStorage = (updatedAccounts) => {
    localStorage.setItem('chartOfAccounts', JSON.stringify(updatedAccounts.map(({balanceFormatted, ...rest}) => rest))); // Don't store formatted balance
  };

  const handleOpenModal = (account = null) => {
    setAccountToEdit(account);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAccountToEdit(null);
  };

  const handleSaveAccount = (accountData, isEdit) => {
    setAccounts(prevAccounts => {
      let updatedAccounts;
      if (isEdit) {
        updatedAccounts = prevAccounts.map(acc =>
          acc.id === accountData.id ? formatAccountForDisplay({ ...acc, ...accountData, balance: accountData.openingBalance }) : acc
        );
      } else {
        const newSl = prevAccounts.length > 0 ? Math.max(...prevAccounts.map(acc => acc.sl)) + 1 : 1;
        const newAccount = formatAccountForDisplay({ ...accountData, sl: newSl, balance: accountData.openingBalance });
        updatedAccounts = [...prevAccounts, newAccount];
      }
      updateLocalStorage(updatedAccounts);
      return updatedAccounts;
    });
  };

  const handleDeleteAccount = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (account) {
      setAccountToDelete(account);
      setIsConfirmDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      const updatedAccounts = accounts.filter(acc => acc.id !== accountToDelete.id);
      setAccounts(updatedAccounts);
      updateLocalStorage(updatedAccounts);
      toast({ title: "Account Deleted", description: `${accountToDelete.accName} has been deleted.`, variant: "destructive" });
      setIsConfirmDeleteModalOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleImportExcel = () => {
    toast({ title: "Import from Excel", description: "This feature will be available soon.", duration: 3000 });
  };

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredAccounts = useMemo(() => {
    let sortableItems = [...accounts];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(account =>
        Object.values(account).some(val => String(val).toLowerCase().includes(term))
      );
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        const numKeys = ['balance', 'sl', 'openingBalance'];
        if (numKeys.includes(sortConfig.key)) {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        } else if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [searchTerm, sortConfig, accounts]);


  return (
    <div className="space-y-6 p-1">
      <Card className="shadow-lg border-border dark:border-dark-border">
        <CardHeader className="bg-card dark:bg-dark-card rounded-t-lg p-4 md:p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <FileDown size={28} className="mr-3 text-accent dark:text-dark-accent" /> Chart of Accounts
            </CardTitle>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-primary dark:text-dark-primary border-primary dark:border-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 shadow-sm">
                    <PlusCircle size={20} className="mr-2" /> Add Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-card dark:bg-dark-card shadow-lg rounded-md border border-border dark:border-dark-border">
                  <DropdownMenuItem onClick={() => handleOpenModal(null)} className="text-foreground dark:text-dark-foreground hover:bg-primary/10 dark:hover:bg-dark-primary/10 cursor-pointer">
                    Add New
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleImportExcel} className="text-foreground dark:text-dark-foreground hover:bg-primary/10 dark:hover:bg-dark-primary/10 cursor-pointer">
                    Import from Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[550px] bg-card dark:bg-dark-card text-foreground dark:text-dark-foreground border-border dark:border-dark-border shadow-2xl rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-primary dark:text-dark-primary text-2xl font-semibold">
                  {accountToEdit ? 'Edit Account' : 'Add New Account'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground dark:text-dark-muted-foreground">
                  {accountToEdit ? 'Update the account details.' : 'Fill in the details to create a new account.'}
                </DialogDescription>
              </DialogHeader>
              <AddAccountForm 
                existingAccounts={accounts} 
                onSave={handleSaveAccount} 
                onCancel={handleCloseModal} 
                initialData={accountToEdit}
                isEditMode={!!accountToEdit}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog open={isConfirmDeleteModalOpen} onOpenChange={setIsConfirmDeleteModalOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the account
                  "{accountToDelete?.accName}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsConfirmDeleteModalOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                  Yes, delete account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="mb-6 flex items-center space-x-2 p-3 bg-background dark:bg-dark-background rounded-lg shadow-sm border border-border dark:border-dark-border">
            <Input 
              type="text" 
              placeholder="Search accounts (Sl No, Name, Type...)" 
              className="flex-grow focus:ring-accent dark:focus:ring-dark-accent border-input dark:border-dark-input focus:border-primary dark:focus:border-dark-primary"
              value={searchTerm}
              onChange={handleSearchChange} 
            />
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary-hover dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary-hover"
              onClick={() => toast({ title: "Search Updated", description: `Displaying results for "${searchTerm}"` })}
            >
              <Search size={18} className="mr-2" /> Search
            </Button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-border dark:border-dark-border shadow-md">
            <table className="w-full min-w-[800px] text-sm text-left text-foreground dark:text-dark-foreground">
              <thead className="text-xs text-primary dark:text-dark-primary uppercase bg-muted/50 dark:bg-dark-muted/50">
                <tr>
                  <SortableHeader columnKey="sl" sortConfig={sortConfig} requestSort={requestSort} className="w-16">Sl</SortableHeader>
                  <SortableHeader columnKey="accNum" sortConfig={sortConfig} requestSort={requestSort}>Acc. No.</SortableHeader>
                  <SortableHeader columnKey="accName" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[250px]">Account Name</SortableHeader>
                  <SortableHeader columnKey="accType" sortConfig={sortConfig} requestSort={requestSort}>Type</SortableHeader>
                  <SortableHeader columnKey="balance" sortConfig={sortConfig} requestSort={requestSort} isTextRight={true}>Balance</SortableHeader>
                  <th scope="col" className="px-4 py-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredAccounts.map((account) => (
                  <tr key={account.id} className="bg-card dark:bg-dark-card border-b border-border dark:border-dark-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-dark-muted/30 transition-colors duration-150">
                    <td className="px-4 py-3">{account.sl}</td>
                    <td className="px-4 py-3 text-xs font-mono">{account.accNum}</td>
                    <td 
                      className="px-4 py-3 font-medium text-secondary dark:text-dark-secondary hover:underline cursor-pointer"
                      onClick={() => toast({ title: `View Ledger: ${account.accName}`, description: "Detailed ledger view coming soon."})}
                    >
                      {account.accName}
                    </td>
                    <td className="px-4 py-3">{account.accType}</td>
                    <td 
                      className="px-4 py-3 text-right font-semibold hover:underline cursor-pointer text-primary dark:text-dark-primary"
                      onClick={() => toast({ title: `View Ledger: ${account.accName}`, description: "Detailed ledger view coming soon."})}
                    >
                      {account.balanceFormatted}
                    </td>
                    <td className="px-4 py-3 text-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent h-8 w-8"
                        onClick={() => handleOpenModal(account)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive dark:text-red-400 hover:text-destructive/80 dark:hover:text-red-300 h-8 w-8"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
                 {sortedAndFilteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                      {searchTerm ? `No accounts found for "${searchTerm}".` : "No accounts found. Get started by adding an account!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChartOfAccounts;
