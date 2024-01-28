const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    university: {
      type: String,
      default: null,
    },
    degree: {
      type: String,
      default: null,
    },
    degreeType: {
      type: String,
      default: null,
    },
    specialization: {
      type: String,
      default: null,
    },
    yearsOfStudyFrom: {
      type: Number,
      default: null,
    },
    educationPhoto: {
      type: Buffer,
      default: null,
    }
  });

const certificationSchema = new mongoose.Schema({
    subject: {
      type: String,
      default: null,
    },
    certificate: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    issuedBy: {
      type: String,
      default: null,
    },
    yearsOfStudyFrom: {
      type: Number,
      default: null,
    },
    certificationPhoto: {
      type: String, // Store certification image data as a buffer
      default: null,
    }
  });

const teacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: {type: String, required: true},
  firstName: {type: String,  default: null,},
  lastName: {type: String,  default: null,},
  countryOrigin: {type: String, default: null,},
  LanguageSpoken: {type: [String],  default: null,},
  isRegistered: { type: Boolean, default: false },
  registrationCompleted: { type: Boolean, default: false },
  levelsTaught: {
    type: [String], 
    default: null,
  },
  subjectsTaught: {
    type: String,
    default: null,
  },
  phoneNumber: {
    type: String,
    default: null,
  },
  isGreaterThan18: {
    type: Boolean,
    default: null,
  },
  profilePhoto: {
    type: String ,
    default: null,
  },
  profileDescription: {
    introduceYourself: {
      type: String,
      default: null,
    },
    teachingExperience: {
      type: String,
      default: null,
    },
    motivateStudents: {
      type: String,
      default: null,
    },
    catchyHeadline: {
        type: String,
        default: null,
    },
  },
  video: {
    thumbnail: {
      type: String
    },
    data: {
        type: String // Store video data as a buffer
    },
  },
  hourlyPriceUSD: {
    type: Number,
    default: null,
  },
  noTeachingCertification: {
    type: Boolean,
    default: null,
  },
  certifications: [certificationSchema],
  noEducationCertification: {
    type: Boolean,
    default: null,
  },
  educations: [educationSchema],
  availability: [{
    day: String,
    timezone: String,
    slots: [{
        from: String,
        to: String,
    }],
}],
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
