export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone) => {
  const re = /^[0-9]{10}$/;
  return re.test(phone);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateUsername = (username) => {
  return username.length >= 3;
};

export const validateGroupName = (name) => {
  return name.trim().length >= 3;
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const validateExpenseName = (name) => {
  return name.trim().length > 0;
};

export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    if (fieldRules.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${fieldRules.label || field} is required`;
      return;
    }
    
    if (fieldRules.minLength && value.length < fieldRules.minLength) {
      errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
      return;
    }
    
    if (fieldRules.email && !validateEmail(value)) {
      errors[field] = 'Please enter a valid email address';
      return;
    }
    
    if (fieldRules.phone && !validatePhone(value)) {
      errors[field] = 'Please enter a valid 10-digit phone number';
      return;
    }
    
    if (fieldRules.min && parseFloat(value) < fieldRules.min) {
      errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.min}`;
      return;
    }
    
    if (fieldRules.custom && !fieldRules.custom(value)) {
      errors[field] = fieldRules.message || 'Invalid value';
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};