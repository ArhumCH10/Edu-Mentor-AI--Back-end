const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const TeacherDb = require('../models/teacherSchema');
const StudentDb = require('../models/studentSchema');

// Get all conversations for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    if (!teacherId) {
      return res.status(400).json({ message: "teacherId is required" });
    }

    const conversations = await Conversation.find({ members: teacherId });
    const conversationsWithStudentDetails = await Promise.all(conversations.map(async conversation => {
      const studentId = conversation.members[1];
      const student = await StudentDb.findById(studentId);
      const studentProfilePicture = student.profilePhoto || 'default-user.jpg';

      return {
        ...conversation.toObject(),
        studentProfilePicture: studentProfilePicture,
        studentName: student.name,
      };
    }));

    res.json(conversationsWithStudentDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


// Get all conversations for a student
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId) {
      return res.status(400).json({ message: "studentId are required" });
    }

    const conversations = await Conversation.find({ members: studentId });

    const conversationsWithTeacherDetails = await Promise.all(conversations.map(async conversation => {
      const teacherId = conversation.members[0];
      const teacher = await TeacherDb.findById(teacherId);

      return {
        ...conversation.toObject(),
        teacherProfilePicture: teacher.profilePhoto | null,
        teacherFirstName: teacher.firstName,
        teacherLastName: teacher.lastName
      };
    }));

    res.json(conversationsWithTeacherDetails);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Create a new conversation
router.post('/createConversation', async (req, res) => {
  try {
    const { teacherId, studentId } = req.body;

    console.log('teacherId, studentId', teacherId, studentId);
    // Check if both teacherId and studentId are provided
    if (!teacherId || !studentId) {
      return res.status(400).json({ message: "Both teacherId and studentId are required" });
    }

    // Check if a conversation already exists with the provided members
    const existingConversation = await Conversation.findOne({
      members: { $all: [teacherId, studentId] }
    });

    if (existingConversation) {
      return res.status(200).json({ _id: existingConversation._id });
    }

    const conversation = new Conversation({
      members: [teacherId, studentId]
    });
    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
