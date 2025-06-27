import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch'; 
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Trash2, Star, Save } from 'lucide-react';
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

const AddProductForm = ({ onSave, onCancel, initialData, isEditMode }) => {
  const { toast } = useToast();
  const [productName, setProductName] = useState('');
  const [productCode, setProductCode] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [costingPrice, setCostingPrice] = useState('');
  const [salesPrice, setSalesPrice] = useState('');
  const [openingQuantity, setOpeningQuantity] = useState('');
  const [isService, setIsService] = useState(false);
  
  const [units, setUnits] = useState([{ id: Date.now(), name: 'pcs', factor: 1, isBase: true }]);
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitFactor, setNewUnitFactor] = useState(1);
  const [originalId, setOriginalId] = useState(null);

  useEffect(() => {
    if (isEditMode && initialData) {
      setProductName(initialData.name || '');
      setProductCode(initialData.code || initialData.id || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || '');
      setCostingPrice(initialData.costingPrice?.toString() || '');
      setSalesPrice(initialData.salesPrice?.toString() || '');
      setOpeningQuantity(initialData.openingQuantity?.toString() || '');
      setIsService(initialData.isService || false);
      setUnits(initialData.units && initialData.units.length > 0 ? initialData.units : [{ id: Date.now(), name: 'pcs', factor: 1, isBase: true }]);
      setOriginalId(initialData.id || initialData.code);
    } else {
      resetForm();
    }
  }, [initialData, isEditMode]);

  const resetForm = () => {
    setProductName('');
    setProductCode('');
    setDescription('');
    setCategory('');
    setCostingPrice('');
    setSalesPrice('');
    setOpeningQuantity('');
    setIsService(false);
    setUnits([{ id: Date.now(), name: 'pcs', factor: 1, isBase: true }]);
    setNewUnitName('');
    setNewUnitFactor(1);
    setOriginalId(null);
  };

  const handleAddUnit = () => {
    if (!newUnitName.trim() || newUnitFactor <= 0) {
      toast({ title: "Invalid Unit", description: "Please provide a valid unit name and factor.", variant: "destructive" });
      return;
    }
    if (units.find(u => u.name.toLowerCase() === newUnitName.trim().toLowerCase())) {
      toast({ title: "Duplicate Unit", description: "This unit name already exists.", variant: "destructive" });
      return;
    }
    setUnits([...units, { id: Date.now(), name: newUnitName.trim(), factor: parseFloat(newUnitFactor), isBase: units.length === 0 }]);
    setNewUnitName('');
    setNewUnitFactor(1);
  };

  const handleRemoveUnit = (idToRemove) => {
    if (units.length === 1) {
      toast({ title: "Cannot Remove", description: "At least one unit must be defined.", variant: "destructive" });
      return;
    }
    const unitToRemove = units.find(u => u.id === idToRemove);
    if (unitToRemove && unitToRemove.isBase && units.length > 1) {
      toast({ title: "Cannot Remove Base Unit", description: "Please set another unit as base before removing.", variant: "destructive" });
      return;
    }
    setUnits(units.filter(unit => unit.id !== idToRemove));
  };

  const handleSetBaseUnit = (idToSetAsBase) => {
    setUnits(units.map(unit => ({ ...unit, isBase: unit.id === idToSetAsBase })));
  };

  const getBaseUnitName = () => {
    const baseUnit = units.find(u => u.isBase);
    return baseUnit ? baseUnit.name : 'N/A';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName.trim()) {
      toast({ title: "Validation Error", description: "Product name is required.", variant: "destructive" });
      return;
    }
    if (units.filter(u => u.isBase).length !== 1) {
      toast({ title: "Validation Error", description: "Exactly one unit must be set as the base unit.", variant: "destructive" });
      return;
    }

    const baseUnit = units.find(u => u.isBase);

    const productData = {
      id: originalId || `prod-${Date.now()}`,
      name: productName,
      code: productCode || (originalId ? originalId.split('-')[1] || String(Date.now()).slice(-4) : `P${String(Date.now()).slice(-4)}`),
      description,
      category,
      costingPrice: parseFloat(costingPrice) || 0,
      salesPrice: parseFloat(salesPrice) || 0,
      openingQuantity: isService ? Infinity : (parseFloat(openingQuantity) || 0),
      isService,
      units: units.map(u => ({...u, factor: parseFloat(u.factor)})),
      baseUnitName: baseUnit.name,
      // Preserve sl if editing
      sl: isEditMode && initialData ? initialData.sl : undefined,
      location: isEditMode && initialData ? initialData.location : 'Warehouse A', // Default or preserve
    };

    onSave(productData, isEditMode);
    
    toast({ 
        title: `Product ${isEditMode ? 'Updated' : 'Added'}`, 
        description: `${productName} has been successfully ${isEditMode ? 'updated' : 'added'}.`, 
        className: "bg-green-500 text-white dark:bg-green-600 dark:text-white" 
    });
    onCancel(); // Close dialog after save
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-1">
      <DialogHeader className="hidden">
        <DialogTitle>{isEditMode ? 'Edit Product/Service' : 'Add New Product/Service'}</DialogTitle>
        <DialogDescription>
          {isEditMode ? 'Update the details of the existing product or service.' : 'Fill in the details to add a new product or service to your inventory.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="productName" className="font-semibold">Product/Service Name <span className="text-destructive">*</span></Label>
          <Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Premium Widget, Hourly Consulting" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="productCode" className="font-semibold">Product Code/SKU</Label>
          <Input 
            id="productCode" 
            value={productCode} 
            onChange={(e) => setProductCode(e.target.value)} 
            placeholder="Auto-generated if blank" 
            disabled={isEditMode}
          />
          {isEditMode && <p className="text-xs text-muted-foreground">Product code cannot be changed after creation.</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="font-semibold">Description</Label>
        <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of the product/service" />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="category" className="font-semibold">Category</Label>
        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Electronics, Services, Materials" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="costingPrice" className="font-semibold">
            Costing Price (per <span className="text-accent dark:text-dark-accent">{getBaseUnitName()}</span>)
          </Label>
          <Input 
            id="costingPrice" 
            type="number" 
            value={costingPrice} 
            onChange={(e) => setCostingPrice(e.target.value)} 
            placeholder="0.00" 
            min="0" 
            step="0.01"
            disabled={isEditMode} 
            className={isEditMode ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}
          />
           {isEditMode && <p className="text-xs text-muted-foreground">Costing price cannot be changed after creation.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="salesPrice" className="font-semibold">
            Default Sales Price (per <span className="text-accent dark:text-dark-accent">{getBaseUnitName()}</span>)
          </Label>
          <Input id="salesPrice" type="number" value={salesPrice} onChange={(e) => setSalesPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" />
        </div>
      </div>
      
      <div className="flex items-center space-x-3 pt-2">
        <Switch id="isService" checked={isService} onCheckedChange={setIsService} />
        <Label htmlFor="isService" className="font-semibold">This is a service item (does not track quantity)</Label>
      </div>

      {!isService && (
        <div className="space-y-2 pt-2">
          <Label htmlFor="openingQuantity" className="font-semibold">
            Opening Quantity (in <span className="text-accent dark:text-dark-accent">{getBaseUnitName()}</span>)
          </Label>
          <Input 
            id="openingQuantity" 
            type="number" 
            value={openingQuantity} 
            onChange={(e) => setOpeningQuantity(e.target.value)} 
            placeholder="0" 
            min="0"
            disabled={isEditMode}
            className={isEditMode ? 'disabled:opacity-70 disabled:cursor-not-allowed' : ''}
          />
          {isEditMode && <p className="text-xs text-muted-foreground">Opening quantity cannot be changed after creation.</p>}
        </div>
      )}

      {!isService && (
        <div className="space-y-4 pt-4 border-t border-border dark:border-dark-border mt-6">
          <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">Manage Units of Measure</h3>
          <div className="p-4 bg-muted/50 dark:bg-dark-muted/50 rounded-md space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="newUnitName">New Unit Name</Label>
                <Input id="newUnitName" value={newUnitName} onChange={(e) => setNewUnitName(e.target.value)} placeholder="e.g., Dozen, Box" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="newUnitFactor">Factor (to Base Unit)</Label>
                <Input id="newUnitFactor" type="number" value={newUnitFactor} onChange={(e) => setNewUnitFactor(e.target.value)} placeholder="e.g., 12" min="0.001" step="any"/>
              </div>
              <Button type="button" onClick={handleAddUnit} className="sm:self-end bg-secondary hover:bg-secondary-hover dark:bg-dark-secondary dark:hover:bg-dark-secondary-hover text-secondary-foreground dark:text-dark-secondary-foreground">
                <PlusCircle size={18} className="mr-2"/> Add Unit
              </Button>
            </div>
            
            <AnimatePresence>
              {units.length > 0 && (
                <motion.ul 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-2 pt-2"
                >
                  {units.map(unit => (
                    <motion.li 
                      key={unit.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      className="flex items-center justify-between p-2.5 bg-background dark:bg-dark-background rounded-md shadow-sm border border-border dark:border-dark-border"
                    >
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => handleSetBaseUnit(unit.id)} className={`mr-2 h-7 w-7 ${unit.isBase ? 'text-yellow-500 dark:text-yellow-400' : 'text-muted-foreground dark:text-dark-muted-foreground'}`}>
                          <Star size={18} fill={unit.isBase ? "currentColor" : "none"}/>
                        </Button>
                        <span className="font-medium text-foreground dark:text-dark-foreground">{unit.name}</span>
                        <span className="text-sm text-muted-foreground dark:text-dark-muted-foreground ml-2">({unit.factor} to Base)</span>
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveUnit(unit.id)} className="text-destructive dark:text-red-400 hover:text-destructive/80 h-7 w-7">
                        <Trash2 size={16} />
                      </Button>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
            <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground pt-1">
              Click the star <Star size={12} className="inline text-yellow-500"/> to set a unit as the base unit. All other unit factors are relative to this base unit.
            </p>
          </div>
        </div>
      )}

      <DialogFooter className="pt-8">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        </DialogClose>
        <Button type="submit" className="bg-primary hover:bg-primary-hover dark:bg-dark-primary dark:hover:bg-dark-primary-hover text-primary-foreground dark:text-dark-primary-foreground">
          <Save size={18} className="mr-2"/> {isEditMode ? 'Update Product' : 'Save Product'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default AddProductForm;
