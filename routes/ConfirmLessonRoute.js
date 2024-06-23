const express = require('express');
const router = express.Router();
const Payment = require('../models/paymentSchema'); 

router.get('/confirmed-trial-lessons', async (req, res) => {
  try {
    const confirmedLessons = await Payment.find({
      paymentStatus: 'success',
      trialLessonDate: { $gte: new Date() } 
    }).select('trialLessonDate studentId lessonTime lessonDay lessonType');

    res.json(confirmedLessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
