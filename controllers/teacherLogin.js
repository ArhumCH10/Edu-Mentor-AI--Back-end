const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const teacherDB = require("../models/teacherSchema");
const { validationResult } = require("express-validator");

const secretKey = "teacherSecretKey";

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
      return res.status(200).json({ token, isRegistered, message: "Login Successful" });
    } else {
      return res.status(201).json({ token, isRegistered, message: "Login Successful Not Registered" });
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
        return res.status(401).json({ message: "No token, authorization denied" });
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