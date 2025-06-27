import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Search, Edit, Trash2, ArrowUpDown, User } from 'lucide-react';
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
import AddCustomerForm from '@/components/forms/AddCustomerForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialCustomersData = [
  { id: 'cust-001', name: 'Client Omega Corp.', proprietorName: 'Mr. O', customerNumber: 'C001', address: '123 Omega St', balance: 2800.00, openingBalance: 2800.00, openingBalanceDate: '2023-01-01' },
  { id: 'cust-002', name: 'Customer Zeta Ltd.', proprietorName: 'Ms. Z', customerNumber: 'C002', address: '456 Zeta Ave', balance: 0.00, openingBalance: 0.00, openingBalanceDate: '2023-01-01' },
  { id: 'cust-003', name: 'Patron Gamma Solutions', proprietorName: 'Dr. G', customerNumber: 'C003', address: '789 Gamma Rd', balance: 5120.75, openingBalance: 5120.75, openingBalanceDate: '2023-01-01' },
  { id: 'cust-004', name: 'Client Alpha Services', proprietorName: 'Prof. A', customerNumber: 'C004', address: '012 Alpha Blvd', balance: -300.00, openingBalance: -300.00, openingBalanceDate: '2023-01-01' },
];

const formatCustomerForDisplay = (customer) => ({
  ...customer,
  balanceFormatted: `${(customer.balance || 0).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${(customer.balance || 0) >= 0 ? '(Receivable)' : '(Payable)'}`,
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

const CustomerCenter = () => {
  const { toast } = useToast();
  const [customers, setCustomers] = useState(() => initialCustomersData.map(formatCustomerForDisplay));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers).map(formatCustomerForDisplay));
    } else {
      localStorage.setItem('customers', JSON.stringify(initialCustomersData));
    }
  }, []);

  const updateLocalStorage = (updatedCustomers) => {
    localStorage.setItem('customers', JSON.stringify(updatedCustomers.map(({balanceFormatted, ...rest}) => rest)));
  };

  const handleOpenModal = (customer = null) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCustomerToEdit(null);
  };

  const handleSaveCustomer = (customerData, isEdit) => {
    setCustomers(prevCustomers => {
      let updatedCustomers;
      if (isEdit) {
        updatedCustomers = prevCustomers.map(cust =>
          cust.id === customerData.id ? formatCustomerForDisplay({ ...cust, ...customerData, balance: customerData.openingBalance }) : cust
        );
      } else {
        const newCustomer = formatCustomerForDisplay({ ...customerData, balance: customerData.openingBalance });
        updatedCustomers = [...prevCustomers, newCustomer];
      }
      updateLocalStorage(updatedCustomers);
      return updatedCustomers;
    });
  };

  const handleDeleteCustomer = (customerId) => {
    const customer = customers.find(cust => cust.id === customerId);
    if (customer) {
      setCustomerToDelete(customer);
      setIsConfirmDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      const updatedCustomers = customers.filter(cust => cust.id !== customerToDelete.id);
      setCustomers(updatedCustomers);
      updateLocalStorage(updatedCustomers);
      toast({ title: "Customer Deleted", description: `${customerToDelete.name} has been deleted.`, variant: "destructive" });
      setIsConfirmDeleteModalOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleImportExcel = () => {
    toast({ title: "Import Customers from Excel", description: "This feature will be available soon.", duration: 3000 });
  };

  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredCustomers = useMemo(() => {
    let sortableItems = [...customers];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(customer =>
        Object.values(customer).some(val => String(val).toLowerCase().includes(term))
      );
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (sortConfig.key === 'balance') {
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
  }, [searchTerm, sortConfig, customers]);

  return (
    <div className="space-y-6 p-1">
      <Card className="shadow-lg border-border dark:border-dark-border">
        <CardHeader className="bg-card dark:bg-dark-card rounded-t-lg p-4 md:p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <User size={28} className="mr-3 text-accent dark:text-dark-accent" /> Customer Center
            </CardTitle>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-primary dark:text-dark-primary border-primary dark:border-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 shadow-sm">
                    <PlusCircle size={20} className="mr-2" /> Add Customer
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
                  {customerToEdit ? 'Edit Customer' : 'Add New Customer'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground dark:text-dark-muted-foreground">
                  {customerToEdit ? 'Update customer details.' : 'Fill in the details to add a new customer.'}
                </DialogDescription>
              </DialogHeader>
              <AddCustomerForm 
                onSave={handleSaveCustomer} 
                onCancel={handleCloseModal} 
                initialData={customerToEdit}
                isEditMode={!!customerToEdit}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog open={isConfirmDeleteModalOpen} onOpenChange={setIsConfirmDeleteModalOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the customer
                  "{customerToDelete?.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsConfirmDeleteModalOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                  Yes, delete customer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="mb-6 flex items-center space-x-2 p-3 bg-background dark:bg-dark-background rounded-lg shadow-sm border border-border dark:border-dark-border">
            <Input 
              type="text" 
              placeholder="Search customers (Name, Balance...)" 
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
            <table className="w-full min-w-[600px] text-sm text-left text-foreground dark:text-dark-foreground">
              <thead className="text-xs text-primary dark:text-dark-primary uppercase bg-muted/50 dark:bg-dark-muted/50">
                <tr>
                  <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[250px]">Customer Name</SortableHeader>
                  <SortableHeader columnKey="balance" sortConfig={sortConfig} requestSort={requestSort} isTextRight={true}>Balance</SortableHeader>
                  <th scope="col" className="px-4 py-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredCustomers.map((customer) => (
                  <tr key={customer.id} className="bg-card dark:bg-dark-card border-b border-border dark:border-dark-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-dark-muted/30 transition-colors duration-150">
                    <td 
                      className="px-4 py-3 font-medium text-secondary dark:text-dark-secondary hover:underline cursor-pointer"
                      onClick={() => toast({ title: `View Ledger: ${customer.name}`, description: "Detailed customer ledger view coming soon."})}
                    >
                      {customer.name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{customer.balanceFormatted}</td>
                    <td className="px-4 py-3 text-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent h-8 w-8"
                        onClick={() => handleOpenModal(customer)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive dark:text-red-400 hover:text-destructive/80 dark:hover:text-red-300 h-8 w-8"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {sortedAndFilteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                      {searchTerm ? `No customers found for "${searchTerm}".` : "No customers found. Start by adding a customer!"}
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

export default CustomerCenter;
