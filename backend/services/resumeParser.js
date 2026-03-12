const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

class ResumeParser {
  // Extract text from PDF
  async parsePDF(filePath) {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  // Extract text from DOC/DOCX
  async parseDoc(filePath) {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  }

  // Extract skills from text
  extractSkills(text) {
    const skillKeywords = [
      'javascript', 'python', 'java', 'c++', 'react', 'node.js', 'express',
      'mongodb', 'sql', 'html', 'css', 'aws', 'docker', 'git', 'typescript',
      'angular', 'vue', 'php', 'ruby', 'swift', 'kotlin', 'flutter',
      'machine learning', 'data science', 'ai', 'cloud computing',
      'communication', 'teamwork', 'leadership', 'problem solving'
    ];

    const foundSkills = [];
    const lowerText = text.toLowerCase();

    skillKeywords.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    });

    return [...new Set(foundSkills)]; // Remove duplicates
  }

  // Extract education
  extractEducation(text) {
    const education = [];
    const lines = text.split('\n');
    
    const degreeKeywords = ['bachelor', 'master', 'phd', 'b.tech', 'm.tech', 'b.e.', 'm.e.', 'b.sc', 'm.sc'];
    const universityKeywords = ['university', 'college', 'institute', 'school'];
    
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      // Check for degree
      degreeKeywords.forEach(degree => {
        if (lowerLine.includes(degree)) {
          education.push({
            degree: line.trim(),
            institution: '',
            year: ''
          });
        }
      });
    });

    return education;
  }

  // Extract experience
  extractExperience(text) {
    const experience = [];
    const lines = text.split('\n');
    
    const experienceKeywords = ['experience', 'work', 'job', 'internship', 'employment'];
    let currentExperience = null;

    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      
      experienceKeywords.forEach(keyword => {
        if (lowerLine.includes(keyword)) {
          if (currentExperience) {
            experience.push(currentExperience);
          }
          currentExperience = {
            title: line.trim(),
            company: '',
            duration: '',
            description: []
          };
        }
      });

      if (currentExperience && line.trim() && !experienceKeywords.some(k => lowerLine.includes(k))) {
        currentExperience.description.push(line.trim());
      }
    });

    if (currentExperience) {
      experience.push(currentExperience);
    }

    return experience;
  }

  // Calculate match score with job requirements
  calculateMatchScore(resumeData, jobRequirements) {
    let score = 0;
    const maxScore = 100;

    // Skills match (50 points)
    const requiredSkills = jobRequirements.skills || [];
    const matchedSkills = requiredSkills.filter(skill => 
      resumeData.skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
    const skillScore = (matchedSkills.length / requiredSkills.length) * 50;
    score += skillScore;

    // Experience match (30 points)
    const requiredExperience = jobRequirements.experience || 0;
    const candidateExperience = resumeData.experience.length;
    const experienceScore = Math.min((candidateExperience / requiredExperience) * 30, 30);
    score += experienceScore;

    // Education match (20 points)
    if (resumeData.education.length > 0) {
      score += 20;
    }

    return {
      total: Math.round(score),
      breakdown: {
        skills: Math.round(skillScore),
        experience: Math.round(experienceScore),
        education: Math.round(score >= 70 ? 20 : 0)
      },
      matchedSkills,
      missingSkills: requiredSkills.filter(skill => 
        !resumeData.skills.some(s => s.toLowerCase() === skill.toLowerCase())
      )
    };
  }

  // Main parsing function
  async parseResume(filePath, fileType) {
    try {
      let text = '';
      
      if (fileType === 'application/pdf') {
        text = await this.parsePDF(filePath);
      } else if (fileType.includes('document')) {
        text = await this.parseDoc(filePath);
      }

      const resumeData = {
        skills: this.extractSkills(text),
        education: this.extractEducation(text),
        experience: this.extractExperience(text),
        rawText: text.substring(0, 500) // Store preview only
      };

      return resumeData;
    } catch (error) {
      console.error('Resume parsing error:', error);
      throw error;
    }
  }
}

module.exports = new ResumeParser();