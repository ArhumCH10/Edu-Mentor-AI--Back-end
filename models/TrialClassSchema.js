const mongoose = require('mongoose');

const TrialClassSchema = new mongoose.Schema({
  classUrl: { type: String, required: true },
  meetContent: { type: String, required: true },
  studentName: { type: String, required: true },
  teacherName: { type: String, required: true },
  lessonTime: { type: String, required: true },
  lessonTimeDuration: { type: Number, required: true },
  status: { type: Boolean, default: false },
  subjectsTaught: { type: String, required: true },
  amountPaid: { type: Number, required: true },
}, { timestamps: true });

const TrialClass = mongoose.model('TrialClass', TrialClassSchema);

module.exports = TrialClass;