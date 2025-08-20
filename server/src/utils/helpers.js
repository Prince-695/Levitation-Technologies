// Date formatting utilities
const formatDate = (date = new Date(), format = 'DD/MM/YY') => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  switch (format) {
    case 'DD/MM/YY':
      return `${day}/${month}/${year.toString().slice(-2)}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    default:
      return `${day}/${month}/${year.toString().slice(-2)}`;
  }
};

// Number formatting utilities
const formatCurrency = (amount, currency = '₹') => {
  return `${currency}${parseFloat(amount).toFixed(2)}`;
};

// Generate unique identifiers
const generateUniqueId = (prefix = 'ID') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}`;
};

// Calculate GST
const calculateGST = (amount, rate = 18) => {
  return (amount * rate) / 100;
};

// Calculate totals from products array
const calculateProductTotals = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return { subtotal: 0, gst: 0, total: 0 };
  }
  
  const subtotal = products.reduce((sum, product) => {
    return sum + (product.quantity * product.rate);
  }, 0);
  
  const gst = calculateGST(subtotal);
  const total = subtotal + gst;
  
  return {
    subtotal,
    gst,
    total
  };
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize string for safe usage
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

// Response formatters
const successResponse = (message, data = null) => {
  return {
    success: true,
    message,
    ...(data && { data })
  };
};

const errorResponse = (message, errors = null) => {
  return {
    success: false,
    message,
    ...(errors && { errors })
  };
};

module.exports = {
  formatDate,
  formatCurrency,
  generateUniqueId,
  calculateGST,
  calculateProductTotals,
  isValidEmail,
  sanitizeString,
  successResponse,
  errorResponse
};
