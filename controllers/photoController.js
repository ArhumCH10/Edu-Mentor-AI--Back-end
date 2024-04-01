const Student = require("../models/studentSchema");

exports.uploadPhoto = async (req, res, next) => {
  try {
    const userEmail = req.body.email; 

    const user = await Student.findOne({ email: userEmail });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Check if photo file exists in the request
    if (!req.file) {
      console.log("No photo file in the request");
      return res.status(400).json({ message: "No photo file in the request" });
    }

    user.profilePhoto = req.file.filename;
    await user.save();
    res.status(200).json({ message: "Photo uploaded successfully", user });

  } catch (error) {
    console.error("Error uploading photo", error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};