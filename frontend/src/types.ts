export type EmployeeStatus = "active" | "inactive";

export interface Employee {
  id: number;
  employeeCode: string;
  name: string;
  gender: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  hireDate: string;
  birthDate: string;
  education: string;
  idNumber: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  employeeCode: string;
  name: string;
  gender: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  hireDate: string;
  birthDate: string;
  education: string;
  idNumber: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
}

