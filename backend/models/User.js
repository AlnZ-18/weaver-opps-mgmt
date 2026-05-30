const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false, // Do not return password by default in queries
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student',
  },
  profile: {
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
        message: '{VALUE} is not a recognized university'
      },
      required: function () {
        return this.role === 'student';
      },
    },
    phone: {
      type: String,
      required: function () {
        return this.role === 'student';
      },
      trim: true,
    },
    currentDegree: {
      type: String,
      trim: true,
    },
    graduationYear: {
      type: Number,
    },
    resumeUrl: {
      type: String,
      default: '',
    },
    resumePublicId: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },
  },
}, {
  timestamps: true,
});

// Pre-save hook: Hash user passwords securely before database persistence
UserSchema.pre('save', async function (next) {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare entered password with stored hashed password
 * @param {string} enteredPassword
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add indexes for optimal query execution
UserSchema.index({ email: 1 });
UserSchema.index({ 'profile.university': 1 });

module.exports = mongoose.model('User', UserSchema);
