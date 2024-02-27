const express = require("express");
const router = express.Router();
const loginController = require("../controllers/teacherLogin");
const { body } = require("express-validator");

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  loginController.Login
);

router.post("/logout", loginController.Logout);
router.post("/resetPassword", loginController.resetPassword);
router.post("/validateResetPassword", loginController.validateResetPassword);
router.post("/finalResetPassword", loginController.finalResetPassword);

module.exports = router;
