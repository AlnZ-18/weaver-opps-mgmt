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
      message: '{VALUE} is not a valid exchange application status.'
    },
    default: 'Applied',
    required: [true, 'Application status is required'],
  },
}, {
  timestamps: true,
});

// CRITICAL: Compound unique constraint index preventing duplicate applications from same user for same opportunity
ApplicationSchema.index({ userId: 1, opportunityId: 1 }, { unique: true });
ApplicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', ApplicationSchema);
