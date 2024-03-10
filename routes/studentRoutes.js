const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const secretKey = "studentSecretKey";

// Import your Student model
const Student = require("../models/studentSchema");

// Create a Nodemailer transporter

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "arhumnaveed092@gmail.com", // replace with your email
    pass: "qhwm oxhc mmvy ujms", // replace with your email password
  },
});

// Function to generate a 6-digit verification code
function generateVerificationCode() {
  const min = 100000;
  const max = 999999;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}

// Route to handle student signup
router.post("/signup", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Password:", password);

  try {
    // Check if the user already exists
    const existingUser = await Student.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Create a new user with the provided details
    const newUser = new Student({
      name: name,
      email: email,
      password: await bcrypt.hash(password, 10),
    });

    // Generate a verification code
    const verificationCode = generateVerificationCode();
    newUser.verificationCode = verificationCode;

    // Save the new user to the database
    await newUser.save();

    // Send the verification email
    const mailOptions = {
      from: "EduMentor",
      to: email,
      subject: "Email Verification Code",
      text: `Your verification code to verify your email is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        return res
          .status(500)
          .json({ error: "Error sending verification email" });
      } else {
        console.log("Verification email sent:", info.response);
        res
          .status(200)
          .json({ message: "Verification email sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error creating user and sending email:", error);
    res.status(500).json({ error: "Error creating user and sending email" });
  }
});

router.post("/verify", async (req, res) => {
  const { concatenatedValue, email } = req.body;
  console.log(concatenatedValue, email);
  try {
    // Find the user by email
    const user = await Student.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if the verification code matches
    if (user.verificationCode !== concatenatedValue) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    user.isVerified = true;
    await user.save();

    // If verification code is correct, return success response
    return res
      .status(200)
      .json({ message: "Verification successful", user: user });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the student by email
    const student = await Student.findOne({ email });

    // If student doesn't exist, return an error
    if (!student) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if the student is verified
    if (!student.isVerified) {
      console.log("not verified");
      return res
        .status(300)
        .json({ error: "Account not verified", isVerified: false });
    }

    // Generate JWT token
    const token = jwt.sign({ id: student._id }, secretKey, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    res.status(200).json({ token, isVerified: true });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
