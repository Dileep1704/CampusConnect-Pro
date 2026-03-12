/**
 * Advanced Skill Extraction using NLP
 * Uses spaCy through Python bridge for better accuracy
 */

const { PythonShell } = require('python-shell');
const path = require('path');

class AdvancedSkillExtractor {
  constructor() {
    this.skillTaxonomy = this.loadSkillTaxonomy();
    this.usePython = false; // Set to true if Python/spaCy is available
  }

  /**
   * Load comprehensive skill taxonomy
   */
  loadSkillTaxonomy() {
    return {
      'programming_languages': {
        'javascript': ['js', 'ecmascript', 'node.js', 'nodejs'],
        'python': ['py', 'django', 'flask'],
        'java': ['j2ee', 'spring', 'hibernate'],
        'c++': ['cpp', 'cplusplus'],
        'c#': ['csharp', 'dotnet'],
        'ruby': ['rails', 'ror'],
        'php': ['laravel', 'symfony'],
        'swift': ['ios', 'macos'],
        'kotlin': ['android'],
        'go': ['golang'],
        'rust': ['rs'],
        'typescript': ['ts']
      },
      'frontend': {
        'react': ['reactjs', 'react.js'],
        'angular': ['angularjs', 'ng'],
        'vue': ['vuejs', 'vite'],
        'html': ['html5'],
        'css': ['css3', 'scss', 'sass', 'less'],
        'redux': ['reduxjs'],
        'nextjs': ['next.js'],
        'gatsby': []
      },
      'backend': {
        'nodejs': ['node', 'express'],
        'django': [],
        'flask': [],
        'spring': ['springboot'],
        'laravel': [],
        'rails': []
      },
      'database': {
        'mongodb': ['mongo', 'mongoose'],
        'mysql': [],
        'postgresql': ['postgres'],
        'redis': [],
        'elasticsearch': ['es'],
        'cassandra': []
      },
      'cloud': {
        'aws': ['amazon web services', 'ec2', 's3', 'lambda'],
        'azure': ['microsoft azure'],
        'gcp': ['google cloud', 'compute'],
        'docker': ['container'],
        'kubernetes': ['k8s'],
        'jenkins': ['ci/cd']
      },
      'data_science': {
        'machine learning': ['ml', 'ai'],
        'deep learning': ['dl', 'neural networks'],
        'tensorflow': ['tf'],
        'pytorch': [],
        'pandas': [],
        'numpy': [],
        'scikit-learn': ['sklearn'],
        'tableau': []
      },
      'soft_skills': {
        'communication': ['verbal', 'written'],
        'leadership': ['team lead', 'management'],
        'problem solving': ['analytical'],
        'teamwork': ['collaboration'],
        'agile': ['scrum', 'kanban'],
        'project management': ['pm']
      }
    };
  }

  /**
   * Extract skills using Python/spaCy (if available)
   */
  async extractWithSpacy(text) {
    return new Promise((resolve, reject) => {
      const options = {
        mode: 'text',
        pythonPath: 'python3',
        scriptPath: path.join(__dirname, '../../scripts'),
        args: [text]
      };

      PythonShell.run('extract_skills.py', options, (err, results) => {
        if (err) {
          reject(err);
        } else {
          try {
            const skills = JSON.parse(results[0]);
            resolve(skills);
          } catch (e) {
            reject(e);
          }
        }
      });
    });
  }

  /**
   * Python script for spaCy extraction
   */
  getSpacyScript() {
    return `
import spacy
import json
import sys

# Load spaCy model
nlp = spacy.load('en_core_web_sm')

def extract_skills(text):
    doc = nlp(text)
    skills = []
    
    # Custom skill patterns
    skill_patterns = [
        'javascript', 'python', 'java', 'react', 'node', 
        'mongodb', 'aws', 'docker', 'kubernetes'
    ]
    
    for token in doc:
        if token.text.lower() in skill_patterns:
            skills.append({
                'name': token.text,
                'context': token.sent.text,
                'position': token.i
            })
    
    return skills

if __name__ == "__main__":
    text = sys.argv[1]
    skills = extract_skills(text)
    print(json.dumps(skills))
`;
  }

  /**
   * Extract skills with context and confidence
   */
  async extractSkills(text, useAdvanced = false) {
    if (useAdvanced && this.usePython) {
      try {
        return await this.extractWithSpacy(text);
      } catch (error) {
        console.log('Falling back to rule-based extraction');
      }
    }

    return this.ruleBasedExtraction(text);
  }

  /**
   * Rule-based skill extraction (existing method enhanced)
   */
  ruleBasedExtraction(text) {
    const skills = [];
    const textLower = text.toLowerCase();
    const sentences = text.split(/[.!?]+/);

    // Flatten all skills from taxonomy
    const allSkills = [];
    Object.values(this.skillTaxonomy).forEach(category => {
      Object.entries(category).forEach(([skill, synonyms]) => {
        allSkills.push({ name: skill, synonyms });
      });
    });

    // Extract skills with context
    allSkills.forEach(({ name, synonyms }) => {
      const allTerms = [name, ...synonyms];
      
      allTerms.forEach(term => {
        const regex = new RegExp(`\\b${term}\\b`, 'gi');
        if (regex.test(textLower)) {
          // Find the sentence containing this skill
          const context = sentences.find(s => 
            s.toLowerCase().includes(term)
          ) || '';
          
          // Calculate confidence
          let confidence = 0.7;
          if (context.toLowerCase().includes('experience')) confidence += 0.15;
          if (context.toLowerCase().includes('proficient')) confidence += 0.2;
          if (context.toLowerCase().includes('expert')) confidence += 0.25;
          if (context.toLowerCase().includes('worked')) confidence += 0.1;
          
          skills.push({
            name: name,
            matchedTerm: term,
            category: this.getSkillCategory(name),
            confidence: Math.min(confidence, 1.0),
            context: context.trim(),
            experience: this.extractExperience(context)
          });
        }
      });
    });

    // Remove duplicates (keep highest confidence)
    const uniqueSkills = [];
    const skillMap = new Map();
    
    skills.forEach(skill => {
      const key = skill.name.toLowerCase();
      if (!skillMap.has(key) || skillMap.get(key).confidence < skill.confidence) {
        skillMap.set(key, skill);
      }
    });
    
    skillMap.forEach(value => uniqueSkills.push(value));
    
    return uniqueSkills.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Get skill category
   */
  getSkillCategory(skill) {
    for (const [category, skills] of Object.entries(this.skillTaxonomy)) {
      if (skills[skill]) return category;
    }
    return 'other';
  }

  /**
   * Extract years of experience for a skill
   */
  extractExperience(context) {
    const yearPattern = /(\d+)\s*(?:year|yr)s?/i;
    const match = context.match(yearPattern);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Get skill recommendations based on market demand
   */
  getSkillRecommendations(currentSkills, jobMarket = []) {
    const recommendations = [];
    
    // Analyze missing skills from job market
    const allDemandedSkills = new Set();
    jobMarket.forEach(job => {
      job.skills.forEach(skill => allDemandedSkills.add(skill.toLowerCase()));
    });
    
    const currentSkillNames = currentSkills.map(s => s.name.toLowerCase());
    
    allDemandedSkills.forEach(skill => {
      if (!currentSkillNames.includes(skill)) {
        recommendations.push({
          skill,
          demand: Math.floor(Math.random() * 100), // Replace with actual demand data
          relevance: 'high'
        });
      }
    });
    
    return recommendations.sort((a, b) => b.demand - a.demand).slice(0, 5);
  }
}

module.exports = new AdvancedSkillExtractor();