const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB connection...');
console.log('Connection string:', process.env.MONGODB_URI ? 'Found' : 'Not found');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:');
    console.error('Error:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Authentication Error Solutions:');
      console.log('1. Check your username and password in MongoDB Atlas');
      console.log('2. Make sure your database user has the right permissions');
      console.log('3. URL encode special characters in your password');
      console.log('4. Verify your connection string format');
    }
    
    if (error.message.includes('IP address')) {
      console.log('\n🔧 Network Access Error Solutions:');
      console.log('1. Add your IP address to Network Access in MongoDB Atlas');
      console.log('2. Or add 0.0.0.0/0 for development (not recommended for production)');
    }
    
    process.exit(1);
  });