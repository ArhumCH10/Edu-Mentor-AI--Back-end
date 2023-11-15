const Teacher = require('../models/teacherSchema'); 
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

async function createUser(req, res) {
  try {
    const { email, password } = req.body;

    // Check if email already exists in the database
    const existingUser = await Teacher.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Validate password (should have special characters, one capital letter, and be at least 8 characters long)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: 'Password does not meet requirements' });
    }

    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create a new user
    const newUser = new Teacher({
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    });

    // Save the user to the database
    await newUser.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: email,
        pass: password, 
      },
    });

    const mailOptions = {
      from: 'arhumnaveed092@gmail.com',
      to: email,
      subject: 'Email Verification',
      text: `Please click the following link to verify your email: http://your-app-domain/verify/${verificationToken}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Email verification failed' });
      }
      console.log('Email sent: ' + info.response);
      res.status(201).json({ message: 'User registered successfully. Verification email sent.' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createUser };
