export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getBalanceStatus = (balance) => {
  if (balance > 0.01) return 'gets';
  if (balance < -0.01) return 'owes';
  return 'settled';
};

export const getBalanceColor = (balance) => {
  if (balance > 0.01) return 'text-green-600';
  if (balance < -0.01) return 'text-red-600';
  return 'text-gray-600';
};

export const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'gets':
      return 'bg-green-100 text-green-800';
    case 'owes':
      return 'bg-red-100 text-red-800';
    case 'settled':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};