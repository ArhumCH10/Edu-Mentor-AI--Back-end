const express = require('express');
const router = express.Router();
const teacherInfo = require('../controllers/teacherInfo');
const upload = require('../multerConfig');

// Define the user registration route
router.post('/about', teacherInfo.About);
router.get('/user-data', teacherInfo.userData);
router.delete('/delete-language-and-level/:index', teacherInfo.deleteLanguageAndLevel);
router.post('/photo', upload.single('photo'), teacherInfo.Photo);

module.exports = router;