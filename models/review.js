const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    review: { type: String, required: true },
    date: { type: Date, default: Date.now },
    rating: { type: Number, required: true, min: 1, max: 5 },
  });
  
  const Review = mongoose.model('Review', reviewSchema);
  