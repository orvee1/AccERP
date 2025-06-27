import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';


const initialEmployees = [
  { sl: 1, name: 'Alice Wonderland', id: 'EMP001', department: 'Sales', subDepartment: 'Retail', contact: '555-1234', emergencyContactName: 'Mad Hatter', emergencyContactRelation: 'Friend', nid: '1234567890123', currentAddress: '123 Rabbit Hole, Wonderland', permanentAddress: 'Wonderland Palace, Wonderland' },
  { sl: 2, name: 'Bob The Builder', id: 'EMP002', department: 'Operations', subDepartment: 'Construction', contact: '555-5678', emergencyContactName: 'Wendy', emergencyContactRelation: 'Partner', nid: '0987654321098', currentAddress: '456 Fixit Ave, Builder City', permanentAddress: 'Builder City Central, Builder City' },
  { sl: 3, name: 'Charlie Chaplin', id: 'EMP003', department: 'Creative', subDepartment: 'Performance', contact: '555-0000', emergencyContactName: 'Oona O\'Neill', emergencyContactRelation: 'Spouse', nid: '1122334455667', currentAddress: '789 Tramp St, Hollywood', permanentAddress: 'Hollywood Hills Estate, Hollywood' },
  { sl: 4, name: 'Diana Prince', id: 'EMP004', department: 'Justice', subDepartment: 'Field Operations', contact: '555-9999', emergencyContactName: 'Steve Trevor', emergencyContactRelation: 'Colleague', nid: '2233445566778', currentAddress: 'Themyscira Embassy, Washington D.C.', permanentAddress: 'Paradise Island, Themyscira' },
  { sl: 5, name: 'Edward Scissorhands', id: 'EMP005', department: 'Art & Design', subDepartment: 'Topiary', contact: '555-3333', emergencyContactName: 'Peg Boggs', emergencyContactRelation: 'Guardian', nid: '3344556677889', currentAddress: 'Avon St, Suburbia', permanentAddress: 'The Castle on the Hill, Suburbia' },
];

const SortableHeader = ({ children, columnKey, sortConfig, requestSort }) => {
  const isSorted = sortConfig && sortConfig.key === columnKey;
  const direction = isSorted ? sortConfig.direction : null;

  return (
    <th scope="col" className="px-4 py-3 cursor-pointer hover:bg-ecb-background/70 transition-colors whitespace-nowrap" onClick={() => requestSort(columnKey)}>
      <div className="flex items-center justify-between">
        {children}
        <span className="ml-2">
          {isSorted ? (direction === 'ascending' ? '▲' : '▼') : <ArrowUpDown size={14} className="opacity-50" />}
        </span>
      </div>
    </th>
  );
};


const EmployeeDatabase = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState(initialEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState(null);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const performSearch = () => {
    toast({ title: "Search Applied", description: `Filtering for "${searchTerm}"` });
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedAndFilteredEmployees = useMemo(() => {
    let sortableItems = [...employees];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      sortableItems = sortableItems.filter(emp => 
        Object.values(emp).some(val => 
          String(val).toLowerCase().includes(term)
        )
      );
    }

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        } else if (typeof aValue === 'number') {
           // no change needed for numbers
        } else { // fallback for null or other types
            aValue = String(aValue).toLowerCase();
            bValue = String(bValue).toLowerCase();
        }
        
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [searchTerm, sortConfig, employees]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-ecb-primary">Employee Database</h1>
        <Button 
          className="bg-ecb-accent text-ecb-primary hover:bg-ecb-accent/90" 
          onClick={() => navigate('/employee/add')}
        >
          <UserPlus size={20} className="mr-2" /> Add New Employee
        </Button>
      </div>

      <div className="flex items-center space-x-2 p-4 bg-white rounded-lg shadow">
        <Input 
          type="text" 
          placeholder="Search employees (Name, ID, Dept...)" 
          className="flex-grow focus:ring-ecb-accent border-ecb-textDark/20 focus:border-ecb-primary"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button 
          className="bg-ecb-primary text-ecb-textLight hover:bg-ecb-primary/90"
          onClick={performSearch}
        >
          <Search size={18} className="mr-2" /> Search
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full min-w-[1600px] text-sm text-left text-ecb-textDark">
          <thead className="text-xs text-ecb-primary uppercase bg-ecb-background/50">
            <tr>
              <SortableHeader columnKey="sl" sortConfig={sortConfig} requestSort={requestSort}>Sl No.</SortableHeader>
              <SortableHeader columnKey="name" sortConfig={sortConfig} requestSort={requestSort}>Employee Name</SortableHeader>
              <SortableHeader columnKey="id" sortConfig={sortConfig} requestSort={requestSort}>ID</SortableHeader>
              <SortableHeader columnKey="department" sortConfig={sortConfig} requestSort={requestSort}>Department</SortableHeader>
              <SortableHeader columnKey="subDepartment" sortConfig={sortConfig} requestSort={requestSort}>Sub Department</SortableHeader>
              <SortableHeader columnKey="contact" sortConfig={sortConfig} requestSort={requestSort}>Contact</SortableHeader>
              <SortableHeader columnKey="emergencyContactName" sortConfig={sortConfig} requestSort={requestSort}>Emergency Contact</SortableHeader>
              <SortableHeader columnKey="emergencyContactRelation" sortConfig={sortConfig} requestSort={requestSort}>Relation</SortableHeader>
              <SortableHeader columnKey="nid" sortConfig={sortConfig} requestSort={requestSort}>NID</SortableHeader>
              <SortableHeader columnKey="currentAddress" sortConfig={sortConfig} requestSort={requestSort}>Current Address</SortableHeader>
              <SortableHeader columnKey="permanentAddress" sortConfig={sortConfig} requestSort={requestSort}>Permanent Address</SortableHeader>
              <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedAndFilteredEmployees.map((emp) => (
              <tr key={emp.sl} className="bg-white border-b hover:bg-ecb-background/30 transition-colors duration-150">
                <td className="px-4 py-3">{emp.sl}</td>
                <td className="px-4 py-3 font-medium text-ecb-secondary whitespace-nowrap">{emp.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.id}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.department}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.subDepartment}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.contact}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.emergencyContactName}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.emergencyContactRelation}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.nid}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.currentAddress}</td>
                <td className="px-4 py-3 whitespace-nowrap">{emp.permanentAddress}</td>
                <td className="px-4 py-3 text-center space-x-1 whitespace-nowrap">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-ecb-secondary hover:text-ecb-accent h-8 w-8"
                    onClick={() => toast({ title: `Edit Employee: ${emp.name}`, description: "Edit form will open here."})}
                  >
                    <Edit size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 h-8 w-8"
                    onClick={() => toast({ title: `Delete Employee: ${emp.name}`, description: "Deletion confirmation will appear."})}
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
            ))}
            {sortedAndFilteredEmployees.length === 0 && (
              <tr>
                <td colSpan="12" className="text-center py-10 text-ecb-textDark/60">
                  {searchTerm ? `No employees found for "${searchTerm}".` : "No employees found. Add your first employee!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default EmployeeDatabase;