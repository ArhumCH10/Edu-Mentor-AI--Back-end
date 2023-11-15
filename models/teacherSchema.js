const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    university: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      required: true
    },
    degreeType: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      required: true
    },
    yearsOfStudyFrom: {
      type: Number,
      required: true
    },
    yearsOfStudyTo: {
      type: Number,
      required: true
    },
    educationPhoto: {
      type: Buffer
    }
  });

const certificationSchema = new mongoose.Schema({
    subject: {
      type: String,
      required: true
    },
    certificate: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    issuedBy: {
      type: String,
      required: true
    },
    yearsOfStudyFrom: {
      type: Number,
      required: true
    },
    yearsOfStudyTo: {
      type: Number,
      required: true
    },
    certificationPhoto: {
      type: Buffer // Store certification image data as a buffer
    }
  });

  
const availabilitySlotSchema = new mongoose.Schema({
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    }
  });

  const availabilityDaySchema = new mongoose.Schema({
    day: {
      type: String,
      required: true
    },
    allDay: {
      type: Boolean,
      default: false
    },
    slots: [availabilitySlotSchema]
  });

const teacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  countryOrigin: {type: String, required: true},
  LanguageSpoken: {type: [String], required: true},
  levelsTaught: {
    type: String,
    required: true
  },
  subjectsTaught: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  isGreaterThan18: {
    type: Boolean,
    required: true
  },
  isVerified: { type: Boolean, default: false },
  profilePhoto: {
    type: Buffer 
  },
  profileDescription: {
    introduceYourself: {
      type: String,
      required: true
    },
    teachingExperience: {
      type: String,
      required: true
    },
    motivateStudents: {
      type: String,
      required: true
    },
    catchyHeadline: {
        type: String,
        required: true
    },
  },
  video: {
    link: {
      type: String
    },
    thumbnail: {
      type: Buffer 
    },
    data: {
        type: Buffer // Store video data as a buffer
    },
  },
  hourlyPriceUSD: {
    type: Number,
    required: true
  },
  noTeachingCertification: {
    type: Boolean,
    required: true
  },
  certifications: [certificationSchema],
  noEducationCertification: {
    type: Boolean,
    required: true
  },
  educations: [educationSchema],
  availability: [availabilityDaySchema],
});

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = Teacher;
