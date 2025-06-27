import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, DollarSign, Users, TrendingUp, FileText } from 'lucide-react';

// Mock data for charts (replace with actual data later)
const salesData = [
  { name: 'Jan', sales: 4000 }, { name: 'Feb', sales: 3000 }, { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 }, { name: 'May', sales: 6000 }, { name: 'Jun', sales: 5500 },
];

const PlaceholderCard = ({ title, value, icon, color, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4" style={{borderColor: color}}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        {React.createElement(icon, { className: "h-5 w-5", style: {color: color} })}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-blue-600">{value}</div>
        <p className="text-xs text-gray-600 pt-1">{description}</p>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-3xl font-bold text-blue-600"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to Easy CloudBook!
      </motion.h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <PlaceholderCard title="Total Revenue" value="$45,231.89" icon={DollarSign} color="#073D7F" description="+20.1% from last month" />
        <PlaceholderCard title="Active Users" value="+2350" icon={Users} color="#6491DE" description="+180.1% from last month" />
        <PlaceholderCard title="Sales" value="+12,234" icon={TrendingUp} color="#F4B443" description="+19% from last month" />
        <PlaceholderCard title="Pending Invoices" value="32" icon={FileText} color="#FF6B6B" description="2 overdue" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600 flex items-center">
                <BarChart className="mr-2 text-orange-500" /> Sales Overview (Placeholder)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center bg-gray-50 rounded-b-lg">
              <p className="text-gray-600">Beautiful sales chart coming soon!</p>
              {/* Placeholder for a bar chart component */}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-blue-600 flex items-center">
                <DollarSign className="mr-2 text-orange-500" /> Expense Breakdown (Placeholder)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-80 flex items-center justify-center bg-gray-50 rounded-b-lg">
              <p className="text-gray-600">Insightful expense pie chart on its way!</p>
              {/* Placeholder for a pie chart component */}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 p-6 bg-white rounded-lg shadow-lg"
      >
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Recent Activity (Placeholder)</h2>
        <ul className="space-y-3">
          <li className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">Invoice #INV001 created for Customer X.</li>
          <li className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">Payment received from Vendor Y.</li>
          <li className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">New product "Super Widget" added.</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default Dashboard;
