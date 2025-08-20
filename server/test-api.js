const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';

// Test data
const testUser = {
  fullName: "John Doe",
  email: "john.doe@test.com",
  password: "password123",
  confirmPassword: "password123"
};

const testProducts = [
  {
    name: "Product 1",
    quantity: 32,
    rate: 120
  },
  {
    name: "Product 2",
    quantity: 25,
    rate: 150
  }
];

let authToken = '';
let userId = '';

// Test functions
async function testHealthCheck() {
  try {
    console.log('🏥 Testing Health Check...');
    const response = await axios.get('http://localhost:5001/health');
    console.log('✅ Health Check Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  try {
    console.log('\n👤 Testing User Registration...');
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    console.log('✅ Registration Response:', response.data);
    userId = response.data.user.id;
    return true;
  } catch (error) {
    console.error('❌ Registration Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testUserLogin() {
  try {
    console.log('\n🔐 Testing User Login...');
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };
    const response = await axios.post(`${BASE_URL}/auth/login`, loginData);
    console.log('✅ Login Response:', response.data);
    authToken = response.data.token;
    return true;
  } catch (error) {
    console.error('❌ Login Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testGetProfile() {
  try {
    console.log('\n👤 Testing Get Profile...');
    const response = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Profile Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Get Profile Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testPDFGeneration() {
  try {
    console.log('\n📄 Testing PDF Generation...');
    
    // Calculate totals
    const totalCharges = testProducts.reduce((sum, product) => 
      sum + (product.quantity * product.rate), 0
    );
    const gst = totalCharges * 0.18;
    const finalAmount = totalCharges + gst;
    
    const invoiceData = {
      products: testProducts,
      summary: {
        totalCharges,
        gst,
        finalAmount
      }
    };
    
    const response = await axios.post(`${BASE_URL}/invoices/generate-pdf`, invoiceData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      responseType: 'arraybuffer'
    });
    
    console.log('✅ PDF Generated Successfully');
    console.log('📊 Response Headers:', response.headers);
    console.log('📏 PDF Size:', response.data.length, 'bytes');
    return true;
  } catch (error) {
    console.error('❌ PDF Generation Failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvoiceHistory() {
  try {
    console.log('\n📋 Testing Invoice History...');
    const response = await axios.get(`${BASE_URL}/invoices/history`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('✅ Invoice History Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Invoice History Failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting API Tests...\n');
  
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('❌ Server not healthy. Stopping tests.');
    return;
  }
  
  const registrationOk = await testUserRegistration();
  if (!registrationOk) {
    console.log('❌ Registration failed. Stopping tests.');
    return;
  }
  
  const loginOk = await testUserLogin();
  if (!loginOk) {
    console.log('❌ Login failed. Stopping tests.');
    return;
  }
  
  await testGetProfile();
  await testPDFGeneration();
  await testInvoiceHistory();
  
  console.log('\n🎉 All tests completed!');
}

// Export for use
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testUserRegistration,
  testUserLogin,
  testGetProfile,
  testPDFGeneration,
  testInvoiceHistory,
  runAllTests
};
