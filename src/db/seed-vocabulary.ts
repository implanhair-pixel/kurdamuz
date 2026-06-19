import { supabaseAdmin } from '@/lib/supabase';

// ============================================================================
// SEED DATA FOR PHASE 3: VOCABULARY SYSTEM
// ============================================================================

const dialects = [
  {
    name: 'Sorani',
    code: 'ckb',
    description: 'Central Kurdish, written in Arabic script',
  },
  {
    name: 'Kurmanji',
    code: 'kmr',
    description: 'Northern Kurdish, written in Latin script',
  },
  {
    name: 'Kalhori',
    code: 'sdh',
    description: 'Southern Kurdish dialect',
  },
  {
    name: 'Southern Kurdish',
    code: 'sdh',
    description: 'Southern Kurdish language group',
  },
  {
    name: 'Zazaki',
    code: 'zza',
    description: 'Zazaki language, also known as Dimli',
  },
  {
    name: 'Gorani',
    code: 'hac',
    description: 'Gorani language group',
  },
];

const vocabularyCategories = [
  {
    name: 'Family',
    slug: 'family',
    description: 'Family and relationships',
  },
  {
    name: 'Food',
    slug: 'food',
    description: 'Food and cooking',
  },
  {
    name: 'Travel',
    slug: 'travel',
    description: 'Travel and transportation',
  },
  {
    name: 'Education',
    slug: 'education',
    description: 'Education and learning',
  },
  {
    name: 'Business',
    slug: 'business',
    description: 'Business and work',
  },
  {
    name: 'Culture',
    slug: 'culture',
    description: 'Culture and arts',
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Technology and computing',
  },
  {
    name: 'Daily Life',
    slug: 'daily-life',
    description: 'Daily life and activities',
  },
];

const vocabularyTags = [
  { name: 'common', slug: 'common' },
  { name: 'essential', slug: 'essential' },
  { name: 'beginner', slug: 'beginner' },
  { name: 'greeting', slug: 'greeting' },
  { name: 'formal', slug: 'formal' },
  { name: 'informal', slug: 'informal' },
  { name: 'slang', slug: 'slang' },
  { name: 'idiom', slug: 'idiom' },
];

const sampleVocabulary = [
  {
    kurdish_word: 'سڵاو',
    persian_translation: 'سلام',
    english_translation: 'Hello',
    pronunciation: 'slaw',
    difficulty_level: 'beginner',
    frequency_rank: 1,
    status: 'published',
  },
  {
    kurdish_word: 'بەخێربێیت',
    persian_translation: 'خوب باشید',
    english_translation: 'Goodbye',
    pronunciation: 'baxer beit',
    difficulty_level: 'beginner',
    frequency_rank: 2,
    status: 'published',
  },
  {
    kurdish_word: 'سوپاس',
    persian_translation: 'ممنون',
    english_translation: 'Thank you',
    pronunciation: 'supas',
    difficulty_level: 'beginner',
    frequency_rank: 3,
    status: 'published',
  },
  {
    kurdish_word: 'تێکەوتن',
    persian_translation: 'عذرخواهی',
    english_translation: 'Sorry',
    pronunciation: 'tekutin',
    difficulty_level: 'beginner',
    frequency_rank: 4,
    status: 'published',
  },
  {
    kurdish_word: 'بەڵێ',
    persian_translation: 'بله',
    english_translation: 'Yes',
    pronunciation: 'bele',
    difficulty_level: 'beginner',
    frequency_rank: 5,
    status: 'published',
  },
  {
    kurdish_word: 'نەخێر',
    persian_translation: 'نه',
    english_translation: 'No',
    pronunciation: 'nexer',
    difficulty_level: 'beginner',
    frequency_rank: 6,
    status: 'published',
  },
  {
    kurdish_word: 'تکایە',
    persian_translation: 'لطفا',
    english_translation: 'Please',
    pronunciation: 'takaye',
    difficulty_level: 'beginner',
    frequency_rank: 7,
    status: 'published',
  },
  {
    kurdish_word: 'نازانم',
    persian_translation: 'نمیدانم',
    english_translation: "I don't know",
    pronunciation: 'nazanam',
    difficulty_level: 'beginner',
    frequency_rank: 8,
    status: 'published',
  },
  {
    kurdish_word: 'ڕۆژ',
    persian_translation: 'روز',
    english_translation: 'Day',
    pronunciation: 'roj',
    difficulty_level: 'beginner',
    frequency_rank: 9,
    status: 'published',
  },
  {
    kurdish_word: 'شەو',
    persian_translation: 'شب',
    english_translation: 'Night',
    pronunciation: 'shav',
    difficulty_level: 'beginner',
    frequency_rank: 10,
    status: 'published',
  },
  {
    kurdish_word: 'بەیانی',
    persian_translation: 'صبح',
    english_translation: 'Morning',
    pronunciation: 'beyan',
    difficulty_level: 'beginner',
    frequency_rank: 11,
    status: 'published',
  },
  {
    kurdish_word: 'ئێوارە',
    persian_translation: 'عصر',
    english_translation: 'Afternoon',
    pronunciation: 'eware',
    difficulty_level: 'beginner',
    frequency_rank: 12,
    status: 'published',
  },
  {
    kurdish_word: 'ئێوە',
    persian_translation: 'شام',
    english_translation: 'Evening',
    pronunciation: 'ewe',
    difficulty_level: 'beginner',
    frequency_rank: 13,
    status: 'published',
  },
  {
    kurdish_word: 'خێزان',
    persian_translation: 'خانواده',
    english_translation: 'Family',
    pronunciation: 'khezan',
    difficulty_level: 'beginner',
    frequency_rank: 14,
    status: 'published',
  },
  {
    kurdish_word: 'باوک',
    persian_translation: 'پدر',
    english_translation: 'Father',
    pronunciation: 'bawak',
    difficulty_level: 'beginner',
    frequency_rank: 15,
    status: 'published',
  },
  {
    kurdish_word: 'دایک',
    persian_translation: 'مادر',
    english_translation: 'Mother',
    pronunciation: 'dayik',
    difficulty_level: 'beginner',
    frequency_rank: 16,
    status: 'published',
  },
  {
    kurdish_word: 'برا',
    persian_translation: 'برادر',
    english_translation: 'Brother',
    pronunciation: 'bra',
    difficulty_level: 'beginner',
    frequency_rank: 17,
    status: 'published',
  },
  {
    kurdish_word: 'خوشک',
    persian_translation: 'خواهر',
    english_translation: 'Sister',
    pronunciation: 'khoshk',
    difficulty_level: 'beginner',
    frequency_rank: 18,
    status: 'published',
  },
  {
    kurdish_word: 'زمان',
    persian_translation: 'زبان',
    english_translation: 'Language',
    pronunciation: 'ziman',
    difficulty_level: 'beginner',
    frequency_rank: 19,
    status: 'published',
  },
  {
    kurdish_word: 'کورد',
    persian_translation: 'کرد',
    english_translation: 'Kurdish',
    pronunciation: 'kurd',
    difficulty_level: 'beginner',
    frequency_rank: 20,
    status: 'published',
  },
];

