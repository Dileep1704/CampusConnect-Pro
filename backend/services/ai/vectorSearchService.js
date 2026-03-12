/**
 * Vector Search Service using FAISS
 * For efficient similarity search on embeddings
 */

const fs = require('fs');
const path = require('path');

// Try to load FAISS (optional - will fallback to simple array if not available)
let faiss;
try {
  faiss = require('faiss-node');
  console.log('✅ FAISS loaded successfully');
} catch (error) {
  console.log('⚠️ FAISS not available, using fallback search');
  faiss = null;
}

class VectorSearchService {
  constructor() {
    this.index = null;
    this.documents = [];
    this.dimension = 384; // Dimension for all-MiniLM-L6-v2
    this.indexPath = path.join(__dirname, '../../../data/vectors/index.faiss');
    this.metadataPath = path.join(__dirname, '../../../data/vectors/metadata.json');
    this.initialized = false;
  }

  /**
   * Initialize the index
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Create data directory if it doesn't exist
      const dataDir = path.join(__dirname, '../../../data/vectors');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Try to load existing index
      if (fs.existsSync(this.indexPath) && faiss) {
        this.index = faiss.IndexFlatL2.read(this.indexPath);
        const metadata = JSON.parse(fs.readFileSync(this.metadataPath, 'utf8'));
        this.documents = metadata.documents;
        console.log(`✅ Loaded FAISS index with ${this.index.ntotal()} vectors`);
      } else if (faiss) {
        // Create new index
        this.index = new faiss.IndexFlatL2(this.dimension);
        console.log('✅ Created new FAISS index');
      } else {
        // Fallback to in-memory array
        this.index = {
          vectors: [],
          ntotal: () => this.vectors.length,
          add: (vector) => this.vectors.push(vector),
          search: (vector, k) => {
            // Simple linear search
            const distances = this.vectors.map(v => this.cosineDistance(vector, v));
            const indices = distances
              .map((d, i) => ({ d, i }))
              .sort((a, b) => a.d - b.d)
              .slice(0, k)
              .map(item => item.i);
            return { distances: indices.map(i => distances[i]), labels: indices };
          }
        };
        console.log('✅ Using fallback vector search');
      }

      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize vector search:', error);
    }
  }

  /**
   * Cosine distance for fallback
   */
  cosineDistance(vec1, vec2) {
    let dot = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dot += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    return 1 - (dot / (Math.sqrt(norm1) * Math.sqrt(norm2)));
  }

  /**
   * Add document to index
   */
  async addDocument(id, text, embedding, metadata = {}) {
    await this.initialize();

    const vector = new Float32Array(embedding);
    
    if (faiss) {
      this.index.add(vector);
    } else {
      this.index.vectors.push(embedding);
    }

    this.documents.push({
      id,
      text,
      metadata,
      timestamp: new Date().toISOString()
    });

    // Auto-save every 10 documents
    if (this.documents.length % 10 === 0) {
      await this.saveIndex();
    }

    return this.documents.length - 1;
  }

  /**
   * Search for similar documents
   */
  async search(queryEmbedding, k = 10) {
    await this.initialize();

    if (this.index.ntotal() === 0) {
      return [];
    }

    const queryVector = new Float32Array(queryEmbedding);
    const result = this.index.search(queryVector, Math.min(k, this.index.ntotal()));

    // Format results
    const results = [];
    for (let i = 0; i < result.labels.length; i++) {
      const docIndex = result.labels[i];
      if (docIndex >= 0 && docIndex < this.documents.length) {
        results.push({
          ...this.documents[docIndex],
          score: 1 - result.distances[i], // Convert distance to similarity
          distance: result.distances[i]
        });
      }
    }

    return results;
  }

  /**
   * Save index to disk
   */
  async saveIndex() {
    if (!faiss) return;

    try {
      this.index.write(this.indexPath);
      fs.writeFileSync(this.metadataPath, JSON.stringify({
        documents: this.documents,
        count: this.documents.length,
        updatedAt: new Date().toISOString()
      }));
      console.log(`✅ Saved FAISS index with ${this.documents.length} documents`);
    } catch (error) {
      console.error('❌ Failed to save index:', error);
    }
  }

  /**
   * Delete document from index
   */
  async deleteDocument(id) {
    // Note: FAISS doesn't support deletion easily
    // For simplicity, we'll rebuild the index
    const index = this.documents.findIndex(d => d.id === id);
    if (index !== -1) {
      this.documents.splice(index, 1);
      await this.rebuildIndex();
    }
  }

  /**
   * Rebuild index from scratch
   */
  async rebuildIndex() {
    if (!faiss) return;

    const oldVectors = this.index.vectors;
    this.index = new faiss.IndexFlatL2(this.dimension);
    
    for (let i = 0; i < this.documents.length; i++) {
      // You'll need to regenerate embeddings here
      // This is a placeholder
    }
    
    await this.saveIndex();
  }

  /**
   * Get index statistics
   */
  getStats() {
    return {
      totalDocuments: this.documents.length,
      indexSize: this.index?.ntotal() || 0,
      dimension: this.dimension,
      usingFaiss: !!faiss
    };
  }
}

module.exports = new VectorSearchService();