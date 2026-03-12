/**
 * ML-based ranking model using XGBoost
 * Predicts match probability between resume and job
 */

const tf = require('@tensorflow/tfjs-node');

class RankingModel {
  constructor() {
    this.model = null;
    this.trained = false;
    this.featureNames = [
      'skill_match_score',
      'experience_match',
      'education_level',
      'semantic_similarity',
      'keyword_density',
      'title_match',
      'location_match',
      'total_years_experience',
      'skill_count',
      'job_skill_count',
      'skill_overlap_ratio'
    ];
  }

  /**
   * Create the model architecture
   */
  createModel() {
    const model = tf.sequential();
    
    // Input layer (11 features)
    model.add(tf.layers.dense({
      units: 64,
      activation: 'relu',
      inputShape: [11]
    }));
    
    // Hidden layer 1
    model.add(tf.layers.dense({
      units: 32,
      activation: 'relu'
    }));
    
    // Dropout for regularization
    model.add(tf.layers.dropout({ rate: 0.2 }));
    
    // Hidden layer 2
    model.add(tf.layers.dense({
      units: 16,
      activation: 'relu'
    }));
    
    // Output layer (match probability 0-1)
    model.add(tf.layers.dense({
      units: 1,
      activation: 'sigmoid'
    }));
    
    // Compile model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
    
    this.model = model;
    console.log('✅ Ranking model created');
  }

  /**
   * Extract features from resume and job
   */
  extractFeatures(resumeData, jobData, matchScores) {
    const features = [];
    
    // 1. Skill match score (0-1)
    features.push(matchScores.skills / 100);
    
    // 2. Experience match (0-1)
    features.push(matchScores.experience / 100);
    
    // 3. Education level (0: None, 0.33: Bachelor, 0.66: Master, 1: PhD)
    let eduLevel = 0;
    if (resumeData.education && resumeData.education.length > 0) {
      const edu = resumeData.education[0];
      if (edu.degree) {
        if (edu.degree.includes('PhD') || edu.degree.includes('Doctorate')) eduLevel = 1;
        else if (edu.degree.includes('Master') || edu.degree.includes('M.')) eduLevel = 0.66;
        else if (edu.degree.includes('Bachelor') || edu.degree.includes('B.')) eduLevel = 0.33;
      }
    }
    features.push(eduLevel);
    
    // 4. Semantic similarity (0-1)
    features.push(matchScores.semantic / 100);
    
    // 5. Keyword density
    const jobText = `${jobData.title} ${jobData.description}`.toLowerCase();
    const keywords = jobData.skills || [];
    let keywordMatches = 0;
    keywords.forEach(keyword => {
      if (jobText.includes(keyword.toLowerCase())) keywordMatches++;
    });
    features.push(keywords.length > 0 ? keywordMatches / keywords.length : 0);
    
    // 6. Title match
    const titleWords = jobData.title.toLowerCase().split(' ');
    const titleMatch = titleWords.some(word => 
      resumeData.skills?.some(s => 
        (typeof s === 'string' ? s : s.name).toLowerCase().includes(word)
      )
    ) ? 1 : 0;
    features.push(titleMatch);
    
    // 7. Location match (simplified)
    features.push(1); // Placeholder
    
    // 8. Total years experience
    features.push(Math.min(resumeData.totalExperience || 0, 10) / 10);
    
    // 9. Skill count
    features.push(Math.min(resumeData.skills?.length || 0, 20) / 20);
    
    // 10. Job skill count
    features.push(Math.min(jobData.skills?.length || 0, 20) / 20);
    
    // 11. Skill overlap ratio
    const overlap = matchScores.matchedSkills?.length || 0;
    const totalSkills = new Set([
      ...(resumeData.skills?.map(s => typeof s === 'string' ? s : s.name) || []),
      ...(jobData.skills || [])
    ]).size;
    features.push(totalSkills > 0 ? overlap / totalSkills : 0);
    
    return features;
  }

  /**
   * Train the model with historical data
   */
  async train(trainingData) {
    if (!this.model) {
      this.createModel();
    }

    const features = [];
    const labels = [];

    // Prepare training data
    trainingData.forEach(item => {
      features.push(item.features);
      labels.push([item.matchProbability]);
    });

    // Convert to tensors
    const xs = tf.tensor2d(features);
    const ys = tf.tensor2d(labels);

    // Train the model
    const history = await this.model.fit(xs, ys, {
      epochs: 50,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch}: loss = ${logs.loss.toFixed(4)}, acc = ${logs.acc.toFixed(4)}`);
        }
      }
    });

    this.trained = true;
    console.log('✅ Model training completed');
    
    return history;
  }

  /**
   * Predict match probability
   */
  async predict(resumeData, jobData, matchScores) {
    if (!this.trained) {
      // Return heuristic score if model not trained
      return matchScores.total / 100;
    }

    const features = this.extractFeatures(resumeData, jobData, matchScores);
    const inputTensor = tf.tensor2d([features]);
    
    const prediction = this.model.predict(inputTensor);
    const probability = (await prediction.data())[0];
    
    // Clean up tensors
    inputTensor.dispose();
    prediction.dispose();
    
    return probability;
  }

  /**
   * Save the model
   */
  async saveModel(path) {
    if (!this.model) return;
    await this.model.save(`file://${path}`);
    console.log(`✅ Model saved to ${path}`);
  }

  /**
   * Load a pre-trained model
   */
  async loadModel(path) {
    try {
      this.model = await tf.loadLayersModel(`file://${path}/model.json`);
      this.trained = true;
      console.log(`✅ Model loaded from ${path}`);
    } catch (error) {
      console.error('❌ Failed to load model:', error);
      this.createModel();
    }
  }
}

module.exports = new RankingModel();