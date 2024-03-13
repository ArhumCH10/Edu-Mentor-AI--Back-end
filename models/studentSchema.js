const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  verificationCode: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  levels: {
    type: Number,
    default: 0, // Default level is 0
  },
  description: {
    type: String,
  },
  education: {
    type: String,
  },
  languages: {
    type: String,
  },
  country: {
    type: String,
  },
  totalLessons: {
    type: String,
  },
  grade: {
    type: String,
  },
  // Add username field with a custom function to generate a random username
  username: {
    type: String,
    required: true,
    unique: true,
    default: function () {
      // Generate a random username based on the user's name and digits
      const usernamePrefix = this.name.toLowerCase().replace(/\s/g, ""); // Remove spaces and convert to lowercase
      const randomDigits = Math.floor(Math.random() * 1000); // Generate random digits
      return `${usernamePrefix}${randomDigits}`;
    },
  },
});

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
