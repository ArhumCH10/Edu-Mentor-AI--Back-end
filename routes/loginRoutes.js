const express = require('express');
const router = express.Router();
const loginController = require('../controllers/teacherLogin');
const { body } = require("express-validator");

router.post("/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginController.Login
);

router.post("/logout", loginController.Logout);

module.exports = router;
