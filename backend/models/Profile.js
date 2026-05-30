const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Profile must be linked to a user account'],
    unique: true, // One-to-one relationship
  },
  phone: {
    type: String,
    required: [true, 'Please provide your contact phone number'],
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
      message: '{VALUE} is not an authorized local university dropdown item.'
    },
    required: [true, 'Please specify your university affiliation'],
  },
  course: {
    type: String,
    required: [true, 'Please specify your major course (e.g. B.Tech CSE, BBA)'],
    trim: true,
  },
  graduationYear: {
    type: Number,
    required: [true, 'Please specify your planned graduation year'],
    min: [2000, 'Please enter a valid graduation year'],
  },
  linkedin: {
    type: String,
    trim: true,
    match: [
      /^(https?:\/\/)?(www\.)?linkedin\.com\/.*$/,
      'Please provide a valid LinkedIn profile link',
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

// Create indexes
ProfileSchema.index({ userId: 1 });
ProfileSchema.index({ university: 1 });

module.exports = mongoose.model('Profile', ProfileSchema);
