const express = require('express');
const router = express.Router();
const teacherInfo = require('../controllers/teacherInfo');
const upload = require('../multerConfig');
const videoUpload = require('../multerConfig');
const { ObjectId } = require('mongoose').Types;
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
        console.log('video: ', videoString);
        console.log('Thumb', thumbString);
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

router.get('/totalTutor/:subject', async (req, res) => {
    const { subject } = req.params;

    try {
        console.log('subject:', subject);
        const totalTutorCount = await teacherDB.countDocuments({ subjectsTaught: subject });
        console.log('totalTutorCount:', totalTutorCount);
        res.status(200).json({
            message: 'Total Tutor related subject retrieved successfully',
            totalTutorCount: totalTutorCount
        });
    } catch (error) {
        console.error('Error fetching total tutor count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

router.get('/searchTutorByEmail', async (req, res) => {
    try {
        const { email } = req.query;

        console.log("data in query", email);
        const query = {};
       
        query.registrationCompleted = true;
        query.isVerified = true;
        query.isRegistered = true;
        if (email) {
            query.email = email;
        }
        console.log("query", query);

        const tutors = await teacherDB.find(query).select('-password -isVerified -verificationToken -isRegistered -registrationCompleted -isGreaterThan18');
        console.log("tutors", tutors);
        res.json(tutors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/searchTutors', async (req, res) => {
    try {
        const { subject, Country, Days, Times, minP, maxP } = req.query;

        console.log("data in query", subject, Country, Days, Times, minP, maxP);
        const query = {};
        if (subject) query.subjectsTaught = subject;
        if (Days) {
            const daysArray = Days.split('+').map(day => {
                switch (day) {
                    case 'Sun':
                        return 'Sunday';
                    case 'Mon':
                        return 'Monday';
                    case 'Tues':
                        return 'Tuesday';
                    case 'Wed':
                        return 'Wednesday';
                    case 'Thurs':
                        return 'Thursday';
                    case 'Fri':
                        return 'Friday';
                    case 'Sat':
                        return 'Saturday';
                    default:
                        return '';
                }
            });
            query['availability.day'] = daysArray;
        }
        if (Times) {
            const timeRanges = Times.split('+').map(timeRange => {
                const [start, end] = timeRange.split('-').map(time => {
                    if (time.includes(':')) {
                        return time;
                    } else {
                        const hour = Number(time);
                        return `${hour.toString().padStart(2, '0')}:00`;
                    }
                });
               return { 'availability.slots.from': { $gte: start }, 'availability.slots.to': { $lte: end } };
            });
            console.log("timeRanges", timeRanges);
            query['$or'] = timeRanges;
        }
        if (Country) {
            const countriesArray = Country.split('+').map(country => country.toLowerCase());
            query.countryOrigin = countriesArray;
        }
        if (minP && maxP) {
            query.hourlyPriceUSD = { $gte: minP, $lte: maxP };
        }
        query.registrationCompleted = true;
        query.isVerified = true;
        query.isRegistered = true;

        console.log("query", query);

        const tutors = await teacherDB.find(query).select('-password -isVerified -verificationToken -isRegistered -registrationCompleted -isGreaterThan18');
        console.log("tutors", tutors);
        res.json(tutors);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/tutorProfile/', async (req, res) => {
    try {
        const {id} = req.query;
        console.log("id: ", id); 
        const tutorObjectId = new ObjectId(id);
        console.log("tutorObjectId: ", tutorObjectId);
        const tutor = await teacherDB.findById(tutorObjectId).select('-password -isVerified -verificationToken -isRegistered -registrationCompleted -isGreaterThan18');
        if (!tutor) {
            return res.status(404).json({ message: 'Tutor not found' });
        }
        res.status(200).json(tutor);
    } catch (error) {
        console.error('Error fetching tutor data by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;

