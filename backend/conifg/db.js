const mongoose = require('mongoose');
require('dotenv').config();

function checkenvmode() {
  return process.env.MODE === 'production';
}

const connectDB = async () => {
  const connectionOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  };

  const mongoURI = checkenvmode() 
    ? process.env.PROD_MONGODB_URI 
    : process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('MongoDB URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI, connectionOptions);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Exit process with failure
    process.exit(1);
  }
};

// Connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Close the Mongoose connection when the Node process ends
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed through app termination');
  process.exit(0);
});

module.exports = { connectDB, checkenvmode };