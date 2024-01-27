const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Teacher = require("../models/teacherSchema");
router.get("/get-all-users", async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await Teacher.find();
    res.json(users);
    console.log(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
