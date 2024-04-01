const express = require('express');
const router = express.Router();
const Profile = require('../controllers/studentProfile');

router.post('/profile', Profile.uploadData);
router.post('/other', Profile.otherData);

module.exports = router;