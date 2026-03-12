/**
 * Test script for matching routes
 * Run with: node test-matching.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Import models
const User = require('./models/User');
const Internship = require('./models/Internship');

// Import services
const semanticMatcher = require('./services/ai/semanticMatcher');
const AdvancedResumeParser = require('./services/ai/advancedResumeParser');

async function testMatching() {
  console.log('🧪 Testing AI Matching System...\n');

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect');
    console.log('✅ Connected to MongoDB\n');

    // Find a student with resume
    const student = await User.findOne({ 
      role: 'student',
      'parsedResume': { $exists: true } 
    });

    if (!student) {
      console.log('❌ No student with resume found. Please upload a resume first.');
      process.exit(1);
    }

    console.log('📋 Testing with student:', student.email);
    console.log('📄 Resume skills:', student.parsedResume.skills.slice(0, 5).map(s => s.name || s).join(', '));
    console.log('');

    // Find internships
    const internships = await Internship.find({ status: 'approved' }).limit(5);
    console.log(`📊 Found ${internships.length} internships for testing\n`);

    // Test matching
    console.log('🎯 Calculating matches...\n');
    
    for (const job of internships) {
      const score = await semanticMatcher.calculateMatch(
        student.parsedResume,
        job
      );
      
      console.log(`📌 ${job.title} at ${job.companyName}`);
      console.log(`   Match Score: ${score.total}%`);
      console.log(`   - Semantic: ${score.semantic}%`);
      console.log(`   - Skills: ${score.skills}%`);
      console.log(`   - Experience: ${score.experience}%`);
      console.log(`   ✅ Matched: ${score.matchedSkills.join(', ')}`);
      if (score.missingSkills.length > 0) {
        console.log(`   ❌ Missing: ${score.missingSkills.join(', ')}`);
      }
      console.log('');
    }

    // Test health endpoint
    console.log('🏥 Testing health endpoint...');
    const healthCheck = await fetch('http://localhost:5000/health');
    const health = await healthCheck.json();
    console.log('   Status:', health.status);
    console.log('   Database:', health.database);
    console.log('');

    console.log('✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔒 Database connection closed');
  }
}

// Run the test
testMatching();