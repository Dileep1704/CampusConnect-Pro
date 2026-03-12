const natural = require('natural');
const { WordTokenizer, SentenceTokenizer } = natural;
const TfIdf = natural.TfIdf;
const wordnet = new natural.WordNet();
const compromise = require('compromise');

class BaseNLPService {
  constructor() {
    this.wordTokenizer = new WordTokenizer();
    this.sentenceTokenizer = new SentenceTokenizer();
    this.tfidf = new TfIdf();
    
    // Skill database (expand as needed)
    this.skillDatabase = [
      'javascript', 'python', 'java', 'c++', 'react', 'node.js', 
      'express', 'mongodb', 'sql', 'aws', 'docker', 'kubernetes',
      'machine learning', 'data science', 'tensorflow', 'pytorch',
      'angular', 'vue', 'typescript', 'redux', 'graphql',
      'rest api', 'microservices', 'devops', 'ci/cd', 'jenkins',
      'git', 'linux', 'agile', 'scrum', 'jira'
    ];
  }

  /**
   * Extract text from resume (wrapper for existing parser)
   */
  async extractText(filePath, fileType) {
    // Use your existing resumeParser.js logic here
    const ResumeParser = require('../resumeParser');
    return await ResumeParser.parseResume(filePath, fileType);
  }

  /**
   * Tokenize text into words
   */
  tokenize(text) {
    return this.wordTokenizer.tokenize(text.toLowerCase());
  }

  /**
   * Remove stop words from tokens
   */
  removeStopWords(tokens) {
    const stopwords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 
                       'to', 'for', 'with', 'by', 'from', 'as', 'of', 'it', 'this'];
    return tokens.filter(token => !stopwords.includes(token) && token.length > 1);
  }

  /**
   * Extract entities using compromise NLP
   */
  extractEntities(text) {
    const doc = compromise(text);
    
    return {
      people: doc.people().out('array'),
      organizations: doc.organizations().out('array'),
      places: doc.places().out('array'),
      dates: doc.dates().out('array'),
      emails: text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [],
      phones: text.match(/\+\d{1,3}\s?\d{10}|\d{10}/g) || []
    };
  }
}

module.exports = new BaseNLPService();