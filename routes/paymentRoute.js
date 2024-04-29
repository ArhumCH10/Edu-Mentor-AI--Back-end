const express = require("express");
const router = express.Router();
const Student = require("../models/studentSchema");
const Payment = require("../models/paymentSchema");
const Teacher = require("../models/teacherSchema");

router.get("/payment", async (req, res) => {
    try {
      const userEmail = req.query.email; 
      console.log(userEmail);
      const student = await Student.findOne({ email: userEmail }).exec();
  
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      const payments = await Payment.find({ studentId: student.username, paymentStatus: 'success' }).exec();

      if (payments.length === 0) {
        return res.status(404).json({ message: "No successful payments found for this student." });
      }
  
      const results = [];

      for (const payment of payments) {
          const teacher = await Teacher.findOne({ email: payment.teacherId }).exec();
          if (teacher) {
              results.push({
                  teacherName: teacher.firstName + " " + teacher.lastName,
                  amountPaid: payment.paymentAmount,
                  lessonTimeDuration: payment.lessonTimeDuration,
                  lessonDay: payment.lessonDay,
                  lessonType: payment.lessonType,
                  lessonDate: payment.trialLessonDate,
                  paymentStatus: payment.paymentStatus,
                  lessonTime: payment.lessonTime,
                  paymentDate : payment.paymentDate,
                 profilePhoto: teacher.profilePhoto, 
                 introduceYourself: teacher.profileDescription.introduceYourself,
                  subjectsTaught: teacher.subjectsTaught,
                      countryOrigin: teacher.countryOrigin,
                      languagesSpoken: teacher.LanguageSpoken.join(', '),
                      subjectsTaught: teacher.subjectsTaught,
                      hourlyRate: teacher.hourlyPriceUSD
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
