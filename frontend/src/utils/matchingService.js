import api from './api';

/**
 * Matching Service - Handles all AI matching API calls
 */
const matchingService = {
  /**
   * Get basic matches for current student
   */
  getStudentMatches: async (limit = 20) => {
    try {
      const response = await api.get(`/matching/student-matches?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student matches:', error);
      throw error;
    }
  },

  /**
   * Get enhanced AI matches using transformers and ML
   */
  getEnhancedMatches: async (limit = 20) => {
    try {
      const response = await api.get(`/matching/enhanced-matches?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enhanced matches:', error);
      throw error;
    }
  },

  /**
   * Get resume feedback and analysis
   */
  getResumeFeedback: async () => {
    try {
      const response = await api.get('/matching/resume-feedback');
      return response.data;
    } catch (error) {
      console.error('Error fetching resume feedback:', error);
      throw error;
    }
  },

  /**
   * Vector search for internships using semantic similarity
   */
  vectorSearch: async (query) => {
    try {
      const response = await api.get(`/matching/vector-search?query=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error performing vector search:', error);
      throw error;
    }
  },

  /**
   * Get candidates for a specific job (company only)
   */
  getJobCandidates: async (jobId, limit = 10) => {
    try {
      const response = await api.get(`/matching/job-candidates/${jobId}?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job candidates:', error);
      throw error;
    }
  },

  /**
   * Compare multiple candidates for a job (company only)
   */
  compareCandidates: async (jobId, candidateIds) => {
    try {
      const response = await api.post('/matching/compare-candidates', {
        jobId,
        candidateIds
      });
      return response.data;
    } catch (error) {
      console.error('Error comparing candidates:', error);
      throw error;
    }
  },

  /**
   * Get AI system status
   */
  getAIStatus: async () => {
    try {
      const response = await api.get('/matching/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching AI status:', error);
      throw error;
    }
  }
};

export default matchingService;