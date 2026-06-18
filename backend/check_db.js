import mongoose from 'mongoose';
import { Payment } from './models/Payment.js';
import { config } from './config/index.js';

async function main() {
  await mongoose.connect(config.mongodbUri || 'mongodb://127.0.0.1:27017/nexthire');
  console.log('Connected to MongoDB');

  const payments = await Payment.find().sort({ createdAt: -1 }).limit(10);
  console.log('Last 10 payments:');
  console.log(JSON.stringify(payments.map(p => ({
    id: p._id,
    userId: p.userId,
    amount: p.amount,
    planType: p.planType,
    status: p.status,
    razorpayOrderId: p.razorpayOrderId,
    razorpayPaymentId: p.razorpayPaymentId,
    createdAt: p.createdAt
  })), null, 2));

  await mongoose.disconnect();
}

main().catch(console.error);
