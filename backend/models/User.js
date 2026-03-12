const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'company', 'admin'],
    default: 'student'
  },
  // Student specific fields
  university: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  graduationYear: {
    type: Number,
    required: function() { return this.role === 'student'; }
  },
  major: {
    type: String,
    required: function() { return this.role === 'student'; }
  },
  skills: [String],
  resumeUrl: String,
  
  // Company specific fields
  companyName: {
    type: String,
    required: function() { return this.role === 'company'; }
  },
  industry: {
    type: String,
    required: function() { return this.role === 'company'; }
  },
  companyLocation: {
    type: String,
    required: function() { return this.role === 'company'; }
  },
  companyDescription: String,
  website: String,
  
  // Common fields
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);