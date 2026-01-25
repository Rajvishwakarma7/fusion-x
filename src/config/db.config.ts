import 'dotenv/config'
import mongoose from 'mongoose';
const url = process.env.MONGODB_URL || '';

const mongooseOptions = {
  serverSelectionTimeoutMS: 50000,
};

if (!url) {
  console.log("Can't connect to database, DB Missing.");
  process.exit(1);
}


export const DbInstance = mongoose.connect(url, mongooseOptions);
