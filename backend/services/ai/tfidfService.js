const natural = require('natural');
const TfIdf = natural.TfIdf;

class TFIDFService {
  constructor() {
    this.tfidf = new TfIdf();
    this.documentMap = new Map(); // Store document index mapping
    this.documentCount = 0;
  }

  /**
   * Preprocess text for TF-IDF
   */
  preprocessText(text) {
    // Convert to lowercase
    text = text.toLowerCase();
    
    // Remove special characters but keep important ones
    text = text.replace(/[^\w\s\-+.]/g, ' ');
    
    // Tokenize and remove stopwords
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);
    
    const stopwords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 
                       'to', 'for', 'with', 'by', 'from', 'as', 'of', 'it', 'this',
                       'that', 'is', 'was', 'are', 'were', 'be', 'been', 'being'];
    
    const filteredTokens = tokens.filter(token => 
      !stopwords.includes(token) && token.length > 1
    );
    
    return filteredTokens.join(' ');
  }

  /**
   * Add document to TF-IDF corpus
   */
  addDocument(text, id, type = 'job') {
    const processedText = this.preprocessText(text);
    this.tfidf.addDocument(processedText);
    this.documentMap.set(this.documentCount, { id, type });
    this.documentCount++;
    
    return this.documentCount - 1;
  }

  /**
   * Calculate TF-IDF vector for a query
   */
  calculateQueryVector(query) {
    const processedQuery = this.preprocessText(query);
    const tempTfidf = new TfIdf();
    tempTfidf.addDocument(processedQuery);
    
    const vector = [];
    const terms = [];
    
    tempTfidf.listTerms(0).forEach(item => {
      terms.push(item.term);
    });
    
    return { vector: tempTfidf, terms };
  }

  /**
   * Compute cosine similarity between two TF-IDF vectors
   */
  cosineSimilarity(tfidf1, docIndex1, tfidf2, docIndex2) {
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    // Get all terms from both documents
    const terms1 = tfidf1.listTerms(docIndex1);
    const terms2 = tfidf2.listTerms(docIndex2);
    
    const termMap = new Map();
    
    terms1.forEach(item => {
      termMap.set(item.term, { tfidf1: item.tfidf, tfidf2: 0 });
      norm1 += item.tfidf * item.tfidf;
    });
    
    terms2.forEach(item => {
      if (termMap.has(item.term)) {
        termMap.get(item.term).tfidf2 = item.tfidf;
      } else {
        termMap.set(item.term, { tfidf1: 0, tfidf2: item.tfidf });
      }
      norm2 += item.tfidf * item.tfidf;
    });
    
    // Calculate dot product
    termMap.forEach((values) => {
      dotProduct += values.tfidf1 * values.tfidf2;
    });
    
    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);
    
    if (norm1 === 0 || norm2 === 0) return 0;
    
    return dotProduct / (norm1 * norm2);
  }

  /**
   * Find similar documents to a query
   */
  findSimilar(query, limit = 10) {
    const queryTfidf = new TfIdf();
    queryTfidf.addDocument(this.preprocessText(query));
    
    const similarities = [];
    
    for (let i = 0; i < this.documentCount; i++) {
      const similarity = this.cosineSimilarity(queryTfidf, 0, this.tfidf, i);
      similarities.push({
        index: i,
        id: this.documentMap.get(i).id,
        type: this.documentMap.get(i).type,
        score: similarity
      });
    }
    
    // Sort by similarity score descending
    similarities.sort((a, b) => b.score - a.score);
    
    return similarities.slice(0, limit);
  }

  /**
   * Save TF-IDF model to file
   */
  async saveModel(filepath) {
    // Implementation for saving model
    const model = {
      documentMap: Array.from(this.documentMap.entries()),
      documentCount: this.documentCount
    };
    
    const fs = require('fs').promises;
    await fs.writeFile(filepath, JSON.stringify(model));
  }

  /**
   * Load TF-IDF model from file
   */
  async loadModel(filepath) {
    const fs = require('fs').promises;
    const data = await fs.readFile(filepath, 'utf8');
    const model = JSON.parse(data);
    
    this.documentMap = new Map(model.documentMap);
    this.documentCount = model.documentCount;
  }
}

module.exports = new TFIDFService();