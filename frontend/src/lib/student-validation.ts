// validation.ts - Student Form Validation Utilities

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export class StudentFormValidator {
  
  // Phone number validation (Pakistan format)
  static validatePhoneNumber(phone: string): ValidationResult {
    if (!phone) {
      return { isValid: false, message: "Phone number is required" };
    }
    
    // Remove all non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if exactly 11 digits
    if (cleanPhone.length !== 11) {
      return { isValid: false, message: "Phone number must be exactly 11 digits" };
    }
    
    // Check if starts with 03 (Pakistan mobile format)
    if (!cleanPhone.startsWith('03')) {
      return { isValid: false, message: "Phone number must start with 03" };
    }
    
    return { isValid: true };
  }
  
  // CNIC validation (Pakistan format)
  static validateCNIC(cnic: string): ValidationResult {
    if (!cnic) {
      return { isValid: false, message: "CNIC is required" };
    }
    
    // Remove all non-digit characters
    const cleanCNIC = cnic.replace(/\D/g, '');
    
    // Check if exactly 13 digits
    if (cleanCNIC.length !== 13) {
      return { isValid: false, message: "CNIC must be exactly 13 digits" };
    }
    
    return { isValid: true };
  }
  
  // Name validation (only letters and spaces)
  static validateName(name: string): ValidationResult {
    if (!name) {
      return { isValid: false, message: "Name is required" };
    }
    
    if (name.trim().length < 2) {
      return { isValid: false, message: "Name must be at least 2 characters" };
    }
    
    if (name.trim().length > 200) {
      return { isValid: false, message: "Name must be less than 200 characters" };
    }
    
    // Check if contains only letters, spaces, and common name characters
    const nameRegex = /^[a-zA-Z\s\.\-']+$/;
    if (!nameRegex.test(name.trim())) {
      return { isValid: false, message: "Name can only contain letters, spaces, dots, hyphens, and apostrophes" };
    }
    
    return { isValid: true };
  }
  
  // Number validation (positive numbers only)
  static validatePositiveNumber(value: string, fieldName: string): ValidationResult {
    if (!value) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return { isValid: false, message: `${fieldName} must be a valid number` };
    }
    
    if (num < 0) {
      return { isValid: false, message: `${fieldName} must be a positive number` };
    }
    
    return { isValid: true };
  }
  
  // Integer validation (positive integers only)
  static validatePositiveInteger(value: string, fieldName: string): ValidationResult {
    if (!value) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    
    const num = parseInt(value);
    
    if (isNaN(num)) {
      return { isValid: false, message: `${fieldName} must be a valid integer` };
    }
    
    if (num < 0) {
      return { isValid: false, message: `${fieldName} must be a positive integer` };
    }
    
    return { isValid: true };
  }
  
  // Year validation (reasonable range)
  static validateYear(year: string, fieldName: string): ValidationResult {
    if (!year) {
      return { isValid: false, message: `${fieldName} is required` };
    }
    
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    
    if (isNaN(yearNum)) {
      return { isValid: false, message: `${fieldName} must be a valid year` };
    }
    
    if (yearNum < 2000 || yearNum > currentYear + 5) {
      return { isValid: false, message: `${fieldName} must be between 2000 and ${currentYear + 5}` };
    }
    
    return { isValid: true };
  }
  
  // Date of birth validation
  static validateDateOfBirth(dob: string): ValidationResult {
    if (!dob) {
      return { isValid: false, message: "Date of birth is required" };
    }
    
    const birthDate = new Date(dob);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      return { isValid: false, message: "Please enter a valid date" };
    }
    
    if (birthDate > today) {
      return { isValid: false, message: "Date of birth cannot be in the future" };
    }
    
    // Calculate age
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    const actualAge = monthDiff < 0 ? age - 1 : age;
    
    if (actualAge < 3) {
      return { isValid: false, message: "Student must be at least 3 years old" };
    }
    
    if (actualAge > 25) {
      return { isValid: false, message: "Student age cannot exceed 25 years" };
    }
    
    return { isValid: true };
  }
  
  // Address validation
  static validateAddress(address: string): ValidationResult {
    if (!address) {
      return { isValid: false, message: "Address is required" };
    }
    
    if (address.trim().length < 10) {
      return { isValid: false, message: "Address must be at least 10 characters" };
    }
    
    if (address.trim().length > 500) {
      return { isValid: false, message: "Address must be less than 500 characters" };
    }
    
    return { isValid: true };
  }
  
  // Format phone number for display
  static formatPhoneNumber(phone: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 11) {
      return `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4)}`;
    }
    return phone;
  }
  
  // Format CNIC for display
  static formatCNIC(cnic: string): string {
    const cleanCNIC = cnic.replace(/\D/g, '');
    if (cleanCNIC.length === 13) {
      return `${cleanCNIC.slice(0, 5)}-${cleanCNIC.slice(5, 12)}-${cleanCNIC.slice(12)}`;
    }
    return cnic;
  }
  
  // Validate all student form fields
  static validateStudentForm(formData: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    
    // Required fields validation
    const nameValidation = this.validateName(formData.name);
    if (!nameValidation.isValid) errors.name = nameValidation.message!;
    
    const dobValidation = this.validateDateOfBirth(formData.dob);
    if (!dobValidation.isValid) errors.dob = dobValidation.message!;
    
    const addressValidation = this.validateAddress(formData.address);
    if (!addressValidation.isValid) errors.address = addressValidation.message!;
    
    // Phone number validations
    if (formData.emergencyContact) {
      const phoneValidation = this.validatePhoneNumber(formData.emergencyContact);
      if (!phoneValidation.isValid) errors.emergencyContact = phoneValidation.message!;
    }
    
    if (formData.fatherContact) {
      const phoneValidation = this.validatePhoneNumber(formData.fatherContact);
      if (!phoneValidation.isValid) errors.fatherContact = phoneValidation.message!;
    }
    
    if (formData.motherContact) {
      const phoneValidation = this.validatePhoneNumber(formData.motherContact);
      if (!phoneValidation.isValid) errors.motherContact = phoneValidation.message!;
    }
    
    if (formData.guardianPhone) {
      const phoneValidation = this.validatePhoneNumber(formData.guardianPhone);
      if (!phoneValidation.isValid) errors.guardianPhone = phoneValidation.message!;
    }
    
    // CNIC validations
    if (formData.fatherCNIC) {
      const cnicValidation = this.validateCNIC(formData.fatherCNIC);
      if (!cnicValidation.isValid) errors.fatherCNIC = cnicValidation.message!;
    }
    
    if (formData.motherCNIC) {
      const cnicValidation = this.validateCNIC(formData.motherCNIC);
      if (!cnicValidation.isValid) errors.motherCNIC = cnicValidation.message!;
    }
    
    if (formData.guardianCNIC) {
      const cnicValidation = this.validateCNIC(formData.guardianCNIC);
      if (!cnicValidation.isValid) errors.guardianCNIC = cnicValidation.message!;
    }
    
    // Number validations
    if (formData.familyIncome) {
      const incomeValidation = this.validatePositiveNumber(formData.familyIncome, "Family Income");
      if (!incomeValidation.isValid) errors.familyIncome = incomeValidation.message!;
    }
    
    if (formData.rent) {
      const rentValidation = this.validatePositiveNumber(formData.rent, "Rent Amount");
      if (!rentValidation.isValid) errors.rent = rentValidation.message!;
    }
    
    if (formData.admissionYear) {
      const yearValidation = this.validateYear(formData.admissionYear, "Admission Year");
      if (!yearValidation.isValid) errors.admissionYear = yearValidation.message!;
    }
    
    // Academic required fields
    if (!formData.campus) errors.campus = "Campus is required";
    if (!formData.currentGrade) errors.currentGrade = "Current Grade is required";
    if (!formData.section) errors.section = "Section is required";
    if (!formData.shift) errors.shift = "Shift is required";
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
