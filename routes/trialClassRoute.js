const express = require('express');
const router = express.Router();
const { createTrialClass, getAllTrialClasses, getActiveTrialClasses } = require('../controllers/trialClassController');

router.post('/trial-classes', createTrialClass);
router.get('/trial-classes', getAllTrialClasses);
router.get('/active-trial-classes', getActiveTrialClasses);

module.exports = router;