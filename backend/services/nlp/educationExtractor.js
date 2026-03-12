class EducationExtractor {
  constructor() {
    this.degreeKeywords = [
      'bachelor', 'master', 'phd', 'doctorate', 'b.tech', 'm.tech',
      'b.e.', 'm.e.', 'b.sc', 'm.sc', 'b.a.', 'm.a.', 'b.b.a.', 'm.b.a.',
      'associate', 'diploma', 'high school', 'secondary school'
    ];
    
    this.universityKeywords = [
      'university', 'college', 'institute', 'school', 'academy',
      'polytechnic', 'iit', 'nit', 'iiit', 'bits'
    ];
  }

  /**
   * Extract education information from text
   */
  extractEducation(text) {
    const education = [];
    const lines = text.split('\n');
    
    let currentEdu = null;
    let inEducation = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Check if this is the education section
      if (line.toLowerCase().includes('education') && !inEducation) {
        inEducation = true;
        continue;
      }
      
      if (inEducation) {
        const eduInfo = this.extractEducationInfo(line);
        
        if (eduInfo) {
          currentEdu = eduInfo;
          education.push(currentEdu);
        }
        
        // Check for end of education section
        if (this.isNewSection(line)) {
          inEducation = false;
        }
      }
    }
    
    return education;
  }

  /**
   * Extract education details from a line
   */
  extractEducationInfo(line) {
    const info = {
      degree: null,
      field: null,
      institution: null,
      graduationYear: null,
      gpa: null
    };
    
    // Extract degree
    for (const degree of this.degreeKeywords) {
      if (line.toLowerCase().includes(degree)) {
        info.degree = this.normalizeDegree(degree, line);
        break;
      }
    }
    
    // Extract institution
    for (const keyword of this.universityKeywords) {
      if (line.toLowerCase().includes(keyword)) {
        // Try to extract the full institution name
        const words = line.split(/\s+/);
        const keywordIndex = words.findIndex(w => 
          w.toLowerCase().includes(keyword)
        );
        
        if (keywordIndex >= 0) {
          // Take 2-3 words around the keyword
          const start = Math.max(0, keywordIndex - 1);
          const end = Math.min(words.length, keywordIndex + 3);
          info.institution = words.slice(start, end).join(' ');
        } else {
          info.institution = line;
        }
        break;
      }
    }
    
    // Extract graduation year
    const yearPattern = /\b(19|20)\d{2}\b/;
    const yearMatch = line.match(yearPattern);
    if (yearMatch) {
      info.graduationYear = parseInt(yearMatch[0]);
    }
    
    // Extract GPA
    const gpaPattern = /gpa[:\s]*([0-4]\.\d{1,2})/i;
    const gpaMatch = line.match(gpaPattern);
    if (gpaMatch) {
      info.gpa = parseFloat(gpaMatch[1]);
    }
    
    // Only return if we found something
    return (info.degree || info.institution) ? info : null;
  }

  /**
   * Normalize degree name
   */
  normalizeDegree(degree, context) {
    const degreeMap = {
      'b.tech': 'Bachelor of Technology',
      'b.e.': 'Bachelor of Engineering',
      'b.sc': 'Bachelor of Science',
      'b.a.': 'Bachelor of Arts',
      'm.tech': 'Master of Technology',
      'm.e.': 'Master of Engineering',
      'm.sc': 'Master of Science',
      'm.b.a.': 'Master of Business Administration',
      'phd': 'Doctor of Philosophy'
    };
    
    for (const [abbr, full] of Object.entries(degreeMap)) {
      if (context.toLowerCase().includes(abbr)) {
        return full;
      }
    }
    
    return degree;
  }

  /**
   * Check if line indicates a new section
   */
  isNewSection(line) {
    const sectionHeaders = [
      'experience', 'skills', 'projects', 'certifications',
      'languages', 'publications', 'awards'
    ];
    
    return sectionHeaders.some(header => 
      line.toLowerCase().includes(header)
    );
  }
}

module.exports = new EducationExtractor();