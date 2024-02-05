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

        const filePath = path.join(__dirname, '..', user.profilePhoto);

        if (fs.existsSync(filePath)) {
            const ext = path.extname(user.profilePhoto);
            let contentType = 'image/jpg'; // Default to jpeg
            if (ext === '.png') contentType = 'image/png';

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

router.get('/video/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await teacherDB.findById(userId);

        if (!user || !user.video || user.video.length === 0) {
            return res.status(404).json({ message: 'No video found' });
        }
        const video = user.video.data;
        const thumb = user.video.thumbnail;
        const videoString = video.join(', ');
        const thumbString = thumb ? thumb.join(', ') : null;
        console.log('video: ',videoString);
        console.log('Thumb',thumbString);
        // Concatenate directory path with video and thumbnail paths
        // const videoData = {
        //     data: path.join(__dirname, '..', videoString), // Assuming __dirname is the directory of this file
        //     thumbnail: thumbString ? path.join(__dirname, '..', thumbString) : null,
        // };
        const videoData = {
            data: videoString,
            thumbnail: thumbString,
        };
        console.log(user.video);
     

        res.status(200).json({
            message: 'Video data retrieved successfully',
            videoData: videoData,
        });
    } catch (error) {
        console.error('Error retrieving video data:', error);
        res.status(500).json({ message: 'An unexpected error occurred' });
    }
});

module.exports = router;

