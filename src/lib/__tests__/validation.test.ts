import {
  validateVocabularyEntry,
  validateVocabularyExample,
  validateNotebook,
  validateReviewAttempt,
  validateDialect,
  validateVocabularyCategory,
  validateVocabularyTag,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  handleApiError,
} from '../validation';
import {
  validateStory,
  validateStoryUpdate,
  validateStoryProgress,
  validateStoryCompletion,
  validateStoryBookmark,
  validateStoryFavorite,
  validateStoriesQuery,
} from '../validation/stories';

describe('Validation Functions', () => {
  describe('validateVocabularyEntry', () => {
    it('should validate correct vocabulary entry', () => {
      const data = {
        kurdish_word: 'سڵاو',
        persian_translation: 'سلام',
        english_translation: 'Hello',
        difficulty_level: 'beginner',
      };

      const result = validateVocabularyEntry(data);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation for missing kurdish word', () => {
      const data = {
        persian_translation: 'سلام',
      };

      const result = validateVocabularyEntry(data);
      expect(result.success).toBe(false);
      expect(result.errors.kurdish_word).toBeDefined();
    });

    it('should fail validation for missing persian translation', () => {
      const data = {
        kurdish_word: 'سڵاو',
      };

      const result = validateVocabularyEntry(data);
      expect(result.success).toBe(false);
      expect(result.errors.persian_translation).toBeDefined();
    });

    it('should fail validation for invalid difficulty level', () => {
      const data = {
        kurdish_word: 'سڵاو',
        persian_translation: 'سلام',
        difficulty_level: 'invalid',
      };

      const result = validateVocabularyEntry(data);
      expect(result.success).toBe(false);
      expect(result.errors.difficulty_level).toBeDefined();
    });

    it('should fail validation for too long kurdish word', () => {
      const data = {
        kurdish_word: 'a'.repeat(501),
        persian_translation: 'سلام',
      };

      const result = validateVocabularyEntry(data);
      expect(result.success).toBe(false);
      expect(result.errors.kurdish_word).toBeDefined();
    });
  });

  describe('validateVocabularyExample', () => {
    it('should validate correct vocabulary example', () => {
      const data = {
        kurdish_sentence: 'سڵاو، چۆنیت؟',
        persian_translation: 'سلام، حالت چطوره؟',
        english_translation: 'Hello, how are you?',
        vocabulary_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = validateVocabularyExample(data);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation for missing kurdish sentence', () => {
      const data = {
        persian_translation: 'سلام',
        english_translation: 'Hello',
        vocabulary_id: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = validateVocabularyExample(data);
      expect(result.success).toBe(false);
      expect(result.errors.kurdish_sentence).toBeDefined();
    });

    it('should fail validation for invalid vocabulary ID', () => {
      const data = {
        kurdish_sentence: 'سڵاو',
        persian_translation: 'سلام',
        english_translation: 'Hello',
        vocabulary_id: 'invalid-uuid',
      };

      const result = validateVocabularyExample(data);
      expect(result.success).toBe(false);
      expect(result.errors.vocabulary_id).toBeDefined();
    });
  });

  describe('validateNotebook', () => {
    it('should validate correct notebook', () => {
      const data = {
        title: 'My Vocabulary',
        description: 'Words I want to learn',
      };

      const result = validateNotebook(data);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation for missing title', () => {
      const data = {
        description: 'Words I want to learn',
      };

      const result = validateNotebook(data);
      expect(result.success).toBe(false);
      expect(result.errors.title).toBeDefined();
    });

    it('should fail validation for too long title', () => {
      const data = {
        title: 'a'.repeat(201),
      };

      const result = validateNotebook(data);
      expect(result.success).toBe(false);
      expect(result.errors.title).toBeDefined();
    });
  });

  describe('validateReviewAttempt', () => {
    it('should validate correct review attempt', () => {
      const data = {
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        vocabulary_id: '550e8400-e29b-41d4-a716-446655440001',
        response_quality: 4,
      };

      const result = validateReviewAttempt(data);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation for response quality out of range', () => {
      const data = {
        session_id: '550e8400-e29b-41d4-a716-446655440000',
        vocabulary_id: '550e8400-e29b-41d4-a716-446655440001',
        response_quality: 6,
      };

      const result = validateReviewAttempt(data);
      expect(result.success).toBe(false);
      expect(result.errors.response_quality).toBeDefined();
    });
  });

  describe('validateDialect', () => {
    it('should validate correct dialect', () => {
      const data = {
        name: 'Sorani',
        code: 'ckb',
        description: 'Central Kurdish',
      };

      const result = validateDialect(data);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation for invalid code format', () => {
      const data = {
        name: 'Sorani',
        code: 'CKB',
      };

      const result = validateDialect(data);
      expect(result.success).toBe(false);
      expect(result.errors.code).toBeDefined();
    });
  });

  describe('validateVocabularyCategory', () => {
    it('should validate correct vocabulary category', () => {
      const data = {
        name: 'Family',
        slug: 'family',
        description: 'Family and relationships',
      };

      const result = validateVocabularyCategory(data);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation for invalid slug format', () => {
      const data = {
        name: 'Family',
        slug: 'Family',
      };

      const result = validateVocabularyCategory(data);
      expect(result.success).toBe(false);
      expect(result.errors.slug).toBeDefined();
    });
  });

  describe('validateVocabularyTag', () => {
    it('should validate correct vocabulary tag', () => {
      const data = {
        name: 'common',
        slug: 'common',
      };

      const result = validateVocabularyTag(data);
      expect(result.success).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should fail validation for too long name', () => {
      const data = {
        name: 'a'.repeat(51),
        slug: 'common',
      };

      const result = validateVocabularyTag(data);
      expect(result.success).toBe(false);
      expect(result.errors.name).toBeDefined();
    });
  });
});

describe('Error Classes', () => {
  describe('ValidationError', () => {
    it('should create validation error with errors', () => {
      const errors = { field: 'error message' };
      const error = new ValidationError(errors);

      expect(error.name).toBe('ValidationError');
      expect(error.errors).toEqual(errors);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with resource name', () => {
      const error = new NotFoundError('Vocabulary');

      expect(error.name).toBe('NotFoundError');
      expect(error.message).toBe('Vocabulary not found');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with default message', () => {
      const error = new UnauthorizedError();

      expect(error.name).toBe('UnauthorizedError');
      expect(error.message).toBe('Unauthorized');
    });

    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Custom message');

      expect(error.name).toBe('UnauthorizedError');
      expect(error.message).toBe('Custom message');
    });
  });

  describe('ForbiddenError', () => {
    it('should create forbidden error with default message', () => {
      const error = new ForbiddenError();

      expect(error.name).toBe('ForbiddenError');
      expect(error.message).toBe('Forbidden');
    });

    it('should create forbidden error with custom message', () => {
      const error = new ForbiddenError('Custom message');

      expect(error.name).toBe('ForbiddenError');
      expect(error.message).toBe('Custom message');
    });
  });
});

