const teacherDB = require("../models/teacherSchema");
const jwt = require("jsonwebtoken");
const fs = require('fs/promises');

exports.About = async (req, res, next) => {
    try{
        const token = req.header("Authorization").split(" ")[1];
        const decodedToken = jwt.verify(token, "teacherSecretKey");
        const userId = decodedToken.userId;

        const firstName = req.body.firstName;
        const lastName = req.body.lastName;
        const country = req.body.country;
        const subject = req.body.subject;
        const languages = req.body.languages;
        const levels = req.body.levels;
        const phone = req.body.phone;
        const isOver18 = req.body.isOver18;

        const updatedTeacher = await teacherDB.findByIdAndUpdate(
            userId,
            {
                firstName: firstName,
                lastName: lastName,
                countryOrigin: country,
                subjectsTaught: subject,
                LanguageSpoken: languages,
                levelsTaught: levels,
                phoneNumber: phone,
                isGreaterThan18: isOver18,
            },
            { new: true }
        );

        res.status(200).json({
            message: "User information updated successfully",
            updatedTeacher,
        });
    }
    catch(error)
    {
        console.error("Not Inserted Data", error);
        return res.status(500).json({ message: "An Unexpected Error Occurred" });
    }
};

exports.userData = async (req, res, next) => {
    try{
        const token = req.header("Authorization").split(" ")[1];
        const decodedToken = jwt.verify(token, "teacherSecretKey");
        const userId = decodedToken.userId;

        console.log(token);

        const user = await teacherDB.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User data retrieved successfully",
            userData: user,
        });
    }
    catch(error)
    {
        console.error("Not Inserted Data", error);
        return res.status(500).json({ message: "An Unexpected Error Occurred" });
    }
};

// In your controller file (teacherInfo.js)
exports.deleteLanguageAndLevel = async (req, res, next) => {
    try {
      const token = req.header('Authorization').split(' ')[1];
      const decodedToken = jwt.verify(token, 'teacherSecretKey');
      const userId = decodedToken.userId;
  
      const indexToDelete = req.params.index;
      console.log(userId);
  
      // Pull the language and level at the specified index from the arrays
      const updatedTeacher = await teacherDB.findByIdAndUpdate(
        userId,
        {
          $pull: {
            LanguageSpoken: { $exists: true, $eq: null },
            levelsTaught: { $exists: true, $eq: null },
          },
        },
        { new: true, runValidators: true } // Add runValidators to enforce validation
      );
  
      // Exclude verificationToken from the update by removing it from the updatedTeacher object
      const { verificationToken, ...updateWithoutVerificationToken } = updatedTeacher.toObject();
  
      // Remove the language and level at the specified index
      updateWithoutVerificationToken.LanguageSpoken.splice(indexToDelete, 1);
      updateWithoutVerificationToken.levelsTaught.splice(indexToDelete, 1);
  
      // Save the updated document
      await teacherDB.findByIdAndUpdate(userId, updateWithoutVerificationToken);
  
      res.status(200).json({
        message: 'Language and level deleted successfully',
        updatedTeacher,
      });
    } catch (error) {
      console.error('Error deleting language and level:', error);
      return res.status(500).json({ message: 'An Unexpected Error Occurred' });
    }
  };  

  exports.Photo = async (req, res, next) => {
      try {
          const token = req.header("Authorization").split(" ")[1];
          const decodedToken = jwt.verify(token, "teacherSecretKey");
          const userId = decodedToken.userId;
  
          const user = await teacherDB.findById(userId);
  
          if (!user) {
              return res.status(404).json({ message: "User not found" });
          }


          const verificationToken = user.verificationToken;

  
          console.log("in Photo function req.file: ", req.file);
  
          if (!req.file || !req.file.buffer) {
              return res.status(400).json({ message: "Invalid or missing file in the request" });
          }
  
          const photoBuffer = req.file.buffer;
          console.log("in Photo function photoBuffer : ", photoBuffer);

          const updatedUser = await teacherDB.findByIdAndUpdate(
            userId,
            {
                profilePhoto: photoBuffer,
                verificationToken: verificationToken,
            },
            { new: true }
        );
          res.status(200).json({
              message: "Profile photo updated successfully",
              updatedTeacher: updatedUser,
          });
      } catch (error) {
          console.error("Error updating profile photo:", error);
          return res.status(500).json({ message: "An unexpected error occurred" });
      }
  };
  


//   exports.Photo = async (req, res, next) => {
//     try {
//         const token = req.header("Authorization").split(" ")[1];
//         const decodedToken = jwt.verify(token, "teacherSecretKey");
//         const userId = decodedToken.userId;
//         const formData = req.body.fileStore;

//         const user = await teacherDB.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         console.log("in Photo function formdata: ",formData);

//         if (!req.file || !req.file.buffer) {
//             return res.status(400).json({ message: "Invalid or missing file in the request" });
//         }

//         const photoBuffer = req.file.buffer;

//         user.profilePhoto = photoBuffer;
//         await user.save();

//         res.status(200).json({
//             message: "Profile photo updated successfully",
//             updatedTeacher: user,
//         });
//     } catch (error) {
//         console.error("Error updating profile photo:", error);
//         return res.status(500).json({ message: "An unexpected error occurred" });
//     }
// };