const sampleExamples = [
  {
    kurdish_sentence: 'سڵاو، چۆنیت؟',
    persian_translation: 'سلام، حالت چطوره؟',
    english_translation: 'Hello, how are you?',
    vocabulary_index: 0,
  },
  {
    kurdish_sentence: 'سوپاس بۆ یارمەتیت.',
    persian_translation: 'ممنون از کمکت.',
    english_translation: 'Thank you for your help.',
    vocabulary_index: 2,
  },
  {
    kurdish_sentence: 'من زمانی کوردی دەخوێنم.',
    persian_translation: 'من زبان کردی صحبت می‌کنم.',
    english_translation: 'I speak Kurdish.',
    vocabulary_index: 18,
  },
];

async function seedDialects() {
  console.log('Seeding dialects...');
  for (const dialect of dialects) {
    const { error } = await supabaseAdmin
      .from('dialects')
      .insert(dialect);
    
    if (error) {
      console.error('Error inserting dialect:', dialect.name, error);
    } else {
      console.log('✓ Inserted dialect:', dialect.name);
    }
  }
}

async function seedVocabularyCategories() {
  console.log('Seeding vocabulary categories...');
  for (const category of vocabularyCategories) {
    const { error } = await supabaseAdmin
      .from('vocabulary_categories')
      .insert(category);
    
    if (error) {
      console.error('Error inserting category:', category.name, error);
    } else {
      console.log('✓ Inserted category:', category.name);
    }
  }
}

async function seedVocabularyTags() {
  console.log('Seeding vocabulary tags...');
  for (const tag of vocabularyTags) {
    const { error } = await supabaseAdmin
      .from('vocabulary_tags')
      .insert(tag);
    
    if (error) {
      console.error('Error inserting tag:', tag.name, error);
    } else {
      console.log('✓ Inserted tag:', tag.name);
    }
  }
}

async function seedVocabulary() {
  console.log('Seeding vocabulary...');
  
  // Get dialect IDs
  const { data: dialectsData } = await supabaseAdmin
    .from('dialects')
    .select('id, code');
  
  const soraniDialect = dialectsData?.find(d => d.code === 'ckb');
  
  for (const vocab of sampleVocabulary) {
    const { data: vocabulary, error } = await supabaseAdmin
      .from('vocabulary')
      .insert(vocab)
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting vocabulary:', vocab.kurdish_word, error);
    } else {
      console.log('✓ Inserted vocabulary:', vocab.kurdish_word);
      
      // Assign to Sorani dialect by default
      if (soraniDialect && vocabulary) {
        await supabaseAdmin
          .from('vocabulary_dialects')
          .insert({
            vocabulary_id: vocabulary.id,
            dialect_id: soraniDialect.id,
          });
      }
      
      // Add beginner tag
      const { data: beginnerTag } = await supabaseAdmin
        .from('vocabulary_tags')
        .select('id')
        .eq('slug', 'beginner')
        .single();
      
      if (beginnerTag && vocabulary) {
        await supabaseAdmin
          .from('vocabulary_tag_assignments')
          .insert({
            vocabulary_id: vocabulary.id,
            tag_id: beginnerTag.id,
          });
      }
    }
  }
}

async function seedExamples() {
  console.log('Seeding vocabulary examples...');
  
  const { data: vocabularyData } = await supabaseAdmin
    .from('vocabulary')
    .select('id, kurdish_word')
    .order('created_at');
  
  for (const example of sampleExamples) {
    const vocab = vocabularyData?.[example.vocabulary_index];
    if (vocab) {
      const { error } = await supabaseAdmin
        .from('vocabulary_examples')
        .insert({
          vocabulary_id: vocab.id,
          kurdish_sentence: example.kurdish_sentence,
          persian_translation: example.persian_translation,
          english_translation: example.english_translation,
        });
      
      if (error) {
        console.error('Error inserting example for:', vocab.kurdish_word, error);
      } else {
        console.log('✓ Inserted example for:', vocab.kurdish_word);
      }
    }
  }
}

async function main() {
  try {
    console.log('Starting Phase 3 seed data...');
    
    await seedDialects();
    await seedVocabularyCategories();
    await seedVocabularyTags();
    await seedVocabulary();
    await seedExamples();
    
    console.log('✓ Phase 3 seed data completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

main();
