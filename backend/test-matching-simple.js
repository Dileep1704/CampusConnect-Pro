/**
 * Simple test script for matching routes
 * Run with: node test-matching-simple.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Import models
const User = require('./models/User');
const Internship = require('./models/Internship');

// Import services
const semanticMatcher = require('./services/ai/semanticMatcher');

async function testMatching() {
  console.log('*** TESTING AI MATCHING SYSTEM ***\n');

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect');
    console.log('CONNECTED TO MONGODB SUCCESSFULLY\n');

    // Find a student with resume
    let student = await User.findOne({ 
      role: 'student',
      'parsedResume': { $exists: true } 
    });

    if (!student) {
      console.log('Creating test student with mock resume data...');
      
      // Create mock resume data
      const mockResumeData = {
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express', 'HTML', 'CSS', 'Python', 'Java'],
        education: [{
          degree: 'Bachelor of Technology in Computer Science',
          institution: 'Test University',
          year: '2025'
        }],
        experience: [{
          title: 'Software Developer Intern',
          company: 'Tech Company',
          duration: '6 months',
          description: ['Worked on full-stack development projects']
        }],
        totalExperience: 0.5
      };

      // Find any student
      student = await User.findOne({ role: 'student' });
      
      if (student) {
        student.parsedResume = mockResumeData;
        await student.save();
        console.log('Updated existing student with mock resume data');
      } else {
        console.log('No student found. Creating a test student...');
        
        // Create a test student
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        student = new User({
          name: 'Test Student',
          email: 'test.student@example.com',
          password: hashedPassword,
          role: 'student',
          university: 'Test University',
          graduationYear: 2025,
          major: 'Computer Science',
          parsedResume: mockResumeData
        });
        
        await student.save();
        console.log('Created new test student');
      }
    }

    console.log('Testing with student:', student.email);
    console.log('Resume skills:', student.parsedResume.skills.join(', '));
    console.log('');

    // Check if internships exist
    const internships = await Internship.find({ status: 'approved' });
    
    if (internships.length === 0) {
      console.log('No internships found. Creating mock internships...');
      
      // Get a company user or create one
      let company = await User.findOne({ role: 'company' });
      
      if (!company) {
        console.log('Creating test company...');
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);
        
        company = new User({
          name: 'Test Company HR',
          email: 'company@test.com',
          password: hashedPassword,
          role: 'company',
          companyName: 'Tech Corp',
          industry: 'IT Services',
          companyLocation: 'Bangalore'
        });
        
        await company.save();
        console.log('Created test company');
      }

      // Create mock internships with valid enum values
      const mockInternships = [
        {
          title: 'Frontend Developer Intern',
          company: company._id,
          companyName: company.companyName || 'Tech Corp',
          description: 'Looking for a passionate frontend developer intern with React experience',
          requirements: [
            'Strong knowledge of React.js',
            'Experience with JavaScript/ES6',
            'Understanding of HTML5 and CSS3',
            'Good problem-solving skills'
          ],
          location: 'Bangalore',
          type: 'Full-time',
          duration: '3-6 months',
          stipend: '₹20,000/month',
          skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Redux'],
          openings: 2,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'approved',
          createdBy: company._id
        },
        {
          title: 'Backend Developer Intern',
          company: company._id,
          companyName: company.companyName || 'Startup Inc',
          description: 'Looking for a backend developer intern with Node.js experience',
          requirements: [
            'Proficiency in Node.js',
            'Experience with MongoDB',
            'Understanding of REST APIs',
            'Knowledge of Express framework'
          ],
          location: 'Remote',
          type: 'Remote',
          duration: '6-12 months',
          stipend: '₹25,000/month',
          skills: ['Node.js', 'Express', 'MongoDB', 'JavaScript', 'REST API'],
          openings: 3,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'approved',
          createdBy: company._id
        },
        {
          title: 'Full Stack Developer Intern',
          company: company._id,
          companyName: company.companyName || 'Innovation Labs',
          description: 'Full stack developer intern for exciting projects',
          requirements: [
            'Experience with MERN stack',
            'Understanding of both frontend and backend',
            'Knowledge of databases',
            'Good communication skills'
          ],
          location: 'Hyderabad',
          type: 'Hybrid',
          duration: '3-6 months',
          stipend: '₹22,000/month',
          skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'HTML', 'CSS'],
          openings: 2,
          applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: 'approved',
          createdBy: company._id
        }
      ];

      for (const job of mockInternships) {
        await Internship.create(job);
      }
      
      console.log(`Created ${mockInternships.length} mock internships\n`);
    }

    // Refresh internships list
    const allInternships = await Internship.find({ status: 'approved' });
    console.log(`Found ${allInternships.length} internships for testing\n`);

    // Test matching
    console.log('Calculating AI-powered matches...\n');
    console.log('='.repeat(60));
    
    const matches = [];
    
    for (const job of allInternships) {
      const score = await semanticMatcher.calculateMatch(
        student.parsedResume,
        job
      );
      
      matches.push({
        job,
        score
      });
    }

    // Sort by match score
    matches.sort((a, b) => b.score.total - a.score.total);

    // Display results
    matches.forEach((match, index) => {
      const { job, score } = match;
      
      console.log(`\nMATCH #${index + 1}: ${job.title}`);
      console.log(`   Company: ${job.companyName}`);
      console.log(`   Location: ${job.location} | Type: ${job.type} | Duration: ${job.duration}`);
      console.log(`   Stipend: ${job.stipend}`);
      console.log(`   ${'-'.repeat(50)}`);
      console.log(`   OVERALL MATCH: ${score.total}%`);
      console.log(`   ${'-'.repeat(50)}`);
      console.log(`   Breakdown:`);
      console.log(`      • Semantic AI: ${score.semantic}%`);
      console.log(`      • Skills Match: ${score.skills}%`);
      console.log(`      • Experience: ${score.experience}%`);
      console.log(`   ${'-'.repeat(50)}`);
      
      if (score.matchedSkills && score.matchedSkills.length > 0) {
        console.log(`   Matched Skills:`);
        console.log(`      ${score.matchedSkills.join(', ')}`);
      }
      
      if (score.missingSkills && score.missingSkills.length > 0) {
        console.log(`   Skills to Improve:`);
        console.log(`      ${score.missingSkills.join(', ')}`);
      }
      
      console.log(`   ${'-'.repeat(50)}`);
    });

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('MATCH SUMMARY');
    console.log('='.repeat(60));
    if (matches.length > 0) {
      console.log(`Best Match: ${matches[0]?.job.title} (${matches[0]?.score.total}%)`);
      const avgMatch = Math.round(matches.reduce((acc, m) => acc + m.score.total, 0) / matches.length);
      console.log(`Average Match: ${avgMatch}%`);
    }
    console.log(`Total Internships Analyzed: ${matches.length}`);
    console.log('='.repeat(60));

    console.log('\nAll tests completed successfully!');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the test
testMatching();