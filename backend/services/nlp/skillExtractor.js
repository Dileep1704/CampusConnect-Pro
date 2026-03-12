const natural = require('natural');
const BaseNLPService = require('./baseParser');

class SkillExtractor {
  constructor() {
    this.baseNLP = BaseNLPService;
    this.skillSynonyms = this.loadSkillSynonyms();
  }

  /**
   * Load skill synonyms and related terms
   */
  loadSkillSynonyms() {
    return {
      'javascript': ['js', 'ecmascript', 'es6', 'node.js', 'nodejs'],
      'python': ['py', 'django', 'flask', 'anaconda'],
      'react': ['reactjs', 'react.js', 'react native'],
      'machine learning': ['ml', 'deep learning', 'ai', 'artificial intelligence'],
      'database': ['sql', 'nosql', 'mongodb', 'mysql', 'postgresql'],
      'cloud': ['aws', 'azure', 'gcp', 'cloud computing']
    };
  }

  /**
   * Extract skills with context and confidence scores
   */
  async extractSkills(text) {
    const tokens = this.baseNLP.tokenize(text);
    const filteredTokens = this.baseNLP.removeStopWords(tokens);
    
    const skills = [];
    const sentences = text.split(/[.!?]+/);
    
    // Method 1: Direct keyword matching
    for (const skill of this.baseNLP.skillDatabase) {
      const regex = new RegExp(`\\b${skill}\\b`, 'gi');
      if (regex.test(text)) {
        // Find context (sentence containing the skill)
        const context = sentences.find(s => 
          s.toLowerCase().includes(skill.toLowerCase())
        ) || '';
        
        skills.push({
          name: skill,
          confidence: this.calculateConfidence(context, skill),
          context: context.trim(),
          method: 'direct'
        });
      }
    }
    
    // Method 2: Synonym matching
    for (const [skill, synonyms] of Object.entries(this.skillSynonyms)) {
      for (const synonym of synonyms) {
        const regex = new RegExp(`\\b${synonym}\\b`, 'gi');
        if (regex.test(text)) {
          const context = sentences.find(s => 
            s.toLowerCase().includes(synonym.toLowerCase())
          ) || '';
          
          skills.push({
            name: skill,
            original: synonym,
            confidence: this.calculateConfidence(context, skill) * 0.9, // Slightly lower for synonyms
            context: context.trim(),
            method: 'synonym'
          });
        }
      }
    }
    
    // Method 3: N-gram detection for multi-word skills
    const ngramSkills = this.detectNgramSkills(text);
    skills.push(...ngramSkills);
    
    // Remove duplicates by name
    const uniqueSkills = this.deduplicateSkills(skills);
    
    return uniqueSkills.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Calculate confidence based on context
   */
  calculateConfidence(context, skill) {
    let confidence = 0.7; // Base confidence
    
    // Boosters based on context clues
    const boosters = {
      'experience': 0.15,
      'proficient': 0.2,
      'expert': 0.25,
      'worked': 0.1,
      'developed': 0.15,
      'built': 0.1,
      'created': 0.1,
      'skilled': 0.2,
      'knowledge': 0.15
    };
    
    const contextLower = context.toLowerCase();
    for (const [word, boost] of Object.entries(boosters)) {
      if (contextLower.includes(word)) {
        confidence += boost;
      }
    }
    
    // Penalize if it's just listed without context
    if (context.length < 20) {
      confidence -= 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Detect multi-word skills using n-grams
   */
  detectNgramSkills(text) {
    const ngramSkills = [];
    const words = text.toLowerCase().split(/\s+/);
    
    // Check for 2-word and 3-word skills
    const multiWordSkills = [
      'machine learning', 'deep learning', 'data science',
      'artificial intelligence', 'cloud computing', 'rest api',
      'micro services', 'ci cd', 'agile methodology'
    ];
    
    for (const skill of multiWordSkills) {
      if (text.toLowerCase().includes(skill)) {
        ngramSkills.push({
          name: skill,
          confidence: 0.85,
          context: '',
          method: 'ngram'
        });
      }
    }
    
    return ngramSkills;
  }

  /**
   * Remove duplicate skills, keeping highest confidence
   */
  deduplicateSkills(skills) {
    const skillMap = new Map();
    
    skills.forEach(skill => {
      const key = skill.name.toLowerCase();
      if (!skillMap.has(key) || skillMap.get(key).confidence < skill.confidence) {
        skillMap.set(key, skill);
      }
    });
    
    return Array.from(skillMap.values());
  }
}

module.exports = new SkillExtractor();