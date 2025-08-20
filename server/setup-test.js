const mongoose = require('mongoose');
const User = require('./src/models/User');
const Invoice = require('./src/models/Invoice');

// Test different MongoDB connection options
const testDatabaseConnections = async () => {
  console.log('🔍 Testing Database Connections...\n');

  // Option 1: Local MongoDB
  console.log('1️⃣ Testing Local MongoDB...');
  try {
    await mongoose.connect('mongodb://localhost:27017/invoice_generator_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Local MongoDB connection successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ Local MongoDB failed:', error.message);
  }

  // Option 2: MongoDB Atlas (you'll need to provide the connection string)
  console.log('\n2️⃣ Testing MongoDB Atlas...');
  const atlasUri = process.env.MONGODB_ATLAS_URI;
  if (atlasUri && atlasUri !== 'your-atlas-connection-string-here') {
    try {
      await mongoose.connect(atlasUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('✅ MongoDB Atlas connection successful!');
      await mongoose.disconnect();
    } catch (error) {
      console.log('❌ MongoDB Atlas failed:', error.message);
    }
  } else {
    console.log('⚠️ MongoDB Atlas URI not configured in environment variables');
  }
};

// Test JWT secret strength
const testJWTSecret = () => {
  console.log('\n🔐 Testing JWT Configuration...');
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.log('❌ JWT_SECRET not found in environment variables');
    return false;
  }
  
  if (secret.length < 32) {
    console.log('⚠️ JWT_SECRET should be at least 32 characters long');
    console.log(`Current length: ${secret.length}`);
  } else {
    console.log('✅ JWT_SECRET length is adequate');
  }
  
  if (secret.includes('your-super-secret') || secret.includes('change-in-production')) {
    console.log('⚠️ Please change the default JWT_SECRET');
  } else {
    console.log('✅ JWT_SECRET appears to be customized');
  }
  
  return true;
};

// Test environment variables
const testEnvironmentVariables = () => {
  console.log('\n🌍 Testing Environment Variables...');
  
  const requiredVars = ['PORT', 'JWT_SECRET', 'MONGODB_URI'];
  const optionalVars = ['NODE_ENV', 'CLIENT_URL'];
  
  let allRequired = true;
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allRequired = false;
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: ${process.env[varName]}`);
    } else {
      console.log(`⚠️ ${varName}: Not set (optional)`);
    }
  });
  
  return allRequired;
};

// Generate a secure JWT secret
const generateJWTSecret = () => {
  const crypto = require('crypto');
  return crypto.randomBytes(64).toString('hex');
};

// Main setup function
const runSetup = async () => {
  console.log('🚀 Invoice Generator Server Setup\n');
  console.log('=====================================\n');
  
  // Load environment variables
  require('dotenv').config();
  
  // Test environment variables
  const envOk = testEnvironmentVariables();
  
  // Test JWT secret
  const jwtOk = testJWTSecret();
  
  // Test database connections
  await testDatabaseConnections();
  
  console.log('\n📋 Setup Summary:');
  console.log('=====================================');
  
  if (envOk && jwtOk) {
    console.log('✅ Basic configuration looks good!');
    console.log('\n🚀 You can now start the server with: npm run dev');
  } else {
    console.log('⚠️ Some configuration issues found. Please review above.');
  }
  
  console.log('\n💡 Tips:');
  console.log('- For MongoDB Atlas: Replace MONGODB_URI in .env file');
  console.log('- For local MongoDB: Make sure MongoDB service is running');
  console.log(`- New JWT Secret suggestion: ${generateJWTSecret()}`);
  console.log('- Update PORT if 5001 is already in use');
  
  process.exit(0);
};

if (require.main === module) {
  runSetup().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { testDatabaseConnections, testJWTSecret, testEnvironmentVariables };
