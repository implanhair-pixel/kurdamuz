// Phase 13: Dialect Comparison Platform - TypeScript Types and Interfaces

// Audit Log Types
export interface AuditLogEntry {
  id: string;
  actorId: string;
  actionType: string;
  targetId: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  createdAt: Date;
}

export interface CreateAuditLogRequest {
  userId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface Dialect {
  id: string;
  name: string;
  code: string;
  description: string | null;
  region: string | null;
  status: 'active' | 'deprecated' | 'experimental';
  createdAt: Date;
  updatedAt: Date;
}

export interface DialectVariant {
  id: string;
  entryId: string;
  dialectId: string;
  variantForm: string;
  phoneticForm: string | null;
  usageFrequency: 'common' | 'uncommon' | 'rare' | 'archaic' | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LexicalMeaning {
  id: string;
  entryId: string;
  definition: string;
  semanticDomain: string | null;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LinguisticAnnotation {
  id: string;
  entryId: string;
  annotationType: 'morphological' | 'phonological' | 'syntactic' | 'semantic' | 'dialect' | 'historical' | 'usage' | 'research';
  annotationData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface LexicalRelationship {
  id: string;
  sourceEntryId: string;
  targetEntryId: string;
  relationshipType: 'synonym' | 'antonym' | 'cognate' | 'derivative' | 'compound' | 'related';
  createdAt: Date;
}

export interface ResearchCollection {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DialectAuditLog {
  id: string;
  actorId: string;
  actionType: 'create' | 'update' | 'delete' | 'publish' | 'validate' | 'import';
  targetId: string;
  oldValue: Record<string, any> | null;
  newValue: Record<string, any> | null;
  createdAt: Date;
}

// API Request/Response Types
export interface CreateDialectRequest {
  name: string;
  code: string;
  description?: string | null;
  region?: string | null;
  status?: 'active' | 'deprecated' | 'experimental';
}

export interface UpdateDialectRequest {
  name?: string;
  description?: string | null;
  region?: string | null;
  status?: 'active' | 'deprecated' | 'experimental';
}

export interface CreateDialectVariantRequest {
  entryId: string;
  dialectId: string;
  variantForm: string;
  phoneticForm?: string | null;
  usageFrequency?: 'common' | 'uncommon' | 'rare' | 'archaic' | null;
}

export interface CreateLexicalMeaningRequest {
  entryId: string;
  definition: string;
  semanticDomain?: string | null;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert' | null;
}

export interface CreateLinguisticAnnotationRequest {
  entryId: string;
  annotationType: 'morphological' | 'phonological' | 'syntactic' | 'semantic' | 'dialect' | 'historical' | 'usage' | 'research';
  annotationData: Record<string, any>;
}

export interface CreateLexicalRelationshipRequest {
  sourceEntryId: string;
  targetEntryId: string;
  relationshipType: 'synonym' | 'antonym' | 'cognate' | 'derivative' | 'compound' | 'related';
}

export interface CreateResearchCollectionRequest {
  title: string;
  description?: string | null;
}

// Search and Filter Types
export interface DialectSearchParams {
  query?: string;
  dialectIds?: string[];
  regions?: string[];
  partsOfSpeech?: string[];
  semanticDomains?: string[];
  difficultyLevels?: string[];
  usageFrequencies?: string[];
  limit?: number;
  offset?: number;
}

export interface DialectFilterOptions {
  dialects: Dialect[];
  regions: string[];
  partsOfSpeech: string[];
  semanticDomains: string[];
  difficultyLevels: string[];
  usageFrequencies: string[];
}

export interface SearchResult {
  entryId: string;
  kurdishWord: string;
  normalizedForm?: string;
  persianTranslation: string;
  englishTranslation?: string;
  partOfSpeech?: string;
  dialects: Dialect[];
  variants: DialectVariant[];
  meanings: LexicalMeaning[];
  relevanceScore: number;
}

export interface ComparisonResult {
  sourceEntry: {
    id: string;
    kurdishWord: string;
    dialect: Dialect;
  };
  targetEntry: {
    id: string;
    kurdishWord: string;
    dialect: Dialect;
  };
  similarityScore: number;
  differences: string[];
  commonalities: string[];
}

// Dictionary Mode Types
export interface DictionaryEntry {
  id: string;
  lemma: string;
  normalizedForm?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  meanings: LexicalMeaning[];
  dialectVariants: DialectVariant[];
  exampleSentences: {
    sentence: string;
    translation: string;
    dialect?: Dialect;
    sourceReference?: string;
  }[];
  annotations: LinguisticAnnotation[];
  relatedTerms: LexicalRelationship[];
  etymology?: string;
  rootForm?: string;
}

// Research Workspace Types
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  searchParams: DialectSearchParams;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchNote {
  id: string;
  collectionId: string;
  entryId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface DialectAnalytics {
  dialectId: string;
  dialectName: string;
  totalEntries: number;
  totalVariants: number;
  totalAnnotations: number;
  searchCount: number;
  lastUpdated: Date;
}

export interface UserDialectActivity {
  userId: string;
  dialectId: string;
  searchCount: number;
  comparisonCount: number;
  dictionaryLookupCount: number;
  lastActivity: Date;
}

export interface SearchUsageMetrics {
  totalSearches: number;
  uniqueSearchTerms: number;
  averageResultsPerSearch: number;
  topSearchTerms: Array<{
    term: string;
    count: number;
  }>;
  searchesByDialect: Array<{
    dialectId: string;
    dialectName: string;
    count: number;
  }>;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// RBAC Types
export type DialectRole = 'admin' | 'editor' | 'linguist' | 'researcher' | 'student';

export type UserRole = 'admin' | 'moderator' | 'researcher' | 'user' | 'guest';

export type Permission =
  | 'dialects:read' | 'dialects:write' | 'dialects:delete'
  | 'vocabulary:read' | 'vocabulary:write' | 'vocabulary:delete'
  | 'annotations:read' | 'annotations:write' | 'annotations:delete'
  | 'collections:read' | 'collections:write' | 'collections:delete'
  | 'search:read'
  | 'analytics:read'
  | 'audit:read'
  | 'users:read' | 'users:write'
  | 'settings:read' | 'settings:write';

export interface DialectPermission {
  role: DialectRole;
  permissions: DialectPermissionItem[];
}

export interface DialectPermissionItem {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete' | 'publish' | 'validate' | 'audit')[];
}

export const ROLE_PERMISSIONS: Record<DialectRole, DialectPermissionItem[]> = {
  admin: [
    { resource: 'dialects', actions: ['create', 'read', 'update', 'delete', 'publish', 'validate', 'audit'] },
    { resource: 'entries', actions: ['create', 'read', 'update', 'delete', 'publish', 'validate', 'audit'] },
    { resource: 'annotations', actions: ['create', 'read', 'update', 'delete', 'publish', 'validate', 'audit'] },
    { resource: 'collections', actions: ['create', 'read', 'update', 'delete', 'audit'] },
  ],
  editor: [
    { resource: 'dialects', actions: ['read', 'update'] },
    { resource: 'entries', actions: ['create', 'read', 'update', 'publish'] },
    { resource: 'annotations', actions: ['create', 'read', 'update', 'publish'] },
    { resource: 'collections', actions: ['read'] },
  ],
  linguist: [
    { resource: 'dialects', actions: ['read'] },
    { resource: 'entries', actions: ['create', 'read', 'update', 'validate'] },
    { resource: 'annotations', actions: ['create', 'read', 'update', 'validate'] },
    { resource: 'collections', actions: ['read'] },
  ],
  researcher: [
    { resource: 'dialects', actions: ['read'] },
    { resource: 'entries', actions: ['read'] },
    { resource: 'annotations', actions: ['read'] },
    { resource: 'collections', actions: ['create', 'read', 'update', 'delete'] },
  ],
  student: [
    { resource: 'dialects', actions: ['read'] },
    { resource: 'entries', actions: ['read'] },
    { resource: 'annotations', actions: ['read'] },
    { resource: 'collections', actions: ['create', 'read', 'update', 'delete'] },
  ],
};
