const Teacher = require('../models/teacherSchema'); 
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: 'arhumnaveed092@gmail.com', // replace with your email
        pass: 'qhwm oxhc mmvy ujms', // replace with your email password
  },
});

const verificationToken = crypto.randomBytes(20).toString('hex');

exports.sendEmailVerification = (req, res, next) => {
  const email = req.body.email;

  const mailOptions = {
    from: 'arhumnaveed092@gmail.com',
    to: email,
    subject: 'Email Verification',
    text: `Please click the following link to verify your email: http://localhost:8080/teacher/verify/${verificationToken}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email verification error:", error);
      return res
        .status(500)
        .json({ error: "Error sending email verification" });
    } else {
      console.log("Email verification sent:", info.response);

      next();
    }
  });
};

exports.verifyEmail = async (req, res, next) => {
  try{
    const { token } = req.params;
    console.log(token);

    const user = await Teacher.findOneAndUpdate(
      {verificationToken: token},
      {$set: {isVerified: true, verificationToken: null}},
      {new: true}
    );

    if (!user) {
      return res.status(404).json({ error: 'Invalid verification token' });
    }
    
    return res.redirect('http://localhost:5174/');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.isNewUser = (req, res, next) => {
  const email = req.body.email;

  Teacher.findOne({ email: email }).then((user) => {
    if (user) {
      return res.status(400).json({ error: "Email already taken" });
    }
    next();
  });
};

exports.isPasswordValid = (req, res, next) => {
  const password = req.body.password;

  const minLengthRegex = /^.{8,}$/;
  const capitalLetterRegex = /[A-Z]/;
  const specialCharacterPattern = "[!@#$%^&*()_+{}\\[\\]:;<>,.?~\\-=|\\\\/]";
  const specialCharacterRegex = new RegExp(specialCharacterPattern);

  if (
    !minLengthRegex.test(password) ||
    !capitalLetterRegex.test(password) ||
    !specialCharacterRegex.test(password)
  ) {
    return res.status(401).json({
      error:
        "Password must be at least 8 characters long and contain at least one capital letter and one special character.",
    });
  }

  next();
};

exports.SignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: "Error hashing password" });
    }

    const newUser = new Teacher({
      email: email,
      password: hashedPassword,
      verificationToken: verificationToken,
    });

    newUser
    .save()
    .then(() => {
      return res
        .status(201)
        .json({ message: "User signup without verified false" });
    })
    .catch((error) => {
      console.error("Error adding new User:", error);
      res.json({ error: "Error adding new User" });
    });
});
};
