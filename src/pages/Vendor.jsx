import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Search, Edit, Trash2, ArrowUpDown, Truck } from 'lucide-react';
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
import AddVendorForm from '@/components/forms/AddVendorForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialVendorsData = [
  { id: 'vend-001', name: 'Supplier Alpha Inc.', proprietorName: 'Mr. A', vendorNumber: 'V001', address: '123 Supply St', balance: 1500.00, openingBalance: 1500.00, openingBalanceDate: '2023-01-01' },
  { id: 'vend-002', name: 'Service Provider Beta', proprietorName: 'Ms. B', vendorNumber: 'V002', address: '456 Service Ave', balance: 0.00, openingBalance: 0.00, openingBalanceDate: '2023-01-01' },
  { id: 'vend-003', name: 'Materials Inc.', proprietorName: 'Dr. M', vendorNumber: 'V003', address: '789 Material Rd', balance: 3250.50, openingBalance: 3250.50, openingBalanceDate: '2023-01-01' },
  { id: 'vend-004', name: 'Vendor Gamma Co.', proprietorName: 'Prof. G', vendorNumber: 'V004', address: '012 Gamma Blvd', balance: -500.00, openingBalance: -500.00, openingBalanceDate: '2023-01-01' },
];

const formatVendorForDisplay = (vendor) => ({
  ...vendor,
  balanceFormatted: `${(vendor.balance || 0).toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${(vendor.balance || 0) >= 0 ? '(Payable)' : '(Receivable)'}`,
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

const Vendor = () => {
  const { toast } = useToast();
  const [vendors, setVendors] = useState(() => initialVendorsData.map(formatVendorForDisplay));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vendorToEdit, setVendorToEdit] = useState(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  useEffect(() => {
    const storedVendors = localStorage.getItem('vendors');
    if (storedVendors) {
      setVendors(JSON.parse(storedVendors).map(formatVendorForDisplay));
    } else {
      localStorage.setItem('vendors', JSON.stringify(initialVendorsData));
    }
  }, []);

  const updateLocalStorage = (updatedVendors) => {
    localStorage.setItem('vendors', JSON.stringify(updatedVendors.map(({balanceFormatted, ...rest}) => rest)));
  };

  const handleOpenModal = (vendor = null) => {
    setVendorToEdit(vendor);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setVendorToEdit(null);
  };

  const handleSaveVendor = (vendorData, isEdit) => {
    setVendors(prevVendors => {
      let updatedVendors;
      if (isEdit) {
        updatedVendors = prevVendors.map(vend =>
          vend.id === vendorData.id ? formatVendorForDisplay({ ...vend, ...vendorData, balance: vendorData.openingBalance }) : vend
        );
      } else {
        const newVendor = formatVendorForDisplay({ ...vendorData, balance: vendorData.openingBalance });
        updatedVendors = [...prevVendors, newVendor];
      }
      updateLocalStorage(updatedVendors);
      return updatedVendors;
    });
  };

  const handleDeleteVendor = (vendorId) => {
    const vendor = vendors.find(vend => vend.id === vendorId);
    if (vendor) {
      setVendorToDelete(vendor);
      setIsConfirmDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (vendorToDelete) {
      const updatedVendors = vendors.filter(vend => vend.id !== vendorToDelete.id);
      setVendors(updatedVendors);
      updateLocalStorage(updatedVendors);
      toast({ title: "Vendor Deleted", description: `${vendorToDelete.name} has been deleted.`, variant: "destructive" });
      setIsConfirmDeleteModalOpen(false);
      setVendorToDelete(null);
    }
  };

  const handleImportExcel = () => {
    toast({ title: "Import Vendors from Excel", description: "This feature will be available soon.", duration: 3000 });
  };

  const handleSearchChange = (event) => setSearchTerm(event.target.value);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredVendors = useMemo(() => {
    let sortableItems = [...vendors];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(vendor =>
        Object.values(vendor).some(val => String(val).toLowerCase().includes(term))
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
  }, [searchTerm, sortConfig, vendors]);

  return (
    <div className="space-y-6 p-1">
      <Card className="shadow-lg border-border dark:border-dark-border">
        <CardHeader className="bg-card dark:bg-dark-card rounded-t-lg p-4 md:p-6 border-b border-border dark:border-dark-border">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <CardTitle className="text-2xl md:text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
              <Truck size={28} className="mr-3 text-accent dark:text-dark-accent" /> Vendors
            </CardTitle>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="text-primary dark:text-dark-primary border-primary dark:border-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 shadow-sm">
                    <PlusCircle size={20} className="mr-2" /> Add Vendor
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
                  {vendorToEdit ? 'Edit Vendor' : 'Add New Vendor'}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground dark:text-dark-muted-foreground">
                  {vendorToEdit ? 'Update vendor details.' : 'Fill in the details to add a new vendor.'}
                </DialogDescription>
              </DialogHeader>
              <AddVendorForm 
                onSave={handleSaveVendor} 
                onCancel={handleCloseModal} 
                initialData={vendorToEdit}
                isEditMode={!!vendorToEdit}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog open={isConfirmDeleteModalOpen} onOpenChange={setIsConfirmDeleteModalOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the vendor
                  "{vendorToDelete?.name}".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsConfirmDeleteModalOpen(false)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                  Yes, delete vendor
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="mb-6 flex items-center space-x-2 p-3 bg-background dark:bg-dark-background rounded-lg shadow-sm border border-border dark:border-dark-border">
            <Input 
              type="text" 
              placeholder="Search vendors (Name, Balance...)" 
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
                  <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[250px]">Vendor Name</SortableHeader>
                  <SortableHeader columnKey="balance" sortConfig={sortConfig} requestSort={requestSort} isTextRight={true}>Balance</SortableHeader>
                  <th scope="col" className="px-4 py-3 text-center w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="bg-card dark:bg-dark-card border-b border-border dark:border-dark-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-dark-muted/30 transition-colors duration-150">
                    <td 
                      className="px-4 py-3 font-medium text-secondary dark:text-dark-secondary hover:underline cursor-pointer"
                      onClick={() => toast({ title: `View Ledger: ${vendor.name}`, description: "Detailed vendor ledger view coming soon."})}
                    >
                      {vendor.name}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">{vendor.balanceFormatted}</td>
                    <td className="px-4 py-3 text-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent h-8 w-8"
                        onClick={() => handleOpenModal(vendor)}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive dark:text-red-400 hover:text-destructive/80 dark:hover:text-red-300 h-8 w-8"
                        onClick={() => handleDeleteVendor(vendor.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {sortedAndFilteredVendors.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                      {searchTerm ? `No vendors found for "${searchTerm}".` : "No vendors found. Add your first vendor!"}
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

export default Vendor;
