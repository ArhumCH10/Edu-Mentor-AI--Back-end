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



//   exports.Photo = async (req, res, next) => {
//     try {
//         const token = req.header("Authorization").split(" ")[1];
//         const decodedToken = jwt.verify(token, "teacherSecretKey");
//         const userId = decodedToken.userId;

//         const user = await teacherDB.findById(userId);

//         if (!user) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         if (!req.file) {
//             return res.status(400).json({ message: "Invalid or missing file in the request" });
//         }


//         // Here, instead of saving a buffer, you save the file path
//         const filePath = req.file.path;

//         const updatedUser = await teacherDB.findByIdAndUpdate(
//             userId,
//             {
//                 profilePhoto: filePath, // Save the file path
//             },
//             { new: true }
//         );

//         res.status(200).json({
//             message: "Profile photo updated successfully",
//             updatedTeacher: updatedUser,
//         });
//     } catch (error) {
//         console.error("Error updating profile photo:", error);
//         return res.status(500).json({ message: "An unexpected error occurred" });
//     }
// };

exports.Photo = async (req, res) => {
    try {
        const token = req.header("Authorization").split(" ")[1];
        const decodedToken = jwt.verify(token, "teacherSecretKey");
        const userId = decodedToken.userId;

        const user = await teacherDB.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!req.file) {
            return res.status(400).json({ message: "Invalid or missing file in the request" });
        }

        const filePath = req.file.path;
        console.log("file: ", filePath);

        const updatedUser = await teacherDB.findByIdAndUpdate(
            userId,
            {
                profilePhoto: filePath,
            },
            { new: true }
        );

        res.status(200).json({
            message: "Profile photo updated successfully",
            updatedTeacher: updatedUser,
        });
    } catch (error) {
        console.error("Error updating profile photo:", error);
        res.status(500).json({ message: "An unexpected error occurred" });
    }
};

// exports.Certificate = async (req, res, next) => {
//     try {
//         // Authentication check
//         const token = req.header("Authorization").split(" ")[1];
//         const decodedToken = jwt.verify(token, "teacherSecretKey");
//         const userId = decodedToken.userId;

//         // Extract certification details from the request
//         const { subject, certificate, description, issuedBy, yearsOfStudyFrom } = req.body;
        
//         // Get the uploaded file's path for certificationPhoto
//         const certificationPhoto = req.file ? req.file.path : null;

//         // Find the teacher and update their certifications array
//         const updatedTeacher = await teacherDB.findByIdAndUpdate(
//             userId,
//             {
//                 $push: {
//                     certifications: {
//                         subject,
//                         certificate,
//                         description,
//                         issuedBy,
//                         yearsOfStudyFrom,
//                         certificationPhoto
//                     }
//                 }
//             },
//             { new: true }
//         );

//         // Respond with the updated teacher information
//         res.status(200).json({
//             message: "Certification added/updated successfully",
//             updatedTeacher,
//         });
//     } catch (error) {
//         console.error("Error updating certification data:", error);
//         return res.status(500).json({ message: "An unexpected error occurred" });
//     }
// };
exports.Certificate = async (req, res, next) => {
    try {
        // Authentication check
        const token = req.header("Authorization").split(" ")[1];
        const decodedToken = jwt.verify(token, "teacherSecretKey");
        const userId = decodedToken.userId;

        // Extract certification details from the request
        const { subject, certificate, description, issuedBy, yearsOfStudyFrom } = req.body;
        
        // Get the uploaded file's path for certificationPhoto
        const certificationPhoto = req.file ? req.file.path : null;

        // Check if the teacher already has a certification with the same subject and certificate
        const existingCertification = await teacherDB.findOneAndUpdate(
            {
                _id: userId,
                "certifications.subject": subject,
                "certifications.certificate": certificate,
            },
            {
                $set: {
                    "certifications.$.description": description,
                    "certifications.$.issuedBy": issuedBy,
                    "certifications.$.yearsOfStudyFrom": yearsOfStudyFrom,
                    "certifications.$.certificationPhoto": certificationPhoto,
                },
            },
            { new: true }
        );

        if (!existingCertification) {
            // If no existing entry, push a new one
            await teacherDB.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        certifications: {
                            subject,
                            certificate,
                            description,
                            issuedBy,
                            yearsOfStudyFrom,
                            certificationPhoto,
                        },
                    },
                },
                { new: true }
            );
        }

        // Respond with the updated teacher information
        const updatedTeacher = await teacherDB.findById(userId);
        res.status(200).json({
            message: "Certification added/updated successfully",
            updatedTeacher,
        });
    } catch (error) {
        console.error("Error updating certification data:", error);
        return res.status(500).json({ message: "An unexpected error occurred" });
    }
};

