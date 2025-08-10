const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
}

const connectToMongoDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
        return connection;
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        throw err;
    }
};

module.exports = connectToMongoDB;
