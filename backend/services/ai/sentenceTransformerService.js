/**
 * Sentence Transformers for Semantic Matching
 * Uses all-MiniLM-L6-v2 model for embeddings
 */

const { pipeline } = require('@xenova/transformers');
const natural = require('natural');

class SentenceTransformerService {
  constructor() {
    this.model = null;
    this.initialized = false;
    this.similarityThreshold = 0.7;
  }

  /**
   * Initialize the model
   */
  async initialize() {
    try {
      console.log('🔄 Loading Sentence Transformer model...');
      // Load the model
      this.model = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      this.initialized = true;
      console.log('✅ Sentence Transformer model loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load model:', error);
      // Fallback to a simpler method
      this.useFallback = true;
    }
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text) {
    if (!this.initialized && !this.useFallback) {
      await this.initialize();
    }

    if (this.useFallback) {
      return this.fallbackEmbedding(text);
    }

    try {
      const result = await this.model(text, {
        pooling: 'mean',
        normalize: true
      });
      return Array.from(result.data);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return this.fallbackEmbedding(text);
    }
  }

  /**
   * Fallback: Simple TF-IDF based embedding
   */
  fallbackEmbedding(text) {
    const tfidf = new natural.TfIdf();
    tfidf.addDocument(text);
    
    const terms = [];
    const scores = [];
    tfidf.listTerms(0).forEach(item => {
      terms.push(item.term);
      scores.push(item.tfidf);
    });
    
    return scores.slice(0, 100); // Return first 100 scores
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(embedding1, embedding2) {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) return 0;
    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Compute semantic similarity between two texts
   */
  async computeSimilarity(text1, text2) {
    const embedding1 = await this.generateEmbedding(text1);
    const embedding2 = await this.generateEmbedding(text2);
    
    return this.cosineSimilarity(embedding1, embedding2);
  }

  /**
   * Find most similar texts from a list
   */
  async findSimilar(query, texts, limit = 5) {
    const queryEmbedding = await this.generateEmbedding(query);
    
    const similarities = [];
    
    for (let i = 0; i < texts.length; i++) {
      const textEmbedding = await this.generateEmbedding(texts[i].text);
      const similarity = this.cosineSimilarity(queryEmbedding, textEmbedding);
      
      similarities.push({
        index: i,
        ...texts[i],
        similarity
      });
    }
    
    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    return similarities.slice(0, limit);
  }

  /**
   * Batch generate embeddings for multiple texts
   */
  async batchGenerateEmbeddings(texts) {
    const embeddings = [];
    for (const text of texts) {
      const embedding = await this.generateEmbedding(text);
      embeddings.push(embedding);
    }
    return embeddings;
  }
}

module.exports = new SentenceTransformerService();