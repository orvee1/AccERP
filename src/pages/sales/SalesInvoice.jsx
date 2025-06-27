import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import SalesInvoiceHeader from '@/components/sales/SalesInvoiceHeader';
import SalesInvoiceLineItems from '@/components/sales/SalesInvoiceLineItems';
import SalesInvoiceTotals from '@/components/sales/SalesInvoiceTotals';
import SalesInvoiceFooter from '@/components/sales/SalesInvoiceFooter';

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
    { 
      id: 'PROD002', name: 'Premium Gadget', costingPrice: 49.99, openingQuantity: 50, isService: false,
      units: [
        { id: `PROD002-unit-${Date.now()}`, name: 'unit', factor: 1, isBase: true },
        { id: `PROD002-pack-${Date.now()}`, name: 'pack', factor: 10, isBase: false },
      ], baseUnitName: 'unit'
    },
    { 
      id: 'SERV001', name: 'Consulting Hour', costingPrice: 100.00, openingQuantity: Infinity, isService: true,
      units: [{ id: `SERV001-hour-${Date.now()}`, name: 'hour', factor: 1, isBase: true }], baseUnitName: 'hour'
    },
  ];
};

const SalesInvoice = () => {
  const { toast } = useToast();
  const [customer, setCustomer] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date(new Date().setDate(new Date().getDate() + 30)));
  const [invoiceNumber, setInvoiceNumber] = useState(`INV-${String(Date.now()).slice(-6)}`);
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('');
  const [saleType, setSaleType] = useState('credit'); 
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
        if (calculatedItem.discountAmount > 0) {
            itemDiscountValue = calculatedItem.discountAmount;
        } else if (calculatedItem.discountPercent > 0) {
            itemDiscountValue = (calculatedItem.itemRawTotal || 0) * (calculatedItem.discountPercent / 100);
        }
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
            if (baseUnit && selectedProduct.costingPrice) { // Assuming salesPrice is used here, not costing. Changed to salesPrice
                 const billingUnitForRate = selectedProduct.units.find(u=>u.id === updatedItemState.billingUnitId);
                 updatedItemState.rateForBillingUnit = (selectedProduct.salesPrice || selectedProduct.costingPrice || 0) * (billingUnitForRate?.factor || 1);
            } else {
                 updatedItemState.rateForBillingUnit = 0;
            }
            updatedItemState.quantityInput = 1; // Reset quantity on product change
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
            
        if (updatedItemState.productDetails && updatedItemState.productDetails.openingQuantity !== Infinity) {
             const stockAvailable = updatedItemState.productDetails.openingQuantity || 0;
             if (tempQuantityInBase > stockAvailable) {
                toast({
                    title: "Stock Alert",
                    description: `Selected quantity (${tempQuantityInBase} ${updatedItemState.productDetails.baseUnitName || 'base units'}) exceeds available stock (${stockAvailable}) for ${updatedItemState.productDetails.name}. Quantity reset.`,
                    variant: "destructive"
                });
                updatedItemState.quantityInput = 0; // Reset quantityInput
                updatedItemState.quantityInBase = 0; // Also reset calculated base quantity
             }
        }
        return calculateLineItemTotal(updatedItemState);
      })
    );
  };
  
  const handleSaveInvoice = (send = false) => {
    if (!customer && saleType === 'credit') {
      toast({ title: "Validation Error", description: "Please select a customer for credit sales.", variant: "destructive" });
      return;
    }
    if (lineItems.some(item => !item.productId || item.totalPrice === 0 && item.quantityInput > 0)) { 
       toast({ title: "Validation Error", description: "Please ensure all line items have a product, valid quantity, units, and rate leading to a price.", variant: "destructive" });
       return;
    }
    if (lineItems.length === 0 || lineItems.every(item => item.quantityInput === 0)) {
        toast({ title: "Validation Error", description: "Cannot save an empty invoice or an invoice with all zero quantities.", variant: "destructive" });
        return;
    }
    
    const finalLineItems = lineItems.filter(li => li.quantityInput > 0).map(li => calculateLineItemTotal(li));

    if (finalLineItems.length === 0) {
        toast({ title: "Validation Error", description: "Cannot save an invoice with no valid line items.", variant: "destructive" });
        return;
    }

    const calculatedSubtotal = finalLineItems.reduce((acc, item) => acc + (item.itemRawTotal || 0), 0);
    const calculatedTotalDiscount = finalLineItems.reduce((acc, item) => {
      let itemDiscount = 0;
      if(item.discountAmount > 0) {
        itemDiscount = item.discountAmount;
      } else if (item.discountPercent > 0) {
        itemDiscount = (item.itemRawTotal || 0) * (item.discountPercent / 100);
      }
      return acc + itemDiscount;
    }, 0);


    const invoiceData = {
      saleType, customer, invoiceNumber, invoiceDate, dueDate, 
      lineItems: finalLineItems.map(li => {
          const quantityUnitDetails = li.productDetails?.units.find(u=>u.id === li.quantityUnitId);
          const billingUnitDetails = li.productDetails?.units.find(u=>u.id === li.billingUnitId);
          return {
            productId: li.productId, productName: li.productDetails?.name,
            quantityInput: li.quantityInput, quantityUnitId: li.quantityUnitId,
            quantityUnitName: quantityUnitDetails?.name, quantityUnitFactor: quantityUnitDetails?.factor,
            calculatedQuantityInBase: li.quantityInBase, baseUnitName: li.productDetails?.baseUnitName,
            billingUnitId: li.billingUnitId, billingUnitName: billingUnitDetails?.name,
            billingUnitFactor: billingUnitDetails?.factor, rateForBillingUnit: li.rateForBillingUnit,
            discountPercent: li.discountPercent, discountAmount: li.discountAmount,
            itemRawTotal: li.itemRawTotal,
            calculatedPrice: li.totalPrice,
          };
      }), 
      subtotal: calculatedSubtotal, 
      totalDiscount: calculatedTotalDiscount, 
      taxAmount, 
      grandTotal: calculatedSubtotal - calculatedTotalDiscount + taxAmount, 
      notes, 
      terms
    };
    console.log("Invoice Data: ", JSON.stringify(invoiceData, null, 2));
    
    const existingInvoices = JSON.parse(localStorage.getItem('invoices') || '[]');
    localStorage.setItem('invoices', JSON.stringify([...existingInvoices, invoiceData]));

    // Update product stock
    const updatedProducts = availableProducts.map(p => {
        const itemSold = invoiceData.lineItems.find(li => li.productId === p.id);
        if (itemSold && p.openingQuantity !== Infinity) {
            return { ...p, openingQuantity: p.openingQuantity - itemSold.calculatedQuantityInBase };
        }
        return p;
    });
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setAvailableProducts(updatedProducts); // Refresh product list in current component

    toast({ title: "Invoice Saved!", description: `Invoice ${invoiceNumber} (${saleType} sale) ${send ? 'sent and' : ''} saved successfully. Stock updated.`, className: 'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 border-green-300 dark:border-green-600' });
  };

  const handleSaleTypeChange = (type) => {
    setSaleType(type);
    toast({title: "Sale Type Changed", description: `Switched to ${type === 'cash' ? 'Cash Sale' : 'Credit Sale'} mode.`, className: 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 border-blue-300 dark:border-blue-600'})
    if (type === 'cash') {
      setDueDate(invoiceDate); 
    } else {
      setDueDate(new Date(new Date().setDate(new Date().getDate() + 30))); 
    }
  }

  return (
    <div className="space-y-6 p-1 md:p-2">
      <Card className="shadow-xl border-border dark:border-dark-border bg-card dark:bg-dark-card">
        <CardHeader>
           <SalesInvoiceHeader
            saleType={saleType}
            handleSaleTypeChange={handleSaleTypeChange}
            invoiceNumber={invoiceNumber}
            customer={customer}
            setCustomer={setCustomer}
            initialCustomers={initialCustomers}
            invoiceDate={invoiceDate}
            setInvoiceDate={setInvoiceDate}
            dueDate={dueDate}
            setDueDate={setDueDate}
          />
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          <SalesInvoiceLineItems
            lineItems={lineItems}
            availableProducts={availableProducts}
            handleLineItemChange={handleLineItemChange}
            handleRemoveLineItem={handleRemoveLineItem}
            handleAddLineItem={handleAddLineItem}
          />
          <SalesInvoiceTotals
            notes={notes}
            setNotes={setNotes}
            terms={terms}
            setTerms={setTerms}
            subtotal={subtotal}
            totalDiscountDisplay={totalDiscountDisplay}
            taxAmount={taxAmount}
            setTaxAmount={setTaxAmount}
            grandTotal={grandTotal}
          />
        </CardContent>
        <SalesInvoiceFooter handleSaveInvoice={handleSaveInvoice} />
      </Card>
    </div>
  );
};
export default SalesInvoice;