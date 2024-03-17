const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Teacher = require("../models/teacherSchema");
const Student=require("../models/studentSchema")
router.get("/get-all-users", async (req, res) => {
  console.log("sending users");
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

router.get("/get-all-students", async (req, res) => {
  console.log("sending students");
  try {
    // Fetch all users from the database
    const users = await Student.find();
    res.json(users);
    console.log(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/verify-teacher/:id", async (req, res) => {
  try {
    const teacherId = req.params.id;

    // Find the teacher by ID
    const teacher = await Teacher.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    // Update the isVerified property to true
    teacher.isRegistered = true;

    // Save the updated teacher
    await teacher.save();

    console.log(teacher);
    return res.json({ message: "Teacher verified successfully" });
  } catch (error) {
    console.error("Error verifying teacher:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
