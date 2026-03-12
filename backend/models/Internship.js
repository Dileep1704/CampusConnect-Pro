const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [String],
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Remote', 'Hybrid'],
    default: 'Full-time'
  },
  duration: {
    type: String,
    enum: ['1-3 months', '3-6 months', '6-12 months'],
    default: '3-6 months'
  },
  stipend: {
    type: String,
    default: 'Unpaid'
  },
  skills: [String],
  openings: {
    type: Number,
    default: 1,
    min: 1
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  startDate: Date,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  applicationsCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Internship', internshipSchema);