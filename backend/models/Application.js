const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Application must be linked to a user account'],
  },
  opportunityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Opportunity',
    required: [true, 'Application must be linked to an exchange opportunity'],
  },
  status: {
    type: String,
    enum: {
      values: ['Applied', 'Under Review', 'Accepted', 'Rejected'],
      message: '{VALUE} is not a valid application status.'
    },
    default: 'Applied',
    required: [true, 'Application status is required'],
  },
  // Audit log of state changes for robust administrative tracking
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['Applied', 'Under Review', 'Accepted', 'Rejected'],
        required: true,
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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

// CRITICAL: Unique compound index to prevent duplicate applications from the same user for the same opportunity
ApplicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