exports.Education = async (req, res, next) => {
    try {
        // Authentication check
        const token = req.header("Authorization").split(" ")[1];
        const decodedToken = jwt.verify(token, "teacherSecretKey");
        const userId = decodedToken.userId;

        // Extract education details from the request
        const { university, degree, degreeType, specialization, yearsOfStudyFrom } = req.body;

        // Get the uploaded file's path for educationPhoto
        const educationPhoto = req.file ? req.file.path : null;

        // Check if the teacher already has an education entry with the same university and degree
        const existingEducation = await teacherDB.findOneAndUpdate(
            {
                _id: userId,
                "educations.university": university,
                "educations.degree": degree,
            },
            {
                $set: {
                    "educations.$.degreeType": degreeType,
                    "educations.$.specialization": specialization,
                    "educations.$.yearsOfStudyFrom": yearsOfStudyFrom,
                    "educations.$.educationPhoto": educationPhoto,
                },
            },
            { new: true }
        );

        if (!existingEducation) {
            // If no existing entry, push a new one
            await teacherDB.findByIdAndUpdate(
                userId,
                {
                    $push: {
                        educations: {
                            university,
                            degree,
                            degreeType,
                            specialization,
                            yearsOfStudyFrom,
                            educationPhoto,
                        },
                    },
                },
                { new: true }
            );
        }

        // Respond with the updated teacher information
        const updatedTeacher = await teacherDB.findById(userId);
        res.status(200).json({
            message: "Education added/updated successfully",
            updatedTeacher,
        });
    } catch (error) {
        console.error("Error updating education data:", error);
        return res.status(500).json({ message: "An unexpected error occurred" });
    }
};
// exports.Education = async (req, res, next) => {
//     try {
//         // Authentication check
//         const token = req.header("Authorization").split(" ")[1];
//         const decodedToken = jwt.verify(token, "teacherSecretKey");
//         const userId = decodedToken.userId;

//         // Extract certification details from the request
//         const {  university, degree, degreeType, specialization, yearsOfStudyFrom } = req.body;
        
//         // Get the uploaded file's path for certificationPhoto
//         const  educationPhoto = req.file ? req.file.path : null;

//         // Find the teacher and update their certifications array
//         const updatedTeacher = await teacherDB.findByIdAndUpdate(
//             userId,
//             {
//                 $push: {
//                     educations: {
//                         university,
//                         degree,
//                         degreeType,
//                         specialization,
//                         yearsOfStudyFrom,
//                         educationPhoto
//                     }
//                 }
//             },
//             { new: true }
//         );

//         // Respond with the updated teacher information
//         res.status(200).json({
//             message: "Degree added/updated successfully",
//             updatedTeacher,
//         });
//     } catch (error) {
//         console.error("Error updating Degree data:", error);
//         return res.status(500).json({ message: "An unexpected error occurred" });
//     }
// };

