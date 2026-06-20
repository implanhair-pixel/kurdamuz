import { db } from '@/db';
import { dialects, dialectVariants, lexicalMeanings, linguisticAnnotations, lexicalRelationships, researchCollections, dialectAuditLogs } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type {
  Dialect,
  CreateDialectRequest,
  UpdateDialectRequest,
  DialectVariant,
  CreateDialectVariantRequest,
  LexicalMeaning,
  CreateLexicalMeaningRequest,
  LinguisticAnnotation,
  CreateLinguisticAnnotationRequest,
  LexicalRelationship,
  CreateLexicalRelationshipRequest,
  ResearchCollection,
  CreateResearchCollectionRequest,
  DialectAuditLog,
} from '@/types/dialects';

// Dialect CRUD Operations
export async function createDialect(data: CreateDialectRequest): Promise<Dialect> {
  const [dialect] = await db
    .insert(dialects)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();
  
  return dialect as Dialect;
}

export async function getDialectById(id: string): Promise<Dialect | null> {
  const [dialect] = await db
    .select()
    .from(dialects)
    .where(eq(dialects.id, id))
    .limit(1);
  
  return (dialect as Dialect) || null;
}

export async function getDialectByCode(code: string): Promise<Dialect | null> {
  const [dialect] = await db
    .select()
    .from(dialects)
    .where(eq(dialects.code, code))
    .limit(1);
  
  return (dialect as Dialect) || null;
}

export async function getAllDialects(): Promise<Dialect[]> {
  return db
    .select()
    .from(dialects)
    .orderBy(dialects.name);
}

export async function getActiveDialects(): Promise<Dialect[]> {
  return db
    .select()
    .from(dialects)
    .where(eq(dialects.status, 'active'))
    .orderBy(dialects.name);
}

export async function updateDialect(id: string, data: UpdateDialectRequest): Promise<Dialect | null> {
  const [dialect] = await db
    .update(dialects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(dialects.id, id))
    .returning();
  
  return (dialect as Dialect) || null;
}

export async function deleteDialect(id: string): Promise<boolean> {
  const result = await db
    .delete(dialects)
    .where(eq(dialects.id, id));
  
  return true;
}

// Dialect Variant CRUD Operations
export async function createDialectVariant(data: CreateDialectVariantRequest): Promise<DialectVariant> {
  const [variant] = await db
    .insert(dialectVariants)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();
  
  return variant as DialectVariant;
}

export async function getDialectVariantsByEntry(entryId: string): Promise<DialectVariant[]> {
  return db
    .select()
    .from(dialectVariants)
    .where(eq(dialectVariants.entryId, entryId))
    .orderBy(dialectVariants.variantForm);
}

export async function getDialectVariantsByDialect(dialectId: string): Promise<DialectVariant[]> {
  return db
    .select()
    .from(dialectVariants)
    .where(eq(dialectVariants.dialectId, dialectId))
    .orderBy(dialectVariants.variantForm);
}

export async function updateDialectVariant(id: string, data: Partial<CreateDialectVariantRequest>): Promise<DialectVariant | null> {
  const [variant] = await db
    .update(dialectVariants)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(dialectVariants.id, id))
    .returning();
  
  return (variant as DialectVariant) || null;
}

export async function deleteDialectVariant(id: string): Promise<boolean> {
  await db
    .delete(dialectVariants)
    .where(eq(dialectVariants.id, id));
  
  return true;
}

// Lexical Meaning CRUD Operations
export async function createLexicalMeaning(data: CreateLexicalMeaningRequest): Promise<LexicalMeaning> {
  const [meaning] = await db
    .insert(lexicalMeanings)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();
  
  return meaning as LexicalMeaning;
}

export async function getLexicalMeaningsByEntry(entryId: string): Promise<LexicalMeaning[]> {
  return db
    .select()
    .from(lexicalMeanings)
    .where(eq(lexicalMeanings.entryId, entryId))
    .orderBy(lexicalMeanings.definition);
}

export async function updateLexicalMeaning(id: string, data: Partial<CreateLexicalMeaningRequest>): Promise<LexicalMeaning | null> {
  const [meaning] = await db
    .update(lexicalMeanings)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(lexicalMeanings.id, id))
    .returning();
  
  return (meaning as LexicalMeaning) || null;
}

export async function deleteLexicalMeaning(id: string): Promise<boolean> {
  await db
    .delete(lexicalMeanings)
    .where(eq(lexicalMeanings.id, id));
  
  return true;
}

// Linguistic Annotation CRUD Operations
export async function createLinguisticAnnotation(data: CreateLinguisticAnnotationRequest): Promise<LinguisticAnnotation> {
  const [annotation] = await db
    .insert(linguisticAnnotations)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning();
  
  return annotation as LinguisticAnnotation;
}

export async function getLinguisticAnnotationsByEntry(entryId: string): Promise<LinguisticAnnotation[]> {
  return db
    .select()
    .from(linguisticAnnotations)
    .where(eq(linguisticAnnotations.entryId, entryId))
    .orderBy(linguisticAnnotations.annotationType);
}

