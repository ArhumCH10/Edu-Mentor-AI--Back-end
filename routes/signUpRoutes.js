const express = require('express');
const router = express.Router();
const signupController = require('../controllers/teacherSignUp');

// Define the user registration route
router.post('/signup', signupController.isNewUser,
signupController.isPasswordValid,
signupController.sendEmailVerification,
signupController.SignUp,
);

router.get('/verify/:token', signupController.verifyEmail);

module.exports = router;
