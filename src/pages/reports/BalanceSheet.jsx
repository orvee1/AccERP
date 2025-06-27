import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Download, TrendingUp, Building, DollarSign, ChevronDown, ChevronRight } from 'lucide-react';

const BalanceSheet = () => {
  const [asOfDate, setAsOfDate] = useState(new Date());
  const [expandedSections, setExpandedSections] = useState({
    currentAssets: true,
    fixedAssets: true,
    currentLiabilities: true,
    longTermLiabilities: true,
    equity: true
  });

  // Mock data - in a real app, this would come from your accounting system
  const mockData = {
    assets: {
      currentAssets: {
        cash: 25000,
        accountsReceivable: 45000,
        inventory: 35000,
        prepaidExpenses: 5000,
        totalCurrentAssets: 110000
      },
      fixedAssets: {
        equipment: 80000,
        buildings: 200000,
        vehicles: 25000,
        accumulatedDepreciation: -30000,
        totalFixedAssets: 275000
      },
      totalAssets: 385000
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: 30000,
        shortTermLoans: 15000,
        accruedExpenses: 8000,
        taxesPayable: 5000,
        totalCurrentLiabilities: 58000
      },
      longTermLiabilities: {
        longTermLoans: 100000,
        mortgages: 150000,
        totalLongTermLiabilities: 250000
      },
      totalLiabilities: 308000
    },
    equity: {
      commonStock: 50000,
      retainedEarnings: 27000,
      totalEquity: 77000
    }
  };

  const formatCurrency = (amount, showSign = false) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(Math.abs(amount));
    
    if (showSign) {
      return amount >= 0 ? `+${formatted}` : `-${formatted}`;
    }
    return formatted;
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const calculateWorkingCapital = () => {
    return mockData.assets.currentAssets.totalCurrentAssets - mockData.liabilities.currentLiabilities.totalCurrentLiabilities;
  };

  const calculateCurrentRatio = () => {
    return mockData.assets.currentAssets.totalCurrentAssets / mockData.liabilities.currentLiabilities.totalCurrentLiabilities;
  };

  const calculateDebtToEquityRatio = () => {
    return mockData.liabilities.totalLiabilities / mockData.equity.totalEquity;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-border dark:border-slate-800">
        <CardHeader className="bg-primary dark:bg-slate-800 rounded-t-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-primary-foreground dark:text-slate-100 flex items-center">
              <Building size={28} className="mr-3" />
              Balance Sheet
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => console.log('Export')} className="text-primary dark:text-slate-100 border-primary dark:border-slate-600 hover:bg-primary/10">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground dark:text-slate-300">As of Date</label>
              <DatePicker 
                date={asOfDate} 
                setDate={setAsOfDate}
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-primary hover:bg-primary/90 dark:bg-slate-700 dark:hover:bg-slate-600">
                Generate Report
              </Button>
            </div>
          </div>

          {/* Balance Sheet Content */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">Balance Sheet</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">
                As of {asOfDate.toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 space-y-6">
              {/* Assets Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2">
                  ASSETS
                </h4>
                
                {/* Current Assets */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('currentAssets')}
                  >
                    <div className="flex items-center">
                      {expandedSections.currentAssets ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="ml-2 font-semibold text-gray-900 dark:text-slate-100">Current Assets</span>
                    </div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(mockData.assets.currentAssets.totalCurrentAssets)}
                    </span>
                  </div>
                  {expandedSections.currentAssets && (
                    <div className="ml-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Cash and Cash Equivalents</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(mockData.assets.currentAssets.cash)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Accounts Receivable</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(mockData.assets.currentAssets.accountsReceivable)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Inventory</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(mockData.assets.currentAssets.inventory)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Prepaid Expenses</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(mockData.assets.currentAssets.prepaidExpenses)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fixed Assets */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('fixedAssets')}
                  >
                    <div className="flex items-center">
                      {expandedSections.fixedAssets ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="ml-2 font-semibold text-gray-900 dark:text-slate-100">Fixed Assets</span>
                    </div>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {formatCurrency(mockData.assets.fixedAssets.totalFixedAssets)}
                    </span>
                  </div>
                  {expandedSections.fixedAssets && (
                    <div className="ml-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Equipment</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(mockData.assets.fixedAssets.equipment)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Buildings</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(mockData.assets.fixedAssets.buildings)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Vehicles</span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {formatCurrency(mockData.assets.fixedAssets.vehicles)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Less: Accumulated Depreciation</span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(mockData.assets.fixedAssets.accumulatedDepreciation)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Assets */}
                <div className="flex justify-between items-center font-bold text-lg border-t-2 border-gray-300 dark:border-slate-600 pt-2">
                  <span className="text-gray-900 dark:text-slate-100">TOTAL ASSETS</span>
                  <span className="text-blue-600 dark:text-blue-400">
                    {formatCurrency(mockData.assets.totalAssets)}
                  </span>
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2">
                  LIABILITIES
                </h4>
                
                {/* Current Liabilities */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('currentLiabilities')}
                  >
                    <div className="flex items-center">
                      {expandedSections.currentLiabilities ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="ml-2 font-semibold text-gray-900 dark:text-slate-100">Current Liabilities</span>
                    </div>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(mockData.liabilities.currentLiabilities.totalCurrentLiabilities)}
                    </span>
                  </div>
                  {expandedSections.currentLiabilities && (
                    <div className="ml-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Accounts Payable</span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(mockData.liabilities.currentLiabilities.accountsPayable)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Short-term Loans</span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(mockData.liabilities.currentLiabilities.shortTermLoans)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Accrued Expenses</span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(mockData.liabilities.currentLiabilities.accruedExpenses)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Taxes Payable</span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(mockData.liabilities.currentLiabilities.taxesPayable)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Long-term Liabilities */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('longTermLiabilities')}
                  >
                    <div className="flex items-center">
                      {expandedSections.longTermLiabilities ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="ml-2 font-semibold text-gray-900 dark:text-slate-100">Long-term Liabilities</span>
                    </div>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {formatCurrency(mockData.liabilities.longTermLiabilities.totalLongTermLiabilities)}
                    </span>
                  </div>
                  {expandedSections.longTermLiabilities && (
                    <div className="ml-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Long-term Loans</span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(mockData.liabilities.longTermLiabilities.longTermLoans)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Mortgages</span>
                        <span className="text-red-600 dark:text-red-400">
                          {formatCurrency(mockData.liabilities.longTermLiabilities.mortgages)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Liabilities */}
                <div className="flex justify-between items-center font-bold text-lg border-t-2 border-gray-300 dark:border-slate-600 pt-2">
                  <span className="text-gray-900 dark:text-slate-100">TOTAL LIABILITIES</span>
                  <span className="text-red-600 dark:text-red-400">
                    {formatCurrency(mockData.liabilities.totalLiabilities)}
                  </span>
                </div>
              </div>

              {/* Equity Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2">
                  EQUITY
                </h4>
                
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSection('equity')}
                  >
                    <div className="flex items-center">
                      {expandedSections.equity ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      <span className="ml-2 font-semibold text-gray-900 dark:text-slate-100">Shareholders' Equity</span>
                    </div>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(mockData.equity.totalEquity)}
                    </span>
                  </div>
                  {expandedSections.equity && (
                    <div className="ml-6 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Common Stock</span>
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(mockData.equity.commonStock)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-slate-400">Retained Earnings</span>
                        <span className="text-green-600 dark:text-green-400">
                          {formatCurrency(mockData.equity.retainedEarnings)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Total Liabilities and Equity */}
                <div className="flex justify-between items-center font-bold text-lg border-t-2 border-gray-300 dark:border-slate-600 pt-2">
                  <span className="text-gray-900 dark:text-slate-100">TOTAL LIABILITIES & EQUITY</span>
                  <span className="text-gray-900 dark:text-slate-100">
                    {formatCurrency(mockData.liabilities.totalLiabilities + mockData.equity.totalEquity)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Ratios */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 dark:text-slate-400">Working Capital</h4>
              <p className={`text-2xl font-bold ${calculateWorkingCapital() >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(calculateWorkingCapital())}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 dark:text-slate-400">Current Ratio</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {calculateCurrentRatio().toFixed(2)}:1
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-sm font-medium text-gray-600 dark:text-slate-400">Debt-to-Equity Ratio</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {calculateDebtToEquityRatio().toFixed(2)}:1
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BalanceSheet;