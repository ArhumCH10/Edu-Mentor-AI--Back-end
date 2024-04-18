const mongoose = require('mongoose');

// Define the schema for the payment
const paymentSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    ref: 'Student',
    required: true
  },
  teacherId: {
    type: String,
    ref: 'Teacher',
    required: true
  },
  paymentAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['success', 'fail', 'cancel','pending'],
    default: 'pending'
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  trialLessonDate: {
    type: Date,
    required: true
  }
});

// Create a model using the schema
const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
