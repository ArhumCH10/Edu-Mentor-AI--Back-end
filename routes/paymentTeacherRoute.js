const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Student = require("../models/studentSchema");
const Payment = require("../models/paymentSchema");
const Teacher = require("../models/teacherSchema");

router.get("/payment", async (req, res) => {
    try {
      const token = req.query.token; 
      const decodedToken = jwt.verify(token, "teacherSecretKey");
      const userId = decodedToken.userId;
      console.log(userId);
      const teacher = await Teacher.findOne({ _id: userId }).exec();
  
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
  
      const payments = await Payment.find({ teacherId: teacher.email, paymentStatus: 'success' }).exec();

      if (payments.length === 0) {
        return res.status(404).json({ message: "No successful payments found for this student." });
      }
  
      const results = [];

      for (const payment of payments) {
          const student = await Student.findOne({ username: payment.studentId }).exec();
          console.log(student);
          if (student) {
              results.push({
                  studentName: student.name,
                  amountPaid: payment.paymentAmount,
                  lessonTimeDuration: payment.lessonTimeDuration,
                  lessonDay: payment.lessonDay,
                  lessonType: payment.lessonType,
                  lessonDate: payment.trialLessonDate,
                  lessonTime: payment.lessonTime,
                 profilePhoto: student.profilePhoto, 
                 introduceYourself: student.description,
                  subjectsTaught: teacher.subjectsTaught,
              });
          }
      }

      res.json(results);
    } catch (error) {
      console.error("Error fetching payment details:", error);
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  });

module.exports = router;
