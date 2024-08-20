const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      tls: true,
      tlsAllowInvalidCertificates: true, // Try setting this to true if you encounter SSL issues
    });
    console.log('MongoDB connected');

    const count = await mongoose.connection.db.collection('designs').countDocuments();
    console.log('Number of designs:', count);
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

module.exports = connectDB;
