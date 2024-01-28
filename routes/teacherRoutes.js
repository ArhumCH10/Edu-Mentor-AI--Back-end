const express = require('express');
const router = express.Router();
const teacherInfo = require('../controllers/teacherInfo');
const upload = require('../multerConfig');
const videoUpload = require('../multerConfig');
const path = require('path');
const fs = require('fs');
const teacherDB = require("../models/teacherSchema");

// Define the user registration route
router.post('/about', teacherInfo.About);
router.get('/user-data', teacherInfo.userData);
router.delete('/delete-language-and-level/:index', teacherInfo.deleteLanguageAndLevel);
router.post('/photo', upload.single('photo'), teacherInfo.Photo);
router.post('/certificate', upload.single('certificationPhoto'), teacherInfo.Certificate);
router.post('/education', upload.single('educationPhoto'), teacherInfo.Education);
router.post('/description', teacherInfo.Description);
router.post('/video', upload.fields([
    { name: 'data', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]), teacherInfo.Video);  
//router.post('/video', upload.single('data'), teacherInfo.Video);
router.post('/availability', teacherInfo.Availability);
router.post('/pricing', teacherInfo.Pricing);

router.get('/photo/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await teacherDB.findById(userId);

        if (!user || !user.profilePhoto) {
            return res.status(404).send('No photo found');
        }

        // Construct the full file path
        const filePath = path.join(__dirname, '..', user.profilePhoto);

        // Check if the file exists
        if (fs.existsSync(filePath)) {
            // Determine the content type from the file extension
            const ext = path.extname(user.profilePhoto);
            let contentType = 'image/jpg'; // Default to jpeg
            if (ext === '.png') contentType = 'image/png';

            // Set appropriate Content-Type header and send the file
            res.setHeader('Content-Type', contentType);
            res.sendFile(filePath);
        } else {
            res.status(404).send('Photo not found');
        }
    } catch (error) {
        console.error("Error retrieving photo:", error);
        res.status(500).send('Error retrieving photo');
    }
});


module.exports = router;

