import React from 'react';

const IncomeStatement = () => {
  console.log('IncomeStatement component is rendering');
  
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Income Statement</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Summary</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded">
            <span className="text-gray-700">Total Revenue</span>
            <span className="font-semibold text-green-600">$155,000.00</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-red-50 rounded">
            <span className="text-gray-700">Total Expenses</span>
            <span className="font-semibold text-red-600">$157,000.00</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-t-2 border-blue-200">
            <span className="text-gray-800 font-semibold">Net Income</span>
            <span className="font-bold text-blue-600">-$2,000.00</span>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Test Information</h3>
          <p className="text-gray-600">This is a simplified version of the Income Statement component. If you can see this content, the basic rendering is working!</p>
        </div>
      </div>
    </div>
  );
};

export default IncomeStatement; 