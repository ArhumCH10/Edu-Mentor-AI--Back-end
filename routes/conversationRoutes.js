const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversation');
const TeacherDb = require('../models/teacherSchema');

// Get all conversations for a teacher
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const conversations = await Conversation.find({ members: teacherId });
    res.json(conversations);
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
      console.log('conversations: ', conversations)
  
      // Fetching teacher details for each conversation
      const conversationsWithTeacherDetails = await Promise.all(conversations.map(async conversation => {
        const teacherId = conversation.members[0]; // Assuming teacherId is at index 0
        const teacher = await TeacherDb.findById(teacherId); // Assuming Teacher model is used
        
        // Appending teacher details to the conversation data
        return {
          ...conversation.toObject(), // Convert Mongoose document to JavaScript object
          teacherProfilePicture: teacher.profilePhoto,
          teacherFirstName: teacher.firstName,
          teacherLastName: teacher.lastName
        };
      }));
      console.log('conversationsWithTeacherDetails: ', conversationsWithTeacherDetails)
  
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
