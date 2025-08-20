# Invoice Generator API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fullName": "John Doe",
    "email": "john@example.com"
  }
}
```

### Get User Profile
**GET** `/auth/profile` (Protected)

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "fullName": "John Doe",
    "email": "john@example.com",
    "createdAt": "2021-07-21T10:30:00.000Z"
  }
}
```

---

## Invoice Endpoints

### Generate PDF Invoice
**POST** `/invoices/generate-pdf` (Protected)

**Request Body:**
```json
{
  "products": [
    {
      "name": "Product 1",
      "quantity": 32,
      "rate": 120
    },
    {
      "name": "Product 2",
      "quantity": 25,
      "rate": 150
    }
  ],
  "summary": {
    "totalCharges": 7590,
    "gst": 1366.2,
    "finalAmount": 8956.2
  }
}
```

**Response:** PDF file download

### Get Invoice History
**GET** `/invoices/history?page=1&limit=10` (Protected)

**Response:**
```json
{
  "success": true,
  "invoices": [
    {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "invoiceNumber": "INV-001",
      "customerInfo": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "totalCharges": 7590,
      "gst": 1366.2,
      "finalAmount": 8956.2,
      "invoiceDate": "21/07/21",
      "createdAt": "2021-07-21T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalInvoices": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### Get Specific Invoice
**GET** `/invoices/:id` (Protected)

**Response:**
```json
{
  "success": true,
  "invoice": {
    "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
    "invoiceNumber": "INV-001",
    "customerInfo": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "products": [
      {
        "name": "Product 1",
        "quantity": 32,
        "rate": 120,
        "totalAmount": 3840
      }
    ],
    "totalCharges": 7590,
    "gst": 1366.2,
    "finalAmount": 8956.2,
    "invoiceDate": "21/07/21"
  }
}
```

### Download Existing Invoice
**GET** `/invoices/:id/download` (Protected)

**Response:** PDF file download

---

## Error Responses

All endpoints may return these error formats:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation error",
  "errors": ["Full name is required", "Email is required"]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Invoice not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Server error during PDF generation"
}
```

---

## Frontend Integration Examples

### Registration Flow
```javascript
const register = async (userData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  
  return response.json();
};
```

### Login Flow
```javascript
const login = async (credentials) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
};
```

### Generate PDF Invoice
```javascript
const generateInvoice = async (invoiceData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('/api/invoices/generate-pdf', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(invoiceData)
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    
    // Trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invoice.pdf';
    a.click();
    
    window.URL.revokeObjectURL(url);
  }
};
```

---

## Notes

1. **Authentication**: JWT tokens expire in 7 days by default
2. **Rate Limiting**: 100 requests per 15 minutes per IP
3. **File Size**: Request body limited to 10MB
4. **PDF Generation**: Uses Puppeteer for high-quality PDF generation
5. **Database**: Automatically stores invoice records for history
6. **Security**: Implements CORS, Helmet, and input validation
