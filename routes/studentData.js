const express = require("express");
const router = express.Router();
const Student = require("../models/studentSchema");


router.get("/user", async (req, res) => {
  try {
    const userEmail = req.query.email; 
    console.log(userEmail);

    const user = await Student.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "An unexpected error occurred" });
  }
});

module.exports = router;
