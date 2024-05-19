const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const teacherDB = require("../models/teacherSchema");
const studentDB=require("../models/studentSchema")
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const secretKey = "teacherSecretKey";
//transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "supremebilal78@gmail.com",
    pass: "xlifiuqjtmrigppl",
  },
});

//controllers
let verificationToken;
exports.Login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const password = req.body.password;

    let teacher = await teacherDB.findOne({ email });

    if (!teacher) {
      return res.status(401).json("User not found");
    }

    if (!teacher.isVerified) {
      return res.status(402).json({ message: "User is not verified" });
    }

    const passwordMatch = await bcrypt.compare(password, teacher.password);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Password doesn't match" });
    }

    const token = jwt.sign({ userId: teacher._id }, secretKey, {
      expiresIn: "1h", // Token expiration time
    });

    const isRegistered = teacher.isRegistered;

    if (isRegistered) {
      return res
        .status(200)
        .json({ token, isRegistered, message: "Login Successful" });
    } else {
      return res.status(201).json({
        token,
        isRegistered,
        message: "Login Successful Not Registered",
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "An Unexpected Error Occurred" });
  }
};

exports.Logout = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      console.log("No token");
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Split the header to get the actual token after "Bearer "
    const token = authHeader.split(" ")[1];

    jwt.verify(token, secretKey, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token is not valid" });
      }

      const userId = decoded.userId;

      return res.json({ message: "Logout successful" });
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};
function generateVerificationCode() {
  const min = 100000;
  const max = 999999;
  return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}
exports.resetPassword = async (req, res, next) => {
  const userEmail = req.body.email;

  try {
    const teacher = await teacherDB.findOne({ email: userEmail });
    const student = await studentDB.findOne({ email: userEmail });

    if (!teacher && !student) {
      return res.status(404).json({ error: "User not found" });
    }

    const verificationCode = generateVerificationCode();

    let user;
    if (teacher) {
      teacher.verificationToken = verificationCode;
      await teacher.save();
      user = teacher;
    } else if (student) {
      student.verificationToken = verificationCode;
      await student.save();
      user = student;
    }

    const mailOptions = {
      from: "Edumentor.com",
      to: userEmail,
      subject: "Reset Password Verification",
      text: `Your verification code to reset your password is: ${verificationCode}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Email sending error:", error);
        return res.status(500).json({ error: "Error sending verification email" });
      } else {
        console.log("Verification email sent:", info.response);
        return res.status(200).json({ message: "Verification email sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ error: "Error resetting password" });
  }
};


exports.validateResetPassword = async (req, res, next) => {
  const { email, verificationCode } = req.body;

  console.log(email, verificationCode);
  try {
    const teacher = await teacherDB.findOne({ email });
    const student = await studentDB.findOne({ email });

    if ((!teacher || teacher.verificationToken !== verificationCode) && (!student || student.verificationToken !== verificationCode)) {
      return res.status(400).json({ error: "Invalid email or verification code" });
    }

    return res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    console.error("Error validating reset password:", error);
    return res.status(500).json({ error: "Error validating reset password" });
  }
};


exports.finalResetPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;
  try {
    const teacher = await teacherDB.findOne({ email });
    const student = await studentDB.findOne({ email });

    const user = teacher || student;
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    bcrypt.hash(newPassword, 10, async (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ error: "Error hashing password" });
      }

      user.password = hashedPassword;
      user.verificationToken = null;
      await user.save();

      return res.status(200).json({ message: "Password Updated" });
    });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ error: "Error updating password" });
  }
};

