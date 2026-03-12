const BaseNLPService = require('../nlp/baseParser');
const SkillExtractor = require('../nlp/skillExtractor');
const ExperienceExtractor = require('../nlp/experienceExtractor');
const EducationExtractor = require('../nlp/educationExtractor');

class AdvancedResumeParser {
  constructor() {
    this.baseNLP = BaseNLPService;
    this.skillExtractor = SkillExtractor;
    this.experienceExtractor = ExperienceExtractor;
    this.educationExtractor = EducationExtractor;
  }

  /**
   * Main parsing function
   */
  async parseResume(filePath, fileType) {
    console.log('🔍 Starting advanced resume parsing...');
    
    // Step 1: Extract text from file
    const text = await this.baseNLP.extractText(filePath, fileType);
    
    // Step 2: Extract entities (name, email, phone)
    const entities = this.baseNLP.extractEntities(text);
    
    // Step 3: Extract skills with context
    const skills = await this.skillExtractor.extractSkills(text);
    
    // Step 4: Extract work experience
    const experience = this.experienceExtractor.extractExperience(text);
    
    // Step 5: Extract education
    const education = this.educationExtractor.extractEducation(text);
    
    // Step 6: Calculate overall experience years
    const totalExperience = this.calculateTotalExperience(experience);
    
    // Step 7: Generate summary
    const summary = this.generateSummary(skills, experience, education);
    
    return {
      name: entities.people[0] || null,
      email: entities.emails[0] || null,
      phone: entities.phones[0] || null,
      skills: skills,
      experience: experience,
      education: education,
      totalExperience: totalExperience,
      summary: summary,
      rawEntities: entities
    };
  }

  /**
   * Calculate total years of experience
   */
  calculateTotalExperience(experience) {
    let totalYears = 0;
    
    experience.forEach(exp => {
      if (exp.duration) {
        const match = exp.duration.match(/(\d+)\s*(year|yr|month)/i);
        if (match) {
          const value = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          
          if (unit.startsWith('year') || unit.startsWith('yr')) {
            totalYears += value;
          } else if (unit.startsWith('month')) {
            totalYears += value / 12;
          }
        }
      }
    });
    
    return Math.round(totalYears * 10) / 10; // Round to 1 decimal
  }

  /**
   * Generate resume summary
   */
  generateSummary(skills, experience, education) {
    const topSkills = skills.slice(0, 5).map(s => s.name).join(', ');
    const expCount = experience.length;
    const eduLevel = education[0]?.degree || 'Not specified';
    
    return `${expCount} positions, ${eduLevel}. Key skills: ${topSkills}`;
  }
}

module.exports = new AdvancedResumeParser();