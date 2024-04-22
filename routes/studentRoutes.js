const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const stripeLib =require("stripe");
const secretKey = "studentSecretKey";

// Import your Student model
const Student = require("../models/studentSchema");
const TeacherDB = require("../models/teacherSchema");
// Create a Nodemailer transporter
const STRIPE_SECRET =
  "sk_test_51Obp44KAlnAzxnFU9PrEBv0K27IsOThelFXmUSTkJk7nhzQ0V20hHm75bDPLsYnPnwWs52TIzmz61rUn1U3uQxH500Ob1C6BIw";
const stripe = stripeLib(STRIPE_SECRET);
const Payment = require("../models/paymentSchema");



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

  try {
    // Check if the user already exists
    const existingUser = await Student.findOne({ email: email });
    if (existingUser) {
      return res.status(409).json({ error: "User already registered" });
    }

    const TeacherexistingUser = await TeacherDB.findOne({ email: email });
    if (TeacherexistingUser) {
      console.log("This Email is already registered as Teacher ");
      return res
        .status(400)
        .json({ error: "This Email is already registered as Teacher " });
    }

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

    // Create a new user with the provided details
    const newUser = new Student({
      name: name,
      email: email,
      password: await bcrypt.hash(password, 10),
    });

    // Generate a verification code
    const verificationCode = generateVerificationCode();
    newUser.verificationCode = verificationCode;

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
  console.log("concatenated value is: ",concatenatedValue);
  console.log("email is: ", email);
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

    const token = jwt.sign({ id: user._id }, secretKey, {
      expiresIn: "1h", 
    });
    return res
      .status(200)
      .json({ message: "Verification successful", user: user, token });
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

    if (!student.isVerified) {
      console.log("not verified");
      // Redirect the user to the verification page and send a new verification code
      const verificationCode = generateVerificationCode(); // Generate a new verification code
      student.verificationCode = verificationCode; // Update the verification code in the database
      await student.save();

      // Send the new verification code via email
      const mailOptions = {
        from: "EduMentor",
        to: email,
        subject: "New Email Verification Code",
        text: `Your new verification code to verify your email is: ${verificationCode}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Email sending error:", error);
          return res
            .status(500)
            .json({ error: "Error sending verification code" });
        } else {
          console.log("New verification email sent:", info.response);
          return res.status(200).json({
            success: "Account not verified. New verification code sent",
            isVerified: false,
          });
        }
      });
    }
    else {
    const token = jwt.sign({ id: student._id }, secretKey, {
      expiresIn: "1h", // Token expires in 1 hour
    });
    res.status(200).json({ token, user: student });
  }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/payment", async (request, response) => {
  try {
    const paymentAmount = request.body.paymentAmount;
    const amountInCents = paymentAmount * 100;
    const { metadata } = request.body;
    const { studentUsername, teacherEmail, trialLessonDate } = metadata;
    console.log("in payment route: ",metadata);

    // Perform payment processing with Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "1 Trail Lesson Subscription",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:5173/studentdashboard/timetable",
      cancel_url: "http://localhost:5173/",
      metadata: {
        studentUsername: metadata.studentUsername,
        teacherEmail: teacherEmail,
        trialLessonDate: trialLessonDate,
      },
    });

    // Store payment data in the database with status set to "pending"
    await Payment.create({
      sessionId: session.id,
      studentId: metadata.StudentUsername,
      teacherId: metadata.teacherEmail,
      paymentAmount: paymentAmount,
      paymentMethod: 'card',
      paymentStatus: 'pending',
      trialLessonDate: new Date(metadata.trialLessonDate),
    });

    console.log('Payment save as pending');

    // Send the session ID back to the client
    response.json({ session });
  } catch (error) {
    console.error(error);
    response.status(500).send({ message: "Internal server error" });
  }
});



module.exports = router;
