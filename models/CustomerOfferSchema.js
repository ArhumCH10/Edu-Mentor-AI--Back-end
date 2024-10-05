const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const customOfferSchema = new Schema({
  description: { type: String, required: true },
  paymentFrequency: { type: String, enum: ['Single-Payment', 'Monthly', 'Weekly'], required: true },
  price: { type: Number, required: true },
  receiverId: { type: String, required: true }, 
  senderId: { type: String, required: true }, 
  totalMonths: { type: Number, required: true },
  status: { type: String, default: "pending" }
});

const CustomOffer = mongoose.model('CustomOffer', customOfferSchema);

module.exports = CustomOffer;
