const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an opportunity title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  programType: {
    type: String,
    enum: {
      values: ['GTa', 'GV'], // GTa: Global Talent, GV: Global Volunteer
      message: '{VALUE} is not a valid exchange program type. Must be either GTa or GV.',
    },
    required: [true, 'Please specify program type (GTa/GV)'],
  },
  country: {
    type: String,
    required: [true, 'Please specify country destination location'],
    trim: true,
  },
  city: {
    type: String,
    required: [true, 'Please specify city destination location'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a program description'],
  },
  stipend: {
    type: String,
    required: [true, 'Please provide stipend details (e.g. Unpaid, $400 USD/month)'],
    trim: true,
  },
  duration: {
    type: Number, // duration in weeks
    required: [true, 'Please specify program duration in weeks'],
    min: [2, 'Duration must be at least 2 weeks'],
  },
  skillsRequired: {
    type: [String],
    default: [],
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Please specify the application deadline date'],
  },
  status: {
    type: String,
    enum: ['Open', 'Closed'],
    default: 'Open',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // References the administrative user
    required: [true, 'Opportunity must be linked to an admin creator account'],
  },
}, {
  timestamps: true,
});

// Configure compound search index for GTa/GV active lists
OpportunitySchema.index({ programType: 1, status: 1 });
OpportunitySchema.index({ applicationDeadline: 1 });

module.exports = mongoose.model('Opportunity', OpportunitySchema);
