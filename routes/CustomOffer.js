// routes/customOfferRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const CustomOffer = require('../models/CustomerOfferSchema'); 

router.post('/CustomOffer', async (req, res) => {
  try {
    const { description, paymentFrequency, price, recieverId, senderId, totalMonths } = req.body;

    const newOffer = new CustomOffer({
      description,
      paymentFrequency,
      price,
      receiverId : recieverId,
      senderId,
      totalMonths
    });
    const savedOffer = await newOffer.save();
    res.status(201).json(savedOffer);
  } catch (error) {
    console.error('Error saving offer:', error);
    res.status(500).json({ error: 'Failed to save offer' });
  }
});

module.exports = router;
