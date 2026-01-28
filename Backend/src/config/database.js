const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('[DATABASE] Attempting to connect to MongoDB Atlas...');
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`[DATABASE] MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('[DATABASE ERROR] MongoDB connection failed:', error.message);
    console.error('[DATABASE ERROR] Full error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;