const BaseNLPService = require('./baseParser');
const compromise = require('compromise');

class ExperienceExtractor {
  constructor() {
    this.baseNLP = BaseNLPService;
  }

  /**
   * Extract work experience from text
   */
  extractExperience(text) {
    const experiences = [];
    const lines = text.split('\n');
    
    let currentExp = null;
    let inExperience = false;
    
    // Keywords that indicate experience sections
    const expHeaders = [
      'experience', 'work experience', 'employment', 'work history',
      'professional experience', 'career', 'job history'
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check if this line is an experience header
      const isHeader = expHeaders.some(header => 
        line.toLowerCase().includes(header)
      );
      
      if (isHeader) {
        inExperience = true;
        continue;
      }
      
      if (inExperience) {
        // Try to extract job title and company
        const jobInfo = this.extractJobInfo(line);
        
        if (jobInfo) {
          if (currentExp) {
            experiences.push(currentExp);
          }
          
          currentExp = {
            title: jobInfo.title,
            company: jobInfo.company,
            duration: this.extractDuration(line),
            dateRange: this.extractDateRange(line),
            description: [],
            skills: []
          };
        } else if (currentExp) {
          // This is likely a description line
          if (line.length > 20) {
            currentExp.description.push(line);
            
            // Extract skills from description
            const skills = this.extractSkillsFromText(line);
            currentExp.skills.push(...skills);
          }
        }
        
        // Check for end of experience section
        if (this.isNewSection(line)) {
          inExperience = false;
          if (currentExp) {
            experiences.push(currentExp);
            currentExp = null;
          }
        }
      }
    }
    
    // Push last experience if exists
    if (currentExp) {
      experiences.push(currentExp);
    }
    
    return experiences;
  }

  /**
   * Extract job title and company from line
   */
  extractJobInfo(line) {
    const doc = compromise(line);
    
    // Look for patterns like "Software Engineer at Google" or "Software Engineer, Google"
    const patterns = [
      /(.+?)\s+(?:at|@|,|-)\s+(.+)/i,
      /(.+?)\s+-\s+(.+)/i,
      /(.+?)\s+–\s+(.+)/i
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return {
          title: match[1].trim(),
          company: match[2].trim()
        };
      }
    }
    
    // If no pattern match, try to extract using NLP
    const people = doc.people().out('array');
    const orgs = doc.organizations().out('array');
    
    if (people.length > 0 && orgs.length > 0) {
      return {
        title: people[0],
        company: orgs[0]
      };
    }
    
    return null;
  }

  /**
   * Extract duration (e.g., "6 months", "2 years")
   */
  extractDuration(line) {
    const durationPattern = /(\d+)\s*(year|years|month|months|yr|yrs)/i;
    const match = line.match(durationPattern);
    
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    
    return null;
  }

  /**
   * Extract date range (e.g., "Jan 2020 - Present")
   */
  extractDateRange(line) {
    const datePattern = /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\s*[-–—]\s*(present|current|\w+\s+\d{4}|ongoing)/i;
    const match = line.match(datePattern);
    
    if (match) {
      return match[0];
    }
    
    return null;
  }

  /**
   * Extract skills from text
   */
  extractSkillsFromText(text) {
    const SkillExtractor = require('./skillExtractor');
    const skills = SkillExtractor.extractSkills(text);
    return skills.map(s => s.name);
  }

  /**
   * Check if line indicates a new section
   */
  isNewSection(line) {
    const sectionHeaders = [
      'education', 'skills', 'projects', 'certifications',
      'languages', 'publications', 'awards', 'interests'
    ];
    
    return sectionHeaders.some(header => 
      line.toLowerCase().includes(header)
    );
  }
}

module.exports = new ExperienceExtractor();