export async function getLinguisticAnnotationsByType(entryId: string, annotationType: 'morphological' | 'phonological' | 'syntactic' | 'semantic' | 'dialect' | 'historical' | 'usage' | 'research'): Promise<LinguisticAnnotation[]> {
  return db
    .select()
    .from(linguisticAnnotations)
    .where(
      and(
        eq(linguisticAnnotations.entryId, entryId),
        eq(linguisticAnnotations.annotationType, annotationType)
      )
    )
    .orderBy(linguisticAnnotations.createdAt);
}

export async function updateLinguisticAnnotation(id: string, data: Partial<CreateLinguisticAnnotationRequest>): Promise<LinguisticAnnotation | null> {
  const [annotation] = await db
    .update(linguisticAnnotations)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(linguisticAnnotations.id, id))
    .returning();
  
  return (annotation as LinguisticAnnotation) || null;
}

export async function deleteLinguisticAnnotation(id: string): Promise<boolean> {
  await db
    .delete(linguisticAnnotations)
    .where(eq(linguisticAnnotations.id, id));
  
  return true;
}

// Lexical Relationship CRUD Operations
export async function createLexicalRelationship(data: CreateLexicalRelationshipRequest): Promise<LexicalRelationship> {
  const [relationship] = await db
    .insert(lexicalRelationships)
    .values(data)
    .returning();
  
  return relationship as LexicalRelationship;
}

export async function getLexicalRelationshipsByEntry(entryId: string): Promise<LexicalRelationship[]> {
  return db
    .select()
    .from(lexicalRelationships)
    .where(eq(lexicalRelationships.sourceEntryId, entryId))
    .orderBy(lexicalRelationships.relationshipType);
}

export async function getLexicalRelationshipsByType(entryId: string, relationshipType: 'synonym' | 'antonym' | 'cognate' | 'derivative' | 'compound' | 'related'): Promise<LexicalRelationship[]> {
  return db
    .select()
    .from(lexicalRelationships)
    .where(
      and(
        eq(lexicalRelationships.sourceEntryId, entryId),
        eq(lexicalRelationships.relationshipType, relationshipType)
      )
    )
    .orderBy(lexicalRelationships.createdAt);
}

export async function deleteLexicalRelationship(id: string): Promise<boolean> {
  await db
    .delete(lexicalRelationships)
    .where(eq(lexicalRelationships.id, id));
  
  return true;
}

// Research Collection CRUD Operations
export async function createResearchCollection(userId: string, data: CreateResearchCollectionRequest): Promise<ResearchCollection> {
  const [collection] = await db
    .insert(researchCollections)
    .values({
      userId,
      ...data,
      updatedAt: new Date(),
    })
    .returning();
  
  return collection as ResearchCollection;
}

export async function getResearchCollectionsByUser(userId: string): Promise<ResearchCollection[]> {
  return db
    .select()
    .from(researchCollections)
    .where(eq(researchCollections.userId, userId))
    .orderBy(desc(researchCollections.updatedAt));
}

export async function getResearchCollectionById(id: string): Promise<ResearchCollection | null> {
  const [collection] = await db
    .select()
    .from(researchCollections)
    .where(eq(researchCollections.id, id))
    .limit(1);
  
  return (collection as ResearchCollection) || null;
}

export async function updateResearchCollection(id: string, data: Partial<CreateResearchCollectionRequest>): Promise<ResearchCollection | null> {
  const [collection] = await db
    .update(researchCollections)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(researchCollections.id, id))
    .returning();
  
  return (collection as ResearchCollection) || null;
}

export async function deleteResearchCollection(id: string): Promise<boolean> {
  await db
    .delete(researchCollections)
    .where(eq(researchCollections.id, id));
  
  return true;
}

// Audit Log Operations
export async function createAuditLog(data: Omit<DialectAuditLog, 'id' | 'createdAt'>): Promise<DialectAuditLog> {
  const [log] = await db
    .insert(dialectAuditLogs)
    .values(data)
    .returning();
  
  return log as DialectAuditLog;
}

export async function getAuditLogsByTarget(targetId: string): Promise<DialectAuditLog[]> {
  return db
    .select()
    .from(dialectAuditLogs)
    .where(eq(dialectAuditLogs.targetId, targetId))
    .orderBy(desc(dialectAuditLogs.createdAt));
}

export async function getAuditLogsByActor(actorId: string): Promise<DialectAuditLog[]> {
  return db
    .select()
    .from(dialectAuditLogs)
    .where(eq(dialectAuditLogs.actorId, actorId))
    .orderBy(desc(dialectAuditLogs.createdAt));
}

export async function getAuditLogsByAction(actionType: 'create' | 'delete' | 'update' | 'publish' | 'validate' | 'import'): Promise<DialectAuditLog[]> {
  return db
    .select()
    .from(dialectAuditLogs)
    .where(eq(dialectAuditLogs.actionType, actionType))
    .orderBy(desc(dialectAuditLogs.createdAt));
}
