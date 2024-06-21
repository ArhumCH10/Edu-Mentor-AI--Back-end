const TrialClass = require('../models/TrialClassSchema');

const createTrialClass = async (req, res) => {
  try {
    const newTrialClass = new TrialClass(req.body);
    console.log(newTrialClass);
    await newTrialClass.save();

    const notifyStudent = req.app.locals.notifyStudent;
    notifyStudent(newTrialClass.studentName, newTrialClass);

    res.status(201).json(newTrialClass);
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
