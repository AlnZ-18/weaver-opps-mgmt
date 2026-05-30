const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Application must be linked to a student'],
  },
  opportunity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: [true, 'Application must be linked to an opportunity'],
  },
  resumeSnapshotUrl: {
    type: String,
    required: [true, 'A resume snapshot is required at the time of application'],
  },
  status: {
    type: String,
    enum: ['applied', 'reviewing', 'interviewing', 'accepted', 'rejected'],
    default: 'applied',
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['applied', 'reviewing', 'interviewing', 'accepted', 'rejected'],
        required: true,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Admin who transitioned the state
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [200, 'Comment cannot exceed 200 characters'],
      },
    },
  ],
}, {
  timestamps: true,
});

// Enforce unique application constraints (A student can apply to a specific opportunity only once)
ApplicationSchema.index({ student: 1, opportunity: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
