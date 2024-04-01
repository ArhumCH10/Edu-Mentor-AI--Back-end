const Student = require("../models/studentSchema");

exports.uploadData = async (req, res, next) => {
  try {
    const name = req.body.name;
    const country = req.body.country;
    const grade = req.body.grade;

    console.log("Request Body:", req.body);

    const userEmail = req.body.email; 
    console.log("Name: ", name);

    // Find the user by email
    const user = await Student.findOne({ email: userEmail });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's name, country, and grade
    user.name = name;
    user.country = country;
    user.grade = grade;

    await user.save();

    res.status(200).json({ message: "Data Saved successfully", user });

  } catch (error) {
    console.error("Error uploading data", error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};

exports.otherData = async (req, res, next) => {
  try {
    const description = req.body.description;
    const language = req.body.language;
    const language1 = req.body.language1;
    const education = req.body.education;
    const education1 = req.body.education1;

    const userEmail = req.body.email; 

    // Find the user by email
    const user = await Student.findOne({ email: userEmail });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    // Update user's name, country, and grade
    user.description = description;
    user.language = language;
    user.education = education;

   if (language1)
   {
    user.language1 = language1
   }
   if(education1)
   {
    user.education1 = education1
   }
   
    await user.save();

    res.status(200).json({ message: "Data Saved successfully", user });

  } catch (error) {
    console.error("Error uploading data", error);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};