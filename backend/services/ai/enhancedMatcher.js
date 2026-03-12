const sentenceTransformer = require('./sentenceTransformerService');
const User = require('../../models/User');
const Internship = require('../../models/Internship');

class EnhancedMatcher {
  constructor() {
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await sentenceTransformer.initialize();
      this.initialized = true;
    }
  }

  /**
   * Prepare text for embedding
   */
  prepareText(data, type = 'resume') {
    const parts = [];
    
    if (type === 'resume') {
      // Add skills with weights
      if (data.skills) {
        data.skills.forEach(skill => {
          if (typeof skill === 'string') {
            parts.push(skill);
          } else if (skill.name) {
            parts.push(skill.name);
          }
        });
      }
      
      // Add experience descriptions
      if (data.experience) {
        data.experience.forEach(exp => {
          if (exp.title) parts.push(exp.title);
          if (exp.company) parts.push(exp.company);
          if (exp.description) parts.push(exp.description.join(' '));
        });
      }
      
      // Add education
      if (data.education) {
        data.education.forEach(edu => {
          if (edu.degree) parts.push(edu.degree);
          if (edu.field) parts.push(edu.field);
        });
      }
    } else {
      // Job posting
      parts.push(data.title);
      parts.push(data.description);
      if (data.requirements) parts.push(...data.requirements);
      if (data.skills) parts.push(...data.skills);
    }
    
    return parts.join(' ').toLowerCase();
  }

  /**
   * Calculate enhanced match score
   */
  async calculateMatch(resumeData, jobData) {
    await this.initialize();
    
    // Prepare texts
    const resumeText = this.prepareText(resumeData, 'resume');
    const jobText = this.prepareText(jobData, 'job');
    
    // Get semantic similarity using transformers
    const semanticScore = await sentenceTransformer.computeSimilarity(resumeText, jobText);
    
    // Calculate skill match
    const skillMatch = this.calculateSkillMatch(resumeData.skills, jobData.skills);
    
    // Calculate experience match
    const experienceMatch = this.calculateExperienceMatch(
      resumeData.totalExperience || 0,
      jobData.requiredExperience || 0
    );
    
    // Weighted score (60% semantic, 30% skills, 10% experience)
    const finalScore = (
      semanticScore * 0.6 +
      skillMatch * 0.3 +
      experienceMatch * 0.1
    ) * 100;
    
    return {
      total: Math.min(Math.round(finalScore), 100),
      semantic: Math.round(semanticScore * 100),
      skills: Math.round(skillMatch * 100),
      experience: Math.round(experienceMatch * 100),
      matchedSkills: this.getMatchedSkills(resumeData.skills, jobData.skills),
      missingSkills: this.getMissingSkills(resumeData.skills, jobData.skills),
      embeddingQuality: semanticScore > 0.8 ? 'excellent' : semanticScore > 0.6 ? 'good' : 'average'
    };
  }

  calculateSkillMatch(resumeSkills, jobSkills) {
    if (!jobSkills || jobSkills.length === 0) return 1;
    if (!resumeSkills || resumeSkills.length === 0) return 0;
    
    const resumeSkillNames = resumeSkills.map(s => 
      typeof s === 'string' ? s.toLowerCase() : s.name.toLowerCase()
    );
    
    const jobSkillNames = jobSkills.map(s => s.toLowerCase());
    
    let matches = 0;
    jobSkillNames.forEach(jobSkill => {
      if (resumeSkillNames.includes(jobSkill)) {
        matches++;
      } else {
        // Check for partial matches
        const partialMatch = resumeSkillNames.some(resumeSkill => 
          resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill)
        );
        if (partialMatch) matches += 0.5;
      }
    });
    
    return matches / jobSkillNames.length;
  }

  calculateExperienceMatch(resumeYears, requiredYears) {
    if (!requiredYears) return 1;
    if (!resumeYears) return 0;
    return Math.min(resumeYears / requiredYears, 1);
  }

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
}

module.exports = new EnhancedMatcher();