exports.Description = async (req, res, next) => {
    try {
        const token = req.header("Authorization").split(" ")[1];
        const decodedToken = jwt.verify(token, "teacherSecretKey");
        const userId = decodedToken.userId;

        const { introduceYourself, teachingExperience, motivateStudents, catchyHeadline } = req.body;

        const updatedTeacher = await teacherDB.findByIdAndUpdate(
            userId,
            {
                "profileDescription.introduceYourself": introduceYourself,
                "profileDescription.teachingExperience": teachingExperience,
                "profileDescription.motivateStudents": motivateStudents,
                "profileDescription.catchyHeadline": catchyHeadline,
            },
            { new: true }
        );

        res.status(200).json({
            message: "User information updated successfully",
            updatedTeacher,
        });
    } catch (error) {
        console.error("Not Inserted Data", error);
        return res.status(500).json({ message: "An Unexpected Error Occurred" });
    }
};

exports.Video = async (req, res, next) => {
    try {
        // Verify the token and extract userId
        const token = req.header("Authorization").split(" ")[1];
        const decodedToken = jwt.verify(token, "teacherSecretKey");
        const userId = decodedToken.userId;

        // Find the teacher in the database
        const user = await teacherDB.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check for the existence of the uploaded video file
        if (!req.files || !req.files['data'] || req.files['data'].length === 0) {
            return res.status(400).json({ message: "Invalid or missing video file in the request" });
        }

        // Get the video file path from the uploaded file
        //const videoFilePath = req.files.data[0].path;
        const data = req.files['data'][0].path;

        let thumbnail = null;
        if (req.files['thumbnail'] && req.files['thumbnail'].length > 0) {
            thumbnail = req.files['thumbnail'][0].path;
        }

        // Prepare the update object
        // const updateObject = {
        //     'video.data': videoFilePath
        // };

        // Check for the existence of the uploaded thumbnail file and add it to the update object if present
        // if (req.files.thumbnail) {
        //     const thumbnailFilePath = req.files.thumbnail[0].path;
        //     updateObject['video.thumbnail'] = thumbnailFilePath;
        // }

        // Update the teacher document with the video and optionally the thumbnail path
        const updatedUser = await teacherDB.findByIdAndUpdate(
            userId,{
                $push: {
                    video: {
                        data: data,
                        thumbnail: thumbnail ? thumbnail : null,
                    }
                }
            },
            // updateObject,
            { new: true }
        );

        // Send the response
        res.status(200).json({
            message: "Video updated successfully",
            updatedTeacher: updatedUser,
        });
    } catch (error) {
        console.error("Error updating video", error);
        return res.status(500).json({ message: "An unexpected error occurred" });
    }
};

exports.Availability = async (req, res, next) => {
    try {
        const token = req.header("Authorization").split(" ")[1];
        const decodedToken = jwt.verify(token, "teacherSecretKey");
        const userId = decodedToken.userId;

        const { timezone, availability } = req.body;

        const updatedTeacher = await teacherDB.findByIdAndUpdate(
            userId,
            {
                $set: {
                    availability: availability.map(day => ({
                        day: day.day,
                        timezone: timezone,
                        slots: day.slots.map(slot => ({
                            from: slot.from,
                            to: slot.to
                        }))
                    }))
                }
            },
            { new: true }
        );

        res.status(200).json({
            message: "User information updated successfully",
            updatedTeacher,
        });
    } catch (error) {
        console.error("Not Inserted Data", error);
        return res.status(500).json({ message: "An Unexpected Error Occurred" });
    }
};

exports.Pricing = async (req, res, next) => {
    try {
        const token = req.header("Authorization").split(" ")[1];
        const decodedToken = jwt.verify(token, "teacherSecretKey");
        const userId = decodedToken.userId;

        const { hourlyPriceUSD } = req.body;

        const updatedTeacher = await teacherDB.findByIdAndUpdate(
            userId,
            {
                hourlyPriceUSD: hourlyPriceUSD,
                registrationCompleted: true,
            },
            { new: true }
        );

        res.status(200).json({
            message: "Registration successfully Done",
            updatedTeacher,
        });
    } catch (error) {
        console.error("Not Inserted Data", error);
        return res.status(500).json({ message: "An Unexpected Error Occurred" });
    }
};
