export interface ValidationResult {
  success: boolean;
  errors: Record<string, string>;
}

export function validateCourse(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.title = 'Title is required and must be a non-empty string';
  }

  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.slug = 'Slug is required and must be a non-empty string';
  }

  if (data.slug && !/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
  }

  if (data.difficulty_level && !['beginner', 'elementary', 'intermediate', 'advanced'].includes(data.difficulty_level)) {
    errors.difficulty_level = 'Invalid difficulty level';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLesson(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.title = 'Title is required and must be a non-empty string';
  }

  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.slug = 'Slug is required and must be a non-empty string';
  }

  if (!data.lesson_type || !['reading', 'vocabulary', 'grammar', 'exercise'].includes(data.lesson_type)) {
    errors.lesson_type = 'Invalid lesson type';
  }

  if (data.xp_reward && (typeof data.xp_reward !== 'number' || data.xp_reward < 0 || data.xp_reward > 1000)) {
    errors.xp_reward = 'XP reward must be a number between 0 and 1000';
  }

  if (data.estimated_duration && (typeof data.estimated_duration !== 'number' || data.estimated_duration < 0)) {
    errors.estimated_duration = 'Estimated duration must be a positive number';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateVocabulary(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.kurdish_word || typeof data.kurdish_word !== 'string' || data.kurdish_word.trim().length === 0) {
    errors.kurdish_word = 'Kurdish word is required';
  }

  if (!data.persian_translation || typeof data.persian_translation !== 'string' || data.persian_translation.trim().length === 0) {
    errors.persian_translation = 'Persian translation is required';
  }

  if (data.difficulty_level && !['beginner', 'elementary', 'intermediate', 'advanced'].includes(data.difficulty_level)) {
    errors.difficulty_level = 'Invalid difficulty level';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// ============================================================================
// VOCABULARY SYSTEM VALIDATION
// ============================================================================

export function validateVocabularyEntry(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.kurdish_word || typeof data.kurdish_word !== 'string' || data.kurdish_word.trim().length === 0) {
    errors.kurdish_word = 'Kurdish word is required';
  } else if (data.kurdish_word.length > 500) {
    errors.kurdish_word = 'Kurdish word must be less than 500 characters';
  }

  if (!data.persian_translation || typeof data.persian_translation !== 'string' || data.persian_translation.trim().length === 0) {
    errors.persian_translation = 'Persian translation is required';
  } else if (data.persian_translation.length > 500) {
    errors.persian_translation = 'Persian translation must be less than 500 characters';
  }

  if (data.english_translation && data.english_translation.length > 500) {
    errors.english_translation = 'English translation must be less than 500 characters';
  }

  if (data.pronunciation && data.pronunciation.length > 500) {
    errors.pronunciation = 'Pronunciation must be less than 500 characters';
  }

  if (data.audio_url && !isValidUrl(data.audio_url)) {
    errors.audio_url = 'Audio URL must be a valid URL';
  }

  if (data.difficulty_level && !['beginner', 'elementary', 'intermediate', 'advanced'].includes(data.difficulty_level)) {
    errors.difficulty_level = 'Invalid difficulty level';
  }

  if (data.frequency_rank !== undefined && (typeof data.frequency_rank !== 'number' || data.frequency_rank < 0)) {
    errors.frequency_rank = 'Frequency rank must be a non-negative number';
  }

  if (data.status && !['draft', 'published', 'archived'].includes(data.status)) {
    errors.status = 'Invalid status';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateVocabularyExample(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.kurdish_sentence || typeof data.kurdish_sentence !== 'string' || data.kurdish_sentence.trim().length === 0) {
    errors.kurdish_sentence = 'Kurdish sentence is required';
  } else if (data.kurdish_sentence.length > 1000) {
    errors.kurdish_sentence = 'Kurdish sentence must be less than 1000 characters';
  }

  if (!data.persian_translation || typeof data.persian_translation !== 'string' || data.persian_translation.trim().length === 0) {
    errors.persian_translation = 'Persian translation is required';
  } else if (data.persian_translation.length > 1000) {
    errors.persian_translation = 'Persian translation must be less than 1000 characters';
  }

  if (!data.english_translation || typeof data.english_translation !== 'string' || data.english_translation.trim().length === 0) {
    errors.english_translation = 'English translation is required';
  } else if (data.english_translation.length > 1000) {
    errors.english_translation = 'English translation must be less than 1000 characters';
  }

  if (!data.vocabulary_id || !validateUUID(data.vocabulary_id)) {
    errors.vocabulary_id = 'Valid vocabulary ID is required';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateNotebook(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.title = 'Title is required';
  } else if (data.title.length > 200) {
    errors.title = 'Title must be less than 200 characters';
  }

  if (data.description && data.description.length > 1000) {
    errors.description = 'Description must be less than 1000 characters';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateReviewAttempt(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.session_id || !validateUUID(data.session_id)) {
    errors.session_id = 'Valid session ID is required';
  }

  if (!data.vocabulary_id || !validateUUID(data.vocabulary_id)) {
    errors.vocabulary_id = 'Valid vocabulary ID is required';
  }

  if (data.response_quality === undefined || typeof data.response_quality !== 'number' || data.response_quality < 0 || data.response_quality > 5) {
    errors.response_quality = 'Response quality must be a number between 0 and 5';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateDialect(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  if (!data.code || typeof data.code !== 'string' || data.code.trim().length === 0) {
    errors.code = 'Code is required';
  } else if (!/^[a-z0-9_-]+$/.test(data.code)) {
    errors.code = 'Code must contain only lowercase letters, numbers, underscores, and hyphens';
  } else if (data.code.length > 10) {
    errors.code = 'Code must be less than 10 characters';
  }

  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateVocabularyCategory(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be less than 100 characters';
  }

  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.slug = 'Slug is required';
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
  } else if (data.slug.length > 100) {
    errors.slug = 'Slug must be less than 100 characters';
  }

  if (data.description && data.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateVocabularyTag(data: any): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.name = 'Name is required';
  } else if (data.name.length > 50) {
    errors.name = 'Name must be less than 50 characters';
  }

  if (!data.slug || typeof data.slug !== 'string' || data.slug.trim().length === 0) {
    errors.slug = 'Slug is required';
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.slug = 'Slug must contain only lowercase letters, numbers, and hyphens';
  } else if (data.slug.length > 50) {
    errors.slug = 'Slug must be less than 50 characters';
  }

  return {
    success: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export function handleApiError(error: unknown): { error: string; status: number } {
  if (error instanceof ValidationError) {
    return {
      error: JSON.stringify(error.errors),
      status: 400,
    };
  }

  if (error instanceof NotFoundError) {
    return {
      error: error.message,
      status: 404,
    };
  }

  if (error instanceof UnauthorizedError) {
    return {
      error: error.message,
      status: 401,
    };
  }

  if (error instanceof ForbiddenError) {
    return {
      error: error.message,
      status: 403,
    };
  }

  console.error('Unhandled error:', error);
  return {
    error: 'Internal server error',
    status: 500,
  };
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
