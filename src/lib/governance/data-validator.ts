import { z } from 'zod';

/**
 * Data Governance and Validation Service for Dialect Comparison Platform
 * 
 * This service provides validation rules and data quality checks for all dialect-related entities.
 */

export class DataValidator {
  /**
   * Validate Kurdish word (Sorani script)
   */
  validateKurdishWord(word: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!word || word.trim().length === 0) {
      errors.push('Kurdish word is required');
    }

    if (word.length > 100) {
      errors.push('Kurdish word must not exceed 100 characters');
    }

    // Check for valid Kurdish characters (basic check)
    const kurdishRegex = /^[\u0600-\u06FF\s]+$/;
    if (!kurdishRegex.test(word)) {
      errors.push('Kurdish word contains invalid characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate Persian translation
   */
  validatePersianTranslation(translation: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!translation || translation.trim().length === 0) {
      errors.push('Persian translation is required');
    }

    if (translation.length > 500) {
      errors.push('Persian translation must not exceed 500 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate English translation
   */
  validateEnglishTranslation(translation: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (translation && translation.length > 500) {
      errors.push('English translation must not exceed 500 characters');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate part of speech
   */
  validatePartOfSpeech(pos: string): { valid: boolean; errors: string[] } {
    const validPOS = ['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'particle'];
    const errors: string[] = [];

    if (pos && !validPOS.includes(pos.toLowerCase())) {
      errors.push(`Invalid part of speech. Must be one of: ${validPOS.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate difficulty level
   */
  validateDifficultyLevel(level: string): { valid: boolean; errors: string[] } {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    const errors: string[] = [];

    if (level && !validLevels.includes(level.toLowerCase())) {
      errors.push(`Invalid difficulty level. Must be one of: ${validLevels.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate dialect code
   */
  validateDialectCode(code: string): { valid: boolean; errors: string[] } {
    const validCodes = ['ckb', 'kmr', 'sdh', 'lki', 'glk'];
    const errors: string[] = [];

    if (!code || code.trim().length === 0) {
      errors.push('Dialect code is required');
    }

    if (code && !validCodes.includes(code.toLowerCase())) {
      errors.push(`Invalid dialect code. Must be one of: ${validCodes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate annotation type
   */
  validateAnnotationType(type: string): { valid: boolean; errors: string[] } {
    const validTypes = ['morphological', 'phonological', 'syntactic', 'semantic', 'dialect', 'historical', 'usage', 'research'];
    const errors: string[] = [];

    if (!type || !validTypes.includes(type.toLowerCase())) {
      errors.push(`Invalid annotation type. Must be one of: ${validTypes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate relationship type
   */
  validateRelationshipType(type: string): { valid: boolean; errors: string[] } {
    const validTypes = ['synonym', 'antonym', 'hypernym', 'hyponym', 'meronym', 'holonym', 'related'];
    const errors: string[] = [];

    if (!type || !validTypes.includes(type.toLowerCase())) {
      errors.push(`Invalid relationship type. Must be one of: ${validTypes.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate usage frequency
   */
  validateUsageFrequency(frequency: string): { valid: boolean; errors: string[] } {
    const validFrequencies = ['common', 'uncommon', 'rare', 'archaic'];
    const errors: string[] = [];

    if (frequency && !validFrequencies.includes(frequency.toLowerCase())) {
      errors.push(`Invalid usage frequency. Must be one of: ${validFrequencies.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate semantic domain
   */
  validateSemanticDomain(domain: string): { valid: boolean; errors: string[] } {
    const validDomains = ['general', 'academic', 'informal', 'formal', 'technical', 'literary', 'colloquial'];
    const errors: string[] = [];

    if (domain && !validDomains.includes(domain.toLowerCase())) {
      errors.push(`Invalid semantic domain. Must be one of: ${validDomains.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate vocabulary entry
   */
  validateVocabularyEntry(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const kurdishValidation = this.validateKurdishWord(data.kurdishWord);
    errors.push(...kurdishValidation.errors);

    const persianValidation = this.validatePersianTranslation(data.persianTranslation);
    errors.push(...persianValidation.errors);

    const englishValidation = this.validateEnglishTranslation(data.englishTranslation || '');
    errors.push(...englishValidation.errors);

    if (data.partOfSpeech) {
      const posValidation = this.validatePartOfSpeech(data.partOfSpeech);
      errors.push(...posValidation.errors);
    }

    if (data.difficultyLevel) {
      const difficultyValidation = this.validateDifficultyLevel(data.difficultyLevel);
      errors.push(...difficultyValidation.errors);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate dialect entry
   */
  validateDialectEntry(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || data.name.trim().length === 0) {
      errors.push('Dialect name is required');
    }

    if (data.name && data.name.length > 100) {
      errors.push('Dialect name must not exceed 100 characters');
    }

    const codeValidation = this.validateDialectCode(data.code);
    errors.push(...codeValidation.errors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Check data quality score
   */
  calculateDataQualityScore(data: any): number {
    let score = 0;
    const maxScore = 10;

    // Has Kurdish word
    if (data.kurdishWord && data.kurdishWord.trim().length > 0) score += 1;

    // Has Persian translation
    if (data.persianTranslation && data.persianTranslation.trim().length > 0) score += 1;

    // Has English translation
    if (data.englishTranslation && data.englishTranslation.trim().length > 0) score += 1;

    // Has part of speech
    if (data.partOfSpeech) score += 1;

    // Has pronunciation
    if (data.pronunciation && data.pronunciation.trim().length > 0) score += 1;

    // Has difficulty level
    if (data.difficultyLevel) score += 1;

    // Has normalized form
    if (data.normalizedForm && data.normalizedForm.trim().length > 0) score += 1;

    // Has at least one meaning
    if (data.meanings && data.meanings.length > 0) score += 1;

    // Has at least one example sentence
    if (data.examples && data.examples.length > 0) score += 1;

    // Has dialect variants
    if (data.variants && data.variants.length > 0) score += 1;

    return (score / maxScore) * 100;
  }

  /**
   * Get data quality report
   */
  getDataQualityReport(data: any): {
    score: number;
    level: 'excellent' | 'good' | 'fair' | 'poor';
    recommendations: string[];
  } {
    const score = this.calculateDataQualityScore(data);
    const recommendations: string[] = [];

    if (!data.englishTranslation) {
      recommendations.push('Add English translation for better accessibility');
    }

    if (!data.pronunciation) {
      recommendations.push('Add pronunciation information');
    }

    if (!data.partOfSpeech) {
      recommendations.push('Add part of speech classification');
    }

    if (!data.meanings || data.meanings.length === 0) {
      recommendations.push('Add at least one meaning definition');
    }

    if (!data.examples || data.examples.length === 0) {
      recommendations.push('Add example sentences for context');
    }

    let level: 'excellent' | 'good' | 'fair' | 'poor';
    if (score >= 80) level = 'excellent';
    else if (score >= 60) level = 'good';
    else if (score >= 40) level = 'fair';
    else level = 'poor';

    return {
      score,
      level,
      recommendations,
    };
  }
}

// Export singleton instance
export const dataValidator = new DataValidator();

// Zod schemas for validation
export const vocabularyEntrySchema = z.object({
  kurdishWord: z.string().min(1).max(100),
  persianTranslation: z.string().min(1).max(500),
  englishTranslation: z.string().max(500).optional(),
  partOfSpeech: z.enum(['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'interjection', 'particle']).optional(),
  pronunciation: z.string().max(255).optional(),
  difficultyLevel: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  normalizedForm: z.string().max(100).optional(),
  rootForm: z.string().max(100).optional(),
  etymology: z.string().max(1000).optional(),
});

export const dialectEntrySchema = z.object({
  name: z.string().min(1).max(100),
  code: z.enum(['ckb', 'kmr', 'sdh', 'lki', 'glk']),
  description: z.string().max(500).optional(),
  region: z.string().max(100).optional(),
});

export const annotationSchema = z.object({
  annotationType: z.enum(['morphological', 'phonological', 'syntactic', 'semantic', 'dialect', 'historical', 'usage', 'research']),
  annotationData: z.record(z.any()),
});

export const relationshipSchema = z.object({
  relationshipType: z.enum(['synonym', 'antonym', 'hypernym', 'hyponym', 'meronym', 'holonym', 'related']),
});
