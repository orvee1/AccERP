import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { UserPlus } from 'lucide-react';

// Sample departments and sub-departments - you can modify these as needed
const departments = [
  { id: 'dept1', name: 'Administration', subDepartments: ['HR', 'Finance', 'IT'] },
  { id: 'dept2', name: 'Operations', subDepartments: ['Production', 'Quality Control', 'Logistics'] },
  { id: 'dept3', name: 'Sales', subDepartments: ['Retail', 'Wholesale', 'Online'] },
  { id: 'dept4', name: 'Marketing', subDepartments: ['Digital', 'Traditional', 'Events'] },
];

const AddEmployee = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    department: '',
    subDepartment: '',
    contact: '',
    emergencyContact: '',
    emergencyContactRelation: '',
    nid: '',
    currentAddress: '',
    permanentAddress: '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.employeeName || !formData.employeeId || !formData.department) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically save the employee data
    console.log('Employee Data:', formData);
    
    toast({
      title: "Success",
      description: "Employee has been added successfully.",
    });
  };

  const selectedDepartment = departments.find(d => d.id === formData.department);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold text-primary dark:text-dark-primary">Add New Employee</h1>
      <div className="bg-card dark:bg-dark-card rounded-lg shadow-lg p-6 border border-border dark:border-dark-border">
        <h2 className="text-xl font-semibold text-primary dark:text-dark-primary mb-6">Employee Information Form</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-2">
              <Label htmlFor="employeeName">Employee Name <span className="text-destructive">*</span></Label>
              <Input
                id="employeeName"
                value={formData.employeeName}
                onChange={(e) => handleInputChange('employeeName', e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID <span className="text-destructive">*</span></Label>
              <Input
                id="employeeId"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                placeholder="EMP001"
                required
              />
            </div>

            {/* Department Information */}
            <div className="space-y-2">
              <Label htmlFor="department">Department <span className="text-destructive">*</span></Label>
              <Select
                value={formData.department}
                onValueChange={(value) => {
                  handleInputChange('department', value);
                  handleInputChange('subDepartment', ''); // Reset sub-department when department changes
                }}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subDepartment">Sub Department</Label>
              <Select
                value={formData.subDepartment}
                onValueChange={(value) => handleInputChange('subDepartment', value)}
                disabled={!formData.department}
              >
                <SelectTrigger id="subDepartment">
                  <SelectValue placeholder="Select sub department" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDepartment?.subDepartments.map(subDept => (
                    <SelectItem key={subDept} value={subDept}>{subDept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="contact">Contact Number</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
                placeholder="+1234567890"
                type="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nid">National ID (NID)</Label>
              <Input
                id="nid"
                value={formData.nid}
                onChange={(e) => handleInputChange('nid', e.target.value)}
                placeholder="Enter NID number"
              />
            </div>

            {/* Emergency Contact Information */}
            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Emergency contact number"
                type="tel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelation">Relation to Emergency Contact</Label>
              <Input
                id="emergencyContactRelation"
                value={formData.emergencyContactRelation}
                onChange={(e) => handleInputChange('emergencyContactRelation', e.target.value)}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>

            {/* Address Information */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="currentAddress">Current Address</Label>
              <Textarea
                id="currentAddress"
                value={formData.currentAddress}
                onChange={(e) => handleInputChange('currentAddress', e.target.value)}
                placeholder="Enter current address"
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="permanentAddress">Permanent Address</Label>
              <Textarea
                id="permanentAddress"
                value={formData.permanentAddress}
                onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                placeholder="Enter permanent address"
                className="min-h-[100px]"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary-hover">
              <UserPlus size={18} className="mr-2"/> Save Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployee;
