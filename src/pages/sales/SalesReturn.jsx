import React, { useState, useEffect, useCallback } from 'react';
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
import { PlusCircle, Trash2, Save, RotateCcw, PackagePlus as PackageIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

// Shared data and functions
const initialCustomers = [
  { id: 'cust001', name: 'Client Omega Corp.' },
  { id: 'cust002', name: 'Customer Zeta Ltd.' },
  { id: 'cust003', name: 'Patron Gamma Solutions' },
];

const getProductsFromStorage = () => {
  const storedProducts = localStorage.getItem('products');
  if (storedProducts) {
    try {
      const parsed = JSON.parse(storedProducts);
      return parsed.map(p => ({
        ...p,
        units: p.units?.map(u => ({ ...u, id: u.id || `${p.id}-${u.name}-${Date.now()}` })) || [],
        openingQuantity: p.isService ? Infinity : (p.openingQuantity || 0),
      }));
    } catch (e) {
      console.error("Failed to parse products from localStorage", e);
      return []; 
    }
  }
   return [ 
    { 
      id: 'PROD001', name: 'Standard Widget', costingPrice: 15.50, openingQuantity: 100, isService: false,
      units: [
        { id: `PROD001-pcs-${Date.now()}`, name: 'pcs', factor: 1, isBase: true },
        { id: `PROD001-dozen-${Date.now()}`, name: 'dozen', factor: 12, isBase: false },
      ], baseUnitName: 'pcs'
    },
  ];
};


const SalesReturn = () => {
  const { toast } = useToast();
  const [customer, setCustomer] = useState('');
  const [returnDate, setReturnDate] = useState(new Date());
  const [returnNumber, setReturnNumber] = useState(`SRTN-${String(Date.now()).slice(-6)}`);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState(''); // Optional for returns, but can be used for credit note terms
  const [availableProducts, setAvailableProducts] = useState([]);

  useEffect(() => {
    setAvailableProducts(getProductsFromStorage());
  }, []);
  
  const [lineItems, setLineItems] = useState([
    { 
      id: Date.now(), 
      productId: '', 
      productDetails: null,
      quantityInput: 1,
      quantityUnitId: '',
      quantityInBase: 1, 
      billingUnitId: '', 
      rateForBillingUnit: 0, 
      discountPercent: 0, 
      discountAmount: 0,
      totalPrice: 0 
    },
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [totalDiscountDisplay, setTotalDiscountDisplay] = useState('$0.00');
  const [taxAmount, setTaxAmount] = useState(0); 
  const [grandTotal, setGrandTotal] = useState(0);

  const calculateLineItemTotal = useCallback((item) => {
    let calculatedQuantityInBase = parseFloat(item.quantityInput) || 0;
    if (item.productDetails && item.quantityUnitId && item.productDetails.units) {
      const selectedQuantityUnit = item.productDetails.units.find(u => u.id === item.quantityUnitId);
      if (selectedQuantityUnit && selectedQuantityUnit.factor > 0) {
        calculatedQuantityInBase = (parseFloat(item.quantityInput) || 0) * selectedQuantityUnit.factor;
      }
    }
  
    let itemRawTotal = 0;
    if (item.productDetails && item.billingUnitId && item.productDetails.units) {
      const selectedBillingUnit = item.productDetails.units.find(u => u.id === item.billingUnitId);
      if (selectedBillingUnit && selectedBillingUnit.factor > 0) {
        const ratePerBaseUnit = (parseFloat(item.rateForBillingUnit) || 0) / selectedBillingUnit.factor;
        itemRawTotal = calculatedQuantityInBase * ratePerBaseUnit;
      }
    }
  
    let itemDiscountAmountValue = 0;
    if (parseFloat(item.discountAmount) > 0) {
      itemDiscountAmountValue = parseFloat(item.discountAmount);
    } else if (parseFloat(item.discountPercent) > 0) {
      itemDiscountAmountValue = itemRawTotal * (parseFloat(item.discountPercent) / 100);
    }
    
    const totalPrice = parseFloat((itemRawTotal - itemDiscountAmountValue).toFixed(2));
    return { ...item, quantityInBase: calculatedQuantityInBase, totalPrice, itemRawTotal };
  }, []);


  useEffect(() => {
    let currentSubtotal = 0;
    let currentTotalDiscountValue = 0;
    const calculatedItems = lineItems.map(item => calculateLineItemTotal(item));

    calculatedItems.forEach(item => {
      currentSubtotal += item.itemRawTotal || 0;
      if (item.discountAmount > 0) {
        currentTotalDiscountValue += item.discountAmount;
      } else if (item.discountPercent > 0) {
        currentTotalDiscountValue += (item.itemRawTotal || 0) * (item.discountPercent / 100);
      }
    });
    
    setSubtotal(parseFloat(currentSubtotal.toFixed(2)));
    setTotalDiscountDisplay(`-${currentTotalDiscountValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`);
  }, [lineItems, calculateLineItemTotal]);

  useEffect(() => {
     const currentTotalDiscountValue = lineItems.reduce((acc, item) => {
        const calculatedItem = calculateLineItemTotal(item);
        let itemDiscountValue = 0;
        if (calculatedItem.discountAmount > 0) itemDiscountValue = calculatedItem.discountAmount;
        else if (calculatedItem.discountPercent > 0) itemDiscountValue = (calculatedItem.itemRawTotal || 0) * (calculatedItem.discountPercent / 100);
        return acc + itemDiscountValue;
    },0);
    const calculatedGrandTotal = subtotal - currentTotalDiscountValue + taxAmount;
    setGrandTotal(parseFloat(calculatedGrandTotal.toFixed(2)));
  }, [subtotal, taxAmount, lineItems, calculateLineItemTotal]);


  const handleAddLineItem = () => {
    setLineItems([...lineItems, { 
      id: Date.now(), productId: '', productDetails: null, 
      quantityInput: 1, quantityUnitId: '', quantityInBase: 1, 
      billingUnitId: '', rateForBillingUnit: 0, 
      discountPercent: 0, discountAmount: 0, totalPrice: 0 
    }]);
  };

  const handleRemoveLineItem = (idToRemove) => {
    setLineItems(lineItems.filter((item) => item.id !== idToRemove));
  };

  const handleLineItemChange = (itemId, field, value) => {
    setLineItems(prevLineItems => 
      prevLineItems.map(item => {
        if (item.id !== itemId) return item;
        let updatedItemState = { ...item };

        if (field === 'productId') {
          const selectedProduct = availableProducts.find(p => p.id === value);
          if (selectedProduct) {
            updatedItemState.productId = value;
            updatedItemState.productDetails = selectedProduct;
            const baseUnit = selectedProduct.units?.find(u => u.isBase);
            updatedItemState.quantityUnitId = baseUnit ? baseUnit.id : (selectedProduct.units?.[0]?.id || '');
            updatedItemState.billingUnitId = baseUnit ? baseUnit.id : (selectedProduct.units?.[0]?.id || '');
             if (baseUnit && selectedProduct.salesPrice) { // Use salesPrice for returns as well, or costing if no salesPrice
                 const billingUnitForRate = selectedProduct.units.find(u=>u.id === updatedItemState.billingUnitId);
                 updatedItemState.rateForBillingUnit = (selectedProduct.salesPrice || selectedProduct.costingPrice || 0) * (billingUnitForRate?.factor || 1);
            } else {
                 updatedItemState.rateForBillingUnit = 0;
            }
            updatedItemState.quantityInput = 1;
          } else {
            updatedItemState = { ...updatedItemState, productId: '', productDetails: null, quantityUnitId: '', billingUnitId: '', rateForBillingUnit: 0, quantityInput: 1 };
          }
        } else if (field === 'quantityUnitId' || field === 'billingUnitId') {
            updatedItemState[field] = value;
        } else if (field === 'quantityInput') {
          updatedItemState.quantityInput = parseFloat(value) >= 0 ? parseFloat(value) : 0;
        } else if (field === 'rateForBillingUnit') {
          updatedItemState[field] = parseFloat(value) || 0;
        } else if (field === 'discountPercent') {
          const percent = parseFloat(value) || 0;
          updatedItemState.discountPercent = percent;
          if (percent > 0) updatedItemState.discountAmount = 0; 
        } else if (field === 'discountAmount') {
          const amount = parseFloat(value) || 0;
          updatedItemState.discountAmount = amount;
          if (amount > 0) updatedItemState.discountPercent = 0; 
        } else {
          updatedItemState[field] = value;
        }
        
        let tempQuantityInBase = parseFloat(updatedItemState.quantityInput) || 0;
        if (updatedItemState.productDetails && updatedItemState.quantityUnitId && updatedItemState.productDetails.units) {
            const selectedQuantityUnit = updatedItemState.productDetails.units.find(u => u.id === updatedItemState.quantityUnitId);
            if (selectedQuantityUnit && selectedQuantityUnit.factor > 0) {
                tempQuantityInBase = (parseFloat(updatedItemState.quantityInput) || 0) * selectedQuantityUnit.factor;
            }
        }
        updatedItemState.quantityInBase = tempQuantityInBase;
        return calculateLineItemTotal(updatedItemState);
      })
    );
  };
  
  const handleSaveReturn = (isDraft = false) => {
    if (!customer) {
      toast({ title: "Validation Error", description: "Please select a customer.", variant: "destructive" });
      return;
    }
    if (lineItems.some(item => !item.productId || item.totalPrice === 0 && item.quantityInput > 0)) { 
       toast({ title: "Validation Error", description: "Please ensure all line items have a product, valid quantity, units, and rate leading to a price.", variant: "destructive" });
       return;
    }
    if (lineItems.length === 0 || lineItems.every(item => item.quantityInput === 0)) {
        toast({ title: "Validation Error", description: "Cannot save an empty return or a return with all zero quantities.", variant: "destructive" });
        return;
    }
    
    const finalLineItems = lineItems.filter(li => li.quantityInput > 0).map(li => calculateLineItemTotal(li));

    if (finalLineItems.length === 0) {
        toast({ title: "Validation Error", description: "Cannot save a return with no valid line items.", variant: "destructive" });
        return;
    }

    const calculatedSubtotal = finalLineItems.reduce((acc, item) => acc + (item.itemRawTotal || 0), 0);
    const calculatedTotalDiscount = finalLineItems.reduce((acc, item) => {
      let itemDiscount = 0;
      if(item.discountAmount > 0) itemDiscount = item.discountAmount;
      else if (item.discountPercent > 0) itemDiscount = (item.itemRawTotal || 0) * (item.discountPercent / 100);
      return acc + itemDiscount;
    }, 0);

    const returnData = {
      customer, returnNumber, returnDate,
      lineItems: finalLineItems.map(li => ({
            productId: li.productId, productName: li.productDetails?.name,
            quantityInput: li.quantityInput, quantityUnitId: li.quantityUnitId,
            quantityUnitName: li.productDetails?.units.find(u=>u.id === li.quantityUnitId)?.name,
            quantityUnitFactor: li.productDetails?.units.find(u=>u.id === li.quantityUnitId)?.factor,
            calculatedQuantityInBase: li.quantityInBase, baseUnitName: li.productDetails?.baseUnitName,
            billingUnitId: li.billingUnitId,
            billingUnitName: li.productDetails?.units.find(u=>u.id === li.billingUnitId)?.name,
            billingUnitFactor: li.productDetails?.units.find(u=>u.id === li.billingUnitId)?.factor,
            rateForBillingUnit: li.rateForBillingUnit,
            discountPercent: li.discountPercent, discountAmount: li.discountAmount,
            itemRawTotal: li.itemRawTotal,
            calculatedPrice: li.totalPrice,
      })), 
      subtotal: calculatedSubtotal, 
      totalDiscount: calculatedTotalDiscount, 
      taxAmount, 
      grandTotal: calculatedSubtotal - calculatedTotalDiscount + taxAmount, 
      notes, terms, isDraft
    };
    console.log("Sales Return Data: ", JSON.stringify(returnData, null, 2));

    const existingReturns = JSON.parse(localStorage.getItem('salesReturns') || '[]');
    localStorage.setItem('salesReturns', JSON.stringify([...existingReturns, returnData]));

    // Update product stock (increase stock for sales returns)
    const updatedProducts = availableProducts.map(p => {
        const itemReturned = returnData.lineItems.find(li => li.productId === p.id);
        if (itemReturned && p.openingQuantity !== Infinity) {
            return { ...p, openingQuantity: p.openingQuantity + itemReturned.calculatedQuantityInBase };
        }
        return p;
    });
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setAvailableProducts(updatedProducts);

    toast({ title: "Sales Return Saved", description: `Return ${returnNumber} has been ${isDraft ? 'saved as draft' : 'saved'}. Stock updated.`, className: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 border-green-300 dark:border-green-600' });
  };

  return (
    <div className="space-y-6 p-1 md:p-2">
      <Card className="shadow-xl border-border dark:border-dark-border bg-card dark:bg-dark-card">
        <CardHeader className="p-6 border-b border-border dark:border-dark-border">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                 <CardTitle className="text-3xl font-bold text-primary dark:text-dark-primary flex items-center">
                    <RotateCcw size={32} className="mr-3 text-accent dark:text-dark-accent" /> New Sales Return
                </CardTitle>
                <div className="text-muted-foreground dark:text-dark-muted-foreground font-mono text-sm bg-muted dark:bg-dark-muted px-2 py-1 rounded self-start sm:self-center">
                    {returnNumber}
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <div className="grid md:grid-cols-2 gap-6"> {/* Simplified header for returns */}
            <div className="space-y-2">
              <Label htmlFor="customer" className="font-semibold">Customer <span className="text-destructive dark:text-red-400">*</span></Label>
              <Select onValueChange={setCustomer} value={customer}>
                <SelectTrigger id="customer"><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>{initialCustomers.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="returnDate" className="font-semibold">Return Date</Label>
              <DatePicker date={returnDate} setDate={setReturnDate}/>
            </div>
          </div>

          <div className="overflow-x-auto bg-background dark:bg-dark-background p-4 rounded-lg border border-border dark:border-dark-border shadow-inner">
             <table className="w-full min-w-[1300px]">
              <thead className="border-b-2 border-primary dark:border-dark-primary">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-primary dark:text-dark-primary w-[18%]">Product/Service</th>
                  <th className="p-3 text-left text-sm font-semibold text-primary dark:text-dark-primary w-[7%]">Quantity</th>
                  <th className="p-3 text-left text-sm font-semibold text-primary dark:text-dark-primary w-[9%]">Qty Unit</th>
                  <th className="p-3 text-left text-sm font-semibold text-primary dark:text-dark-primary w-[11%]">Rate (Billing Unit)</th>
                  <th className="p-3 text-left text-sm font-semibold text-primary dark:text-dark-primary w-[11%]">Billing Unit</th>
                  <th className="p-3 text-left text-sm font-semibold text-primary dark:text-dark-primary w-[7%]">Disc (%)</th>
                  <th className="p-3 text-left text-sm font-semibold text-primary dark:text-dark-primary w-[9%]">Disc Amt</th>
                  <th className="p-3 text-right text-sm font-semibold text-primary dark:text-dark-primary w-[13%]">Total Price</th>
                  <th className="p-3 text-center text-sm font-semibold text-primary dark:text-dark-primary w-[5%]"></th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b border-border dark:border-dark-border last:border-b-0 hover:bg-muted/50 dark:hover:bg-dark-muted/50 transition-colors">
                    <td className="p-2">
                      <Select value={item.productId} onValueChange={(value) => handleLineItemChange(item.id, 'productId', value)}>
                        <SelectTrigger className="text-sm"><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>{availableProducts.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <Input type="number" value={item.quantityInput} onChange={(e) => handleLineItemChange(item.id, 'quantityInput', e.target.value)} placeholder="1" className="w-full text-sm" min="0" step="any"/>
                    </td>
                    <td className="p-2">
                       <Select value={item.quantityUnitId} onValueChange={(value) => handleLineItemChange(item.id, 'quantityUnitId', value)} disabled={!item.productDetails}>
                         <SelectTrigger className="text-sm"><SelectValue placeholder="Unit" /></SelectTrigger>
                         <SelectContent>{item.productDetails?.units?.map(u => (<SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>))}</SelectContent>
                       </Select>
                    </td>
                    <td className="p-2">
                      <Input type="number" value={item.rateForBillingUnit} onChange={(e) => handleLineItemChange(item.id, 'rateForBillingUnit', e.target.value)} placeholder="0.00" className="w-full text-sm" min="0" step="0.01"/>
                    </td>
                     <td className="p-2">
                       <Select value={item.billingUnitId} onValueChange={(value) => handleLineItemChange(item.id, 'billingUnitId', value)} disabled={!item.productDetails}>
                         <SelectTrigger className="text-sm"><SelectValue placeholder="Unit" /></SelectTrigger>
                         <SelectContent>{item.productDetails?.units?.map(u => (<SelectItem key={u.id} value={u.id}>{u.name} ({u.factor} {item.productDetails?.baseUnitName})</SelectItem>))}</SelectContent>
                       </Select>
                    </td>
                    <td className="p-2">
                      <Input type="number" value={item.discountPercent} onChange={(e) => handleLineItemChange(item.id, 'discountPercent', e.target.value)} placeholder="0" className="w-full text-sm" min="0" max="100" disabled={!!item.discountAmount && item.discountAmount > 0}/>
                    </td>
                    <td className="p-2">
                      <Input type="number" value={item.discountAmount} onChange={(e) => handleLineItemChange(item.id, 'discountAmount', e.target.value)} placeholder="0.00" className="w-full text-sm" min="0" step="0.01" disabled={!!item.discountPercent && item.discountPercent > 0}/>
                    </td>
                    <td className="p-2 text-right text-sm font-medium">
                      {(item.totalPrice || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </td>
                    <td className="p-2 text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveLineItem(item.id)} className="text-destructive dark:text-red-400 hover:text-destructive/80 h-8 w-8">
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Button onClick={handleAddLineItem} variant="outline" className="mt-4 text-accent dark:text-dark-accent border-accent dark:border-dark-accent hover:bg-accent/10 dark:hover:bg-dark-accent/10 shadow-sm">
              <PlusCircle size={18} className="mr-2" /> Add Line Item
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
             <div>
                <Label htmlFor="notes" className="font-semibold">Reason for Return/Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter reason for return or other relevant notes..." className="mt-1 min-h-[100px]" />
              </div>
            <div className="space-y-3 p-4 bg-muted/70 dark:bg-dark-muted/70 rounded-lg shadow-inner border border-border dark:border-dark-border">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal:</span>
                <span className="font-semibold">{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Discount:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{totalDiscountDisplay}</span>
              </div>
              <div className="flex justify-between items-center">
                <Label htmlFor="taxAmountReturn" className="font-medium">Tax Refund/Adjustment:</Label>
                 <Input id="taxAmountReturn" type="number" value={taxAmount} onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)} placeholder="0.00" className="w-28 text-sm text-right" min="0" step="0.01"/>
              </div>
              <hr className="border-border dark:border-dark-border my-2"/>
              <div className="flex justify-between items-center text-xl text-primary dark:text-dark-primary font-bold">
                <span>Total Credit Due:</span>
                <span>{grandTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
            </div>
          </div>
           <div className="space-y-2">
                <Label htmlFor="terms" className="font-semibold">Credit Note Terms</Label>
                <Textarea id="terms" value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Enter terms for this credit note..." className="mt-1 min-h-[100px]" />
            </div>
        </CardContent>
        <CardFooter className="bg-muted/30 dark:bg-dark-muted/30 rounded-b-lg p-6 flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 border-t border-border dark:border-dark-border">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => {/* handle cancel */}}>
            Cancel
          </Button>
          <Button className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary-hover dark:bg-dark-secondary dark:text-dark-secondary-foreground dark:hover:bg-dark-secondary-hover flex items-center shadow hover:shadow-md" onClick={() => handleSaveReturn(true)}>
            <Save size={18} className="mr-2" /> Save as Draft
          </Button>
          <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-hover dark:bg-dark-primary dark:text-dark-primary-foreground dark:hover:bg-dark-primary-hover flex items-center shadow hover:shadow-md" onClick={() => handleSaveReturn(false)}>
            <Save size={18} className="mr-2" /> Save Return
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
export default SalesReturn;