const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Profile must be linked to a user account'],
    unique: true, // One-to-one relationship mapping
  },
  phone: {
    type: String,
    required: [true, 'Please provide a contact phone number'],
    trim: true,
  },
  university: {
    type: String,
    enum: {
      values: [
        'VIT AP',
        'SRM AP',
        'KL University',
        'Amrita Amaravati',
        'Acharya Nagarjuna University',
        'RVR & JC',
        'Vignan University',
        'VVIT',
        'Others'
      ],
      message: '{VALUE} is not a recognized university in the portal system.'
    },
    required: [true, 'Please specify your university'],
  },
  course: {
    type: String,
    required: [true, 'Please specify your course/degree major (e.g. B.Tech CSE)'],
    trim: true,
  },
  graduationYear: {
    type: Number,
    required: [true, 'Please specify your graduation year'],
    min: [2000, 'Graduation year must be valid'],
  },
  linkedin: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/,
      'Please provide a valid LinkedIn profile URL',
    ],
  },
  skills: {
    type: [String],
    default: [],
  },
  resumeUrl: {
    type: String,
    default: '',
    trim: true,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Configure database indexes for high-speed queries on university demographics
ProfileSchema.index({ userId: 1 });
ProfileSchema.index({ university: 1 });

module.exports = mongoose.model('Profile', ProfileSchema);
