// Reusable field validation functions.
// Each returns '' (valid) or a human-readable error string.

export function validateEmail(value: string): string {
  if (!value.trim()) return 'Email is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value.trim())) return 'Please enter a valid email address.';
  return '';
}

export function validatePassword(value: string): string {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

export function validateRequired(value: string, label = 'This field'): string {
  if (!value.trim()) return `${label} is required.`;
  return '';
}

export function validatePhone(value: string): string {
  if (!value.trim()) return 'Phone number is required.';
  const phoneRegex = /^[+\d\s\-().]{7,20}$/;
  if (!phoneRegex.test(value.trim())) return 'Please enter a valid phone number.';
  return '';
}

export function validatePositiveNumber(value: string, label = 'This field'): string {
  if (!value.trim()) return `${label} is required.`;
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return `${label} must be a positive number.`;
  return '';
}

export function validateDate(value: string, label = 'Date'): string {
  if (!value.trim()) return `${label} is required.`;
  const date = new Date(value);
  if (isNaN(date.getTime())) return `${label} must be a valid date.`;
  return '';
}

export function validateName(value: string, label = 'Name'): string {
  if (!value.trim()) return `${label} is required.`;
  if (value.trim().length < 2) return `${label} must be at least 2 characters.`;
  return '';
}