describe('handleApiError', () => {
  it('should handle validation error', () => {
    const errors = { field: 'error message' };
    const error = new ValidationError(errors);
    const result = handleApiError(error);

    expect(result.status).toBe(400);
    expect(result.error).toBe(JSON.stringify(errors));
  });

  it('should handle not found error', () => {
    const error = new NotFoundError('Resource');
    const result = handleApiError(error);

    expect(result.status).toBe(404);
    expect(result.error).toBe('Resource not found');
  });

  it('should handle unauthorized error', () => {
    const error = new UnauthorizedError();
    const result = handleApiError(error);

    expect(result.status).toBe(401);
    expect(result.error).toBe('Unauthorized');
  });

  it('should handle forbidden error', () => {
    const error = new ForbiddenError();
    const result = handleApiError(error);

    expect(result.status).toBe(403);
    expect(result.error).toBe('Forbidden');
  });

  it('should handle unknown error', () => {
    const error = new Error('Unknown error');
    const result = handleApiError(error);

    expect(result.status).toBe(500);
    expect(result.error).toBe('Internal server error');
  });
});

describe('Story Validation Functions', () => {
  describe('validateStory', () => {
    it('should validate correct story', () => {
      const data = {
        title: 'Test Story',
        slug: 'test-story',
        content: 'Test content',
        difficultyLevel: 'beginner',
        status: 'draft',
      };

      const result = validateStory(data);
      expect(result.success).toBe(true);
    });

    it('should fail validation for missing title', () => {
      const data = {
        slug: 'test-story',
        content: 'Test content',
        difficultyLevel: 'beginner',
        status: 'draft',
      };

      const result = validateStory(data);
      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid slug format', () => {
      const data = {
        title: 'Test Story',
        slug: 'Test Story',
        content: 'Test content',
        difficultyLevel: 'beginner',
        status: 'draft',
      };

      const result = validateStory(data);
      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid difficulty level', () => {
      const data = {
        title: 'Test Story',
        slug: 'test-story',
        content: 'Test content',
        difficultyLevel: 'invalid',
        status: 'draft',
      };

      const result = validateStory(data);
      expect(result.success).toBe(false);
    });
  });

  describe('validateStoryProgress', () => {
    it('should validate correct story progress', () => {
      const data = {
        storyId: '550e8400-e29b-41d4-a716-446655440000',
        completionPercentage: 50,
        lastPosition: 100,
      };

      const result = validateStoryProgress(data);
      expect(result.success).toBe(true);
    });

    it('should fail validation for completion percentage out of range', () => {
      const data = {
        storyId: '550e8400-e29b-41d4-a716-446655440000',
        completionPercentage: 150,
      };

      const result = validateStoryProgress(data);
      expect(result.success).toBe(false);
    });

    it('should fail validation for invalid story ID', () => {
      const data = {
        storyId: 'invalid-uuid',
        completionPercentage: 50,
      };

      const result = validateStoryProgress(data);
      expect(result.success).toBe(false);
    });
  });

  describe('validateStoryBookmark', () => {
    it('should validate correct story bookmark', () => {
      const data = {
        storyId: '550e8400-e29b-41d4-a716-446655440000',
        bookmarkPosition: 100,
      };

      const result = validateStoryBookmark(data);
      expect(result.success).toBe(true);
    });

    it('should fail validation for negative bookmark position', () => {
      const data = {
        storyId: '550e8400-e29b-41d4-a716-446655440000',
        bookmarkPosition: -1,
      };

      const result = validateStoryBookmark(data);
      expect(result.success).toBe(false);
    });
  });

  describe('validateStoriesQuery', () => {
    it('should validate correct query parameters', () => {
      const data = {
        page: '1',
        limit: '20',
        difficulty: 'beginner',
        featured: 'true',
      };

      const result = validateStoriesQuery(data);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid difficulty level', () => {
      const data = {
        difficulty: 'invalid',
      };

      const result = validateStoriesQuery(data);
      expect(result.success).toBe(false);
    });
  });
});
