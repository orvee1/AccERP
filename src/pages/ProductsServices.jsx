import React, { useState, useMemo, useEffect } from 'react';
import { PlusCircle, Search, Edit, Trash2, ArrowUpDown, FileDown, Star } from 'lucide-react';
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
import AddProductForm from '@/components/forms/AddProductForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const initialProductsData = [
  { sl: 1, id: 'PROD001', name: 'Standard Widget', code: 'PROD001', location: 'Warehouse A', costingPrice: 15.50, salesPrice: 25.00, openingQuantity: 150, units: [{ id: 1, name: 'pcs', factor: 1, isBase: true }], baseUnitName: 'pcs', openingQuantityDate: '2023-01-01', isService: false, category: 'Widgets', description: 'A standard quality widget.' },
  { sl: 2, id: 'PROD002', name: 'Premium Gadget', code: 'PROD002', location: 'Warehouse B', costingPrice: 49.99, salesPrice: 89.99, openingQuantity: 75, units: [{ id: 1, name: 'pcs', factor: 1, isBase: true }, {id: 2, name: 'box', factor: 5, isBase: false}], baseUnitName: 'pcs', openingQuantityDate: '2023-01-15', isService: false, category: 'Gadgets', description: 'A premium quality gadget with extra features.' },
  { sl: 3, id: 'SERV001', name: 'Consulting Hour', code: 'SERV001', location: 'N/A', costingPrice: 0, salesPrice: 100.00, openingQuantity: Infinity, units: [{ id: 1, name: 'hour', factor: 1, isBase: true }], baseUnitName: 'hour', openingQuantityDate: null, isService: true, category: 'Services', description: 'One hour of expert consulting.' },
];

