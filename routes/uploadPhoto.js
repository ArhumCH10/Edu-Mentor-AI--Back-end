const express = require('express');
const router = express.Router();
const Photo = require('../controllers/photoController');
const upload = require('../multerConfig');

router.post('/uploads',upload.single('photo'),Photo.uploadPhoto);

module.exports = router;