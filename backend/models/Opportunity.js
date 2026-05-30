const mongoose = require('mongoose');

const OpportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide an opportunity title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide an opportunity description'],
  },
  type: {
    type: String,
    enum: {
      values: ['GTa', 'GV'], // GTa: Global Talent, GV: Global Volunteer
      message: '{VALUE} is not a valid exchange type. Must be either GTa or GV.',
    },
    required: [true, 'Please specify exchange type (GTa/GV)'],
  },
  subType: {
    type: String, // e.g. Business Administration, Teaching, SDG 4: Quality Education
    required: [true, 'Please specify exchange sub-type/theme'],
    trim: true,
  },
  location: {
    type: String, // e.g. Budapest, Hungary
    required: [true, 'Please specify the exchange location'],
    trim: true,
  },
  duration: {
    type: Number, // Duration in weeks (e.g. 6, 12, 24)
    required: [true, 'Please specify opportunity duration in weeks'],
    min: [2, 'Duration must be at least 2 weeks'],
  },
  salary: {
    type: String, // e.g. "Unpaid", "$400 USD/month"
    default: 'Unpaid',
    trim: true,
  },
  vacancies: {
    type: Number,
    required: [true, 'Please specify the number of vacancies available'],
    min: [1, 'Must have at least 1 vacancy'],
    default: 1,
  },
  requirements: {
    type: [String],
    default: [],
  },
  responsibilities: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
  deadline: {
    type: Date,
    required: [true, 'Please specify an application deadline date'],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the Admin user who published it
    required: [true, 'Opportunity must be linked to an admin creator'],
  },
}, {
  timestamps: true,
});

// Configure compound indexes to query open GV or GTa records efficiently
OpportunitySchema.index({ type: 1, status: 1 });
OpportunitySchema.index({ deadline: 1 });

module.exports = mongoose.model('Opportunity', OpportunitySchema);