const formatProductForDisplay = (product) => {
  const baseUnit = product.units?.find(u => u.isBase) || { name: 'N/A', factor: 1 };
  const qty = product.isService ? Infinity : (product.openingQuantity || 0);
  const cost = product.costingPrice || 0;
  const value = product.isService ? Infinity : qty * cost;

  return {
    ...product,
    avgCost: cost,
    qty: qty,
    value: value,
    avgCostFormatted: cost.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    qtyFormatted: product.isService ? 'N/A' : `${qty.toLocaleString('en-US')} ${baseUnit.name}`,
    valueFormatted: product.isService ? 'N/A' : value.toLocaleString('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    baseUnitName: baseUnit.name,
  };
};


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


const ProductsServices = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState(() => initialProductsData.map(formatProductForDisplay));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'sl', direction: 'ascending' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts).map(formatProductForDisplay));
    } else {
      localStorage.setItem('products', JSON.stringify(initialProductsData));
    }
  }, []);

  const updateLocalStorage = (updatedProducts) => {
    localStorage.setItem('products', JSON.stringify(updatedProducts.map(({avgCostFormatted, qtyFormatted, valueFormatted, ...rest}) => rest)));
  };

  const handleOpenModal = (product = null) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleSaveProduct = (productData, isEdit) => {
    setProducts(prevProducts => {
      let updatedProducts;
      if (isEdit) {
        updatedProducts = prevProducts.map(p =>
          p.id === productData.id ? formatProductForDisplay({ ...p, ...productData }) : p
        );
      } else {
        const newSl = prevProducts.length > 0 ? Math.max(...prevProducts.map(p => p.sl)) + 1 : 1;
        const newProduct = formatProductForDisplay({ ...productData, sl: newSl });
        updatedProducts = [...prevProducts, newProduct];
      }
      updateLocalStorage(updatedProducts);
      return updatedProducts;
    });
  };

  const handleDeleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setProductToDelete(product);
      setIsConfirmDeleteModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      const updatedProducts = products.filter(p => p.id !== productToDelete.id);
      setProducts(updatedProducts);
      updateLocalStorage(updatedProducts);
      toast({ title: "Product Deleted", description: `${productToDelete.name} has been deleted.`, variant: "destructive" });
      setIsConfirmDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleImportExcel = () => {
    toast({ title: "Import Products from Excel", description: "This feature will be available soon.", duration: 3000 });
  };

  const handleSearchChange = (event) => setSearchTerm(event.target.value);
  
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredProducts = useMemo(() => {
    let sortableItems = [...products];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(product => 
        Object.values(product).some(val => 
          String(val).toLowerCase().includes(term)
        )
      );
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        const numKeys = ['avgCost', 'qty', 'value', 'sl', 'costingPrice', 'openingQuantity', 'salesPrice'];
        if (numKeys.includes(sortConfig.key)) {
          aValue = aValue === Infinity ? (sortConfig.direction === 'ascending' ? Infinity : -Infinity) : (parseFloat(aValue) || 0);
          bValue = bValue === Infinity ? (sortConfig.direction === 'ascending' ? Infinity : -Infinity) : (parseFloat(bValue) || 0);
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
  }, [searchTerm, sortConfig, products]);

  return (
    <div className="space-y-6 p-1">
       <Card className="shadow-lg border-border dark:border-dark-border">
        <CardHeader className="bg-card dark:bg-dark-card rounded-t-lg p-4 md:p-6 border-b border-border dark:border-dark-border">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <CardTitle className="text-2xl md:text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
                    <Star size={28} className="mr-3 text-yellow-500 dark:text-yellow-400" /> Products & Services
                </CardTitle>
                <div className="flex space-x-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="text-primary dark:text-dark-primary border-primary dark:border-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 shadow-sm">
                        <PlusCircle size={20} className="mr-2" /> Add New
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card dark:bg-dark-card shadow-lg rounded-md border border-border dark:border-dark-border">
                    <DropdownMenuItem onClick={() => handleOpenModal(null)} className="text-foreground dark:text-dark-foreground hover:bg-primary/10 dark:hover:bg-dark-primary/10 cursor-pointer">
                        Create Product/Service
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleImportExcel} className="text-foreground dark:text-dark-foreground hover:bg-primary/10 dark:hover:bg-dark-primary/10 cursor-pointer">
                        <FileDown size={16} className="mr-2"/> Import from Excel
                    </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl bg-card dark:bg-dark-card text-foreground dark:text-dark-foreground border-border dark:border-dark-border shadow-2xl rounded-lg">
                <DialogHeader>
                    <DialogTitle className="text-primary dark:text-dark-primary text-2xl font-semibold">
                        {productToEdit ? 'Edit Product/Service' : 'Add New Product/Service'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground dark:text-dark-muted-foreground">
                    Fill in the details below. Fields marked with <span className="text-destructive dark:text-red-400">*</span> are required.
                    </DialogDescription>
                </DialogHeader>
                <AddProductForm 
                    onSave={handleSaveProduct} 
                    onCancel={handleCloseModal} 
                    initialData={productToEdit}
                    isEditMode={!!productToEdit}
                />
                </DialogContent>
            </Dialog>

            <AlertDialog open={isConfirmDeleteModalOpen} onOpenChange={setIsConfirmDeleteModalOpen}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the product/service
                    "{productToDelete?.name}".
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setIsConfirmDeleteModalOpen(false)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                    Yes, delete product/service
                    </AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="mb-6 flex items-center space-x-2 p-3 bg-background dark:bg-dark-background rounded-lg shadow-sm border border-border dark:border-dark-border">
                <Input 
                type="text" 
                placeholder="Search products/services (ID, Name, Base Unit...)" 
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
                    <SortableHeader columnKey="id" sortConfig={sortConfig} requestSort={requestSort}>ID</SortableHeader>
                    <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort} className="min-w-[200px]">Product Name</SortableHeader>
                    <SortableHeader columnKey="baseUnitName" sortConfig={sortConfig} requestSort={requestSort}>Base Unit</SortableHeader>
                    <SortableHeader columnKey="avgCost" sortConfig={sortConfig} requestSort={requestSort} isTextRight={true}>Cost (Base)</SortableHeader>
                    <SortableHeader columnKey="qty" sortConfig={sortConfig} requestSort={requestSort} isTextRight={true}>Quantity</SortableHeader>
                    <SortableHeader columnKey="value" sortConfig={sortConfig} requestSort={requestSort} isTextRight={true}>Value</SortableHeader>
                    <th scope="col" className="px-4 py-3 text-center w-28">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedAndFilteredProducts.map((product) => (
                    <tr key={product.id || product.sl} className="bg-card dark:bg-dark-card border-b border-border dark:border-dark-border last:border-b-0 hover:bg-muted/30 dark:hover:bg-dark-muted/30 transition-colors duration-150">
                        <td className="px-4 py-3">{product.sl}</td>
                        <td className="px-4 py-3 text-xs font-mono">{product.id}</td>
                        <td className="px-4 py-3 font-medium text-secondary dark:text-dark-secondary">{product.name}</td>
                        <td className="px-4 py-3">{product.baseUnitName}</td>
                        <td className="px-4 py-3 text-right">{product.avgCostFormatted}</td>
                        <td 
                        className="px-4 py-3 text-right font-semibold hover:underline cursor-pointer text-primary dark:text-dark-primary"
                        onClick={() => toast({ title: `Product Ledger: ${product.name}`, description: "Detailed product ledger view coming soon."})}
                        >
                        {product.qtyFormatted}
                        </td>
                        <td className="px-4 py-3 text-right font-bold">{product.valueFormatted}</td>
                        <td className="px-4 py-3 text-center space-x-1">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-secondary dark:text-dark-secondary hover:text-accent dark:hover:text-dark-accent h-8 w-8"
                            onClick={() => handleOpenModal(product)}
                        >
                            <Edit size={16} />
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive dark:text-red-400 hover:text-destructive/80 dark:hover:text-red-300 h-8 w-8"
                            onClick={() => handleDeleteProduct(product.id)}
                        >
                            <Trash2 size={16} />
                        </Button>
                        </td>
                    </tr>
                    ))}
                    {sortedAndFilteredProducts.length === 0 && (
                    <tr>
                        <td colSpan="8" className="text-center py-10 text-muted-foreground dark:text-dark-muted-foreground">
                        {searchTerm ? `No products or services found for "${searchTerm}".` : "No products or services found. Add some to get started!"}
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

export default ProductsServices;
