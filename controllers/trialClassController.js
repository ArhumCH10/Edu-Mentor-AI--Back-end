const TrialClass  = require('../models/TrialClassSchema');
const Teacher  = require('../models/teacherSchema');

const createTrialClass = async (req, res) => {
 
  try {
    const {lessonDetails,quizOutline} = req.body;
    const newTrialClass = new TrialClass(lessonDetails);
    await newTrialClass.save();

    const teacher = await Teacher.findById(newTrialClass.teacherId).select('profilePhoto');
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const updatedTrialClass = {
      ...newTrialClass.toObject(),
      teacherProfilePic: teacher.profilePhoto || './default-user.jpg',
      quizOutline,
    };
    const notifyStudent = req.app.locals.notifyStudent;
    notifyStudent(newTrialClass.studentName, updatedTrialClass);

    res.status(201).json(TrialClass);
  } catch (error) {
    res.status(500).json({ message: 'Error saving trial class', error });
  }
};

const getAllTrialClasses = async (req, res) => {
  try {
    const trialClasses = await TrialClass.find();
    res.status(200).json(trialClasses);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving trial classes', error });
  }
};

const getActiveTrialClasses = async (req, res) => {
  try {
    const studentName = req.query.studentName;
    const activeClasses = await TrialClass.find({ studentName, status: 'true' }).exec(); 

    res.status(200).json(activeClasses);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving active trial classes', error });
  }
}

module.exports = { createTrialClass, getAllTrialClasses,getActiveTrialClasses };
