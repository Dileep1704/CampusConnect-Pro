const tfidfService = require('./tfidfService');
const Internship = require('../../models/Internship');
const User = require('../../models/User');

class SemanticMatcher {
  constructor() {
    this.tfidfService = tfidfService;
  }

  /**
   * Calculate match score between resume and job
   */
  async calculateMatch(resumeData, jobData) {
    // Combine relevant fields for matching
    const resumeText = this.prepareResumeText(resumeData);
    const jobText = this.prepareJobText(jobData);
    
    // Add documents to TF-IDF
    const resumeIndex = this.tfidfService.addDocument(resumeText, 'resume', 'resume');
    const jobIndex = this.tfidfService.addDocument(jobText, jobData._id, 'job');
    
    // Calculate similarity
    const similarity = this.tfidfService.cosineSimilarity(
      this.tfidfService.tfidf, resumeIndex,
      this.tfidfService.tfidf, jobIndex
    );
    
    // Calculate skill match percentage separately
    const skillMatch = this.calculateSkillMatch(resumeData.skills, jobData.skills);
    
    // Calculate experience match
    const experienceMatch = this.calculateExperienceMatch(
      resumeData.totalExperience || 0,
      jobData.requiredExperience || 0
    );
    
    // Weighted score (50% semantic, 30% skills, 20% experience)
    const finalScore = (
      similarity * 0.5 +
      skillMatch * 0.3 +
      experienceMatch * 0.2
    ) * 100;
    
    return {
      total: Math.min(Math.round(finalScore), 100),
      semantic: Math.round(similarity * 100),
      skills: Math.round(skillMatch * 100),
      experience: Math.round(experienceMatch * 100),
      matchedSkills: this.getMatchedSkills(resumeData.skills, jobData.skills),
      missingSkills: this.getMissingSkills(resumeData.skills, jobData.skills)
    };
  }

  /**
   * Prepare resume text for matching
   */
  prepareResumeText(resumeData) {
    const parts = [];
    
    // Add skills
    if (resumeData.skills) {
      resumeData.skills.forEach(skill => {
        if (typeof skill === 'string') {
          parts.push(skill);
        } else if (skill.name) {
          parts.push(skill.name);
        }
      });
    }
    
    // Add experience descriptions
    if (resumeData.experience) {
      resumeData.experience.forEach(exp => {
        if (exp.title) parts.push(exp.title);
        if (exp.company) parts.push(exp.company);
        if (exp.description) parts.push(exp.description.join(' '));
      });
    }
    
    // Add education
    if (resumeData.education) {
      resumeData.education.forEach(edu => {
        if (edu.degree) parts.push(edu.degree);
        if (edu.field) parts.push(edu.field);
        if (edu.institution) parts.push(edu.institution);
      });
    }
    
    return parts.join(' ');
  }

  /**
   * Prepare job text for matching
   */
  prepareJobText(jobData) {
    const parts = [
      jobData.title,
      jobData.description,
      ...(jobData.requirements || []),
      ...(jobData.skills || [])
    ];
    
    return parts.join(' ');
  }

  /**
   * Calculate skill match percentage
   */
  calculateSkillMatch(resumeSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) return 1;
    if (!resumeSkills || resumeSkills.length === 0) return 0;
    
    // Convert to arrays of skill names
    const resumeSkillNames = resumeSkills.map(s => 
      typeof s === 'string' ? s.toLowerCase() : s.name.toLowerCase()
    );
    
    const jobSkillNames = jobSkills.map(s => s.toLowerCase());
    
    // Count matches
    let matches = 0;
    jobSkillNames.forEach(jobSkill => {
      if (resumeSkillNames.includes(jobSkill)) {
        matches++;
      } else {
        // Check for partial matches (e.g., "javascript" matches "js")
        const partialMatch = resumeSkillNames.some(resumeSkill => 
          resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)
        );
        if (partialMatch) matches += 0.5;
      }
    });
    
    return matches / jobSkillNames.length;
  }

  /**
   * Calculate experience match
   */
  calculateExperienceMatch(resumeYears, requiredYears) {
    if (!requiredYears) return 1;
    if (!resumeYears) return 0;
    
    if (resumeYears >= requiredYears) {
      return 1;
    } else {
      return resumeYears / requiredYears;
    }
  }

  /**
   * Get matched skills
   */
  getMatchedSkills(resumeSkills, jobSkills) {
    if (!resumeSkills || !jobSkills) return [];
    
    const resumeSkillNames = resumeSkills.map(s => 
      typeof s === 'string' ? s : s.name
    );
    
    return jobSkills.filter(jobSkill => 
      resumeSkillNames.some(resumeSkill => 
        resumeSkill.toLowerCase() === jobSkill.toLowerCase()
      )
    );
  }

  /**
   * Get missing skills
   */
  getMissingSkills(resumeSkills, jobSkills) {
    if (!jobSkills) return [];
    if (!resumeSkills) return jobSkills;
    
    const resumeSkillNames = resumeSkills.map(s => 
      typeof s === 'string' ? s.toLowerCase() : s.name.toLowerCase()
    );
    
    return jobSkills.filter(jobSkill => 
      !resumeSkillNames.includes(jobSkill.toLowerCase())
    );
  }

  /**
   * Find best matches for a resume
   */
  async findMatchesForResume(resumeData, limit = 10) {
    const internships = await Internship.find({ status: 'approved' });
    
    const matches = [];
    for (const job of internships) {
      const score = await this.calculateMatch(resumeData, job);
      matches.push({
        internship: job,
        matchScore: score
      });
    }
    
    // Sort by total score
    matches.sort((a, b) => b.matchScore.total - a.matchScore.total);
    
    return matches.slice(0, limit);
  }

  /**
   * Find best candidates for a job
   */
  async findCandidatesForJob(jobId, limit = 10) {
    const job = await Internship.findById(jobId);
    if (!job) return [];
    
    const students = await User.find({ 
      role: 'student',
      'parsedResume': { $exists: true } 
    });
    
    const matches = [];
    for (const student of students) {
      const score = await this.calculateMatch(student.parsedResume, job);
      matches.push({
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          resumeUrl: student.resumeUrl
        },
        matchScore: score
      });
    }
    
    matches.sort((a, b) => b.matchScore.total - a.matchScore.total);
    
    return matches.slice(0, limit);
  }
}

module.exports = new SemanticMatcher();