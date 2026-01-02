import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  plan: { type: String }, // monthly / yearly / custom
  price: Number,
  startDate: Date,
  endDate: Date,
  status: { type: String, enum: ['active','cancelled','expired'], default: 'active' }
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
export default Subscription;
