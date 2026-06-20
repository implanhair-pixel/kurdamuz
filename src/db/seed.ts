import * as dotenv from 'dotenv';
import * as path from 'path';
import { supabaseAdmin } from '../lib/supabase';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function seed() {
  console.log('Starting seed...');

  // Create categories
  const beginnerCategoryId = generateUUID();
  const elementaryCategoryId = generateUUID();

  const { error: categoriesError } = await supabaseAdmin
    .from('categories')
    .insert([
      {
        id: beginnerCategoryId,
        name: 'Beginner',
        slug: 'beginner',
        description: 'Designed for learners with little or no prior exposure to the Kurdish language.',
      },
      {
        id: elementaryCategoryId,
        name: 'Elementary',
        slug: 'elementary',
        description: 'Focused on establishing foundational language competency and practical communication skills.',
      },
    ]);

  if (categoriesError) {
    console.error('Error inserting categories:', categoriesError);
    return;
  }

  // Create courses (Sorani and Kurmanji)
  const soraniCourseId = generateUUID();
  const kurmanjiCourseId = generateUUID();

  const { error: coursesError } = await supabaseAdmin
    .from('courses')
    .insert([
      {
        id: soraniCourseId,
        category_id: beginnerCategoryId,
        title: 'Kurdish Sorani for Beginners',
        slug: 'kurdish-sorani-for-beginners',
        description: 'Learn the fundamentals of Kurdish Sorani dialect with this comprehensive beginner course.',
        difficulty_level: 'beginner',
        is_published: true,
      },
      {
        id: kurmanjiCourseId,
        category_id: beginnerCategoryId,
        title: 'Kurdish Kurmanji for Beginners',
        slug: 'kurdish-kurmanji-for-beginners',
        description: 'Master the basics of Kurdish Kurmanji dialect through structured lessons and practice.',
        difficulty_level: 'beginner',
        is_published: true,
      },
    ]);

  if (coursesError) {
    console.error('Error inserting courses:', coursesError);
    return;
  }

  // Create modules for Sorani course
  const soraniModule1Id = generateUUID();
  const soraniModule2Id = generateUUID();

  const { error: soraniModulesError } = await supabaseAdmin
    .from('course_modules')
    .insert([
      {
        id: soraniModule1Id,
        course_id: soraniCourseId,
        title: 'Introduction to Sorani',
        description: 'Learn the basics of the Sorani dialect',
        sort_order: 1,
      },
      {
        id: soraniModule2Id,
        course_id: soraniCourseId,
        title: 'Basic Vocabulary',
        description: 'Essential words and phrases',
        sort_order: 2,
      },
    ]);

  if (soraniModulesError) {
    console.error('Error inserting Sorani modules:', soraniModulesError);
    return;
  }

  // Create modules for Kurmanji course
  const kurmanjiModule1Id = generateUUID();
  const kurmanjiModule2Id = generateUUID();

  const { error: kurmanjiModulesError } = await supabaseAdmin
    .from('course_modules')
    .insert([
      {
        id: kurmanjiModule1Id,
        course_id: kurmanjiCourseId,
        title: 'Introduction to Kurmanji',
        description: 'Learn the basics of the Kurmanji dialect',
        sort_order: 1,
      },
      {
        id: kurmanjiModule2Id,
        course_id: kurmanjiCourseId,
        title: 'Basic Vocabulary',
        description: 'Essential words and phrases',
        sort_order: 2,
      },
    ]);

  if (kurmanjiModulesError) {
    console.error('Error inserting Kurmanji modules:', kurmanjiModulesError);
    return;
  }

  // Create lessons for Sorani course
  const soraniLesson1Id = generateUUID();
  const soraniLesson2Id = generateUUID();
  const soraniLesson3Id = generateUUID();
  const soraniLesson4Id = generateUUID();
  const soraniLesson5Id = generateUUID();

  const { error: soraniLessonsError } = await supabaseAdmin
    .from('lessons')
    .insert([
      {
        id: soraniLesson1Id,
        module_id: soraniModule1Id,
        title: 'Greetings and Introductions',
        slug: 'greetings-introductions',
        lesson_type: 'reading',
        content: {
          sections: [
            {
              title: 'Common Greetings',
              content: 'Learn how to say hello and introduce yourself in Sorani Kurdish.',
            },
          ],
        },
        xp_reward: 50,
        estimated_duration: 15,
        sort_order: 1,
      },
      {
        id: soraniLesson2Id,
        module_id: soraniModule1Id,
        title: 'Numbers 1-10',
        slug: 'numbers-1-10',
        lesson_type: 'vocabulary',
        content: {
          words: [
            { kurdish: 'یەک', persian: 'یک', english: 'one' },
            { kurdish: 'دوو', persian: 'دو', english: 'two' },
          ],
        },
        xp_reward: 30,
        estimated_duration: 10,
        sort_order: 2,
      },
      {
        id: soraniLesson3Id,
        module_id: soraniModule2Id,
        title: 'Family Members',
        slug: 'family-members',
        lesson_type: 'vocabulary',
        content: {
          words: [
            { kurdish: 'دایک', persian: 'مادر', english: 'mother' },
            { kurdish: 'باوک', persian: 'پدر', english: 'father' },
          ],
        },
        xp_reward: 40,
        estimated_duration: 12,
        sort_order: 3,
      },
      {
        id: soraniLesson4Id,
        module_id: soraniModule2Id,
        title: 'Basic Grammar: Articles',
        slug: 'basic-grammar-articles',
        lesson_type: 'grammar',
        content: {
          topic: 'Definite and indefinite articles in Sorani',
          examples: [
            { kurdish: 'کتێب', persian: 'کتاب', english: 'book' },
            { kurdish: 'کتێبەکە', persian: 'آن کتاب', english: 'the book' },
          ],
        },
        xp_reward: 60,
        estimated_duration: 20,
        sort_order: 4,
      },
      {
        id: soraniLesson5Id,
        module_id: soraniModule2Id,
        title: 'Colors',
        slug: 'colors',
        lesson_type: 'vocabulary',
        content: {
          words: [
            { kurdish: 'سور', persian: 'قرمز', english: 'red' },
            { kurdish: 'شین', persian: 'آبی', english: 'blue' },
          ],
        },
        xp_reward: 35,
        estimated_duration: 10,
        sort_order: 5,
      },
    ]);

  if (soraniLessonsError) {
    console.error('Error inserting Sorani lessons:', soraniLessonsError);
    return;
  }

  // Create lessons for Kurmanji course
  const kurmanjiLesson1Id = generateUUID();
  const kurmanjiLesson2Id = generateUUID();
  const kurmanjiLesson3Id = generateUUID();
  const kurmanjiLesson4Id = generateUUID();
  const kurmanjiLesson5Id = generateUUID();

  const { error: kurmanjiLessonsError } = await supabaseAdmin
    .from('lessons')
    .insert([
      {
        id: kurmanjiLesson1Id,
        module_id: kurmanjiModule1Id,
        title: 'Greetings and Introductions',
        slug: 'greetings-introductions-kurmanji',
        lesson_type: 'reading',
        content: {
          sections: [
            {
              title: 'Common Greetings',
              content: 'Learn how to say hello and introduce yourself in Kurmanji Kurdish.',
            },
          ],
        },
        xp_reward: 50,
        estimated_duration: 15,
        sort_order: 1,
      },
      {
        id: kurmanjiLesson2Id,
        module_id: kurmanjiModule1Id,
        title: 'Numbers 1-10',
        slug: 'numbers-1-10-kurmanji',
        lesson_type: 'vocabulary',
        content: {
          words: [
            { kurdish: 'yek', persian: 'یک', english: 'one' },
            { kurdish: 'du', persian: 'دو', english: 'two' },
          ],
        },
        xp_reward: 30,
        estimated_duration: 10,
        sort_order: 2,
      },
      {
        id: kurmanjiLesson3Id,
        module_id: kurmanjiModule2Id,
        title: 'Family Members',
        slug: 'family-members-kurmanji',
        lesson_type: 'vocabulary',
        content: {
          words: [
            { kurdish: 'dayik', persian: 'مادر', english: 'mother' },
            { kurdish: 'bav', persian: 'پدر', english: 'father' },
          ],
        },
        xp_reward: 40,
        estimated_duration: 12,
        sort_order: 3,
      },
      {
        id: kurmanjiLesson4Id,
        module_id: kurmanjiModule2Id,
        title: 'Basic Grammar: Articles',
        slug: 'basic-grammar-articles-kurmanji',
        lesson_type: 'grammar',
        content: {
          topic: 'Definite and indefinite articles in Kurmanji',
          examples: [
            { kurdish: 'pirtûk', persian: 'کتاب', english: 'book' },
            { kurdish: 'pirtûka', persian: 'آن کتاب', english: 'the book' },
          ],
        },
        xp_reward: 60,
        estimated_duration: 20,
        sort_order: 4,
      },
      {
        id: kurmanjiLesson5Id,
        module_id: kurmanjiModule2Id,
        title: 'Colors',
        slug: 'colors-kurmanji',
        lesson_type: 'vocabulary',
        content: {
          words: [
            { kurdish: 'sor', persian: 'قرمز', english: 'red' },
            { kurdish: 'şîn', persian: 'آبی', english: 'blue' },
          ],
        },
        xp_reward: 35,
        estimated_duration: 10,
        sort_order: 5,
      },
    ]);

  if (kurmanjiLessonsError) {
    console.error('Error inserting Kurmanji lessons:', kurmanjiLessonsError);
    return;
  }

  // Create vocabulary entries
  const vocabIds = Array.from({ length: 25 }, () => generateUUID());
  const vocabularyData = [
    { kurdish: 'سڵاو', persian: 'سلام', english: 'hello' },
    { kurdish: 'بەخەربێت', persian: 'خوش آمد', english: 'welcome' },
    { kurdish: 'سوپاس', persian: 'ممنون', english: 'thank you' },
    { kurdish: 'بەڵێ', persian: 'بله', english: 'yes' },
    { kurdish: 'نەخێر', persian: 'نه', english: 'no' },
    { kurdish: 'تکایە', persian: 'لطفا', english: 'please' },
    { kurdish: 'ببوورە', persian: 'ببخشید', english: 'sorry' },
    { kurdish: 'خێربێت', persian: 'خوب باش', english: 'good' },
    { kurdish: 'خراپ', persian: 'بد', english: 'bad' },
    { kurdish: 'گەورە', persian: 'بزرگ', english: 'big' },
    { kurdish: 'بچوک', persian: 'کوچک', english: 'small' },
    { kurdish: 'نوێ', persian: 'جدید', english: 'new' },
    { kurdish: 'کۆن', persian: 'قدیمی', english: 'old' },
    { kurdish: 'ڕۆژ', persian: 'روز', english: 'day' },
    { kurdish: 'شەو', persian: 'شب', english: 'night' },
    { kurdish: 'بەیانی', persian: 'صبح', english: 'morning' },
    { kurdish: 'ئێوارە', persian: 'عصر', english: 'evening' },
    { kurdish: 'ئاو', persian: 'آب', english: 'water' },
    { kurdish: 'نان', persian: 'نان', english: 'bread' },
    { kurdish: 'ماست', persian: 'ماست', english: 'yogurt' },
    { kurdish: 'چا', persian: 'چای', english: 'tea' },
    { kurdish: 'قاوە', persian: 'قهوه', english: 'coffee' },
    { kurdish: 'ماڵ', persian: 'خانه', english: 'house' },
    { kurdish: 'قوتابخانە', persian: 'مدرسه', english: 'school' },
    { kurdish: 'کار', persian: 'کار', english: 'work' },
  ];

  const { error: vocabularyError } = await supabaseAdmin
    .from('vocabulary')
    .insert(
      vocabularyData.map((word, index) => ({
        id: vocabIds[index],
        kurdish_word: word.kurdish,
        persian_translation: word.persian,
        english_translation: word.english,
        difficulty_level: 'beginner',
      }))
    );

  if (vocabularyError) {
    console.error('Error inserting vocabulary:', vocabularyError);
    return;
  }

  // Link vocabulary to lessons
  const { error: lessonVocabError } = await supabaseAdmin
    .from('lesson_vocabulary')
    .insert([
      { lesson_id: soraniLesson2Id, vocabulary_id: vocabIds[0] },
      { lesson_id: soraniLesson2Id, vocabulary_id: vocabIds[1] },
      { lesson_id: soraniLesson2Id, vocabulary_id: vocabIds[2] },
      { lesson_id: soraniLesson3Id, vocabulary_id: vocabIds[3] },
      { lesson_id: soraniLesson3Id, vocabulary_id: vocabIds[4] },
      { lesson_id: soraniLesson5Id, vocabulary_id: vocabIds[5] },
      { lesson_id: soraniLesson5Id, vocabulary_id: vocabIds[6] },
      { lesson_id: kurmanjiLesson2Id, vocabulary_id: vocabIds[7] },
      { lesson_id: kurmanjiLesson2Id, vocabulary_id: vocabIds[8] },
      { lesson_id: kurmanjiLesson3Id, vocabulary_id: vocabIds[9] },
      { lesson_id: kurmanjiLesson3Id, vocabulary_id: vocabIds[10] },
    ]);

  if (lessonVocabError) {
    console.error('Error inserting lesson vocabulary:', lessonVocabError);
    return;
  }

  // Create grammar topics
  const grammarTopicIds = Array.from({ length: 12 }, () => generateUUID());
  const grammarTopicsData = [
    {
      title: 'Definite Articles',
      description: 'Understanding how to use definite articles in Kurdish',
      difficulty_level: 'beginner',
    },
    {
      title: 'Indefinite Articles',
      description: 'Using indefinite articles for nonspecific nouns',
      difficulty_level: 'beginner',
    },
    {
      title: 'Subject-Verb Agreement',
      description: 'Matching subjects with correct verb forms',
      difficulty_level: 'beginner',
    },
    {
      title: 'Present Tense',
      description: 'Forming sentences in the present tense',
      difficulty_level: 'beginner',
    },
    {
      title: 'Past Tense',
      description: 'Conjugating verbs in the past tense',
      difficulty_level: 'elementary',
    },
    {
      title: 'Future Tense',
      description: 'Expressing future actions and events',
      difficulty_level: 'elementary',
    },
    {
      title: 'Possessive Pronouns',
      description: 'Using my, your, his, her, etc.',
      difficulty_level: 'beginner',
    },
    {
      title: 'Adjective Placement',
      description: 'Where to place adjectives in sentences',
      difficulty_level: 'beginner',
    },
    {
      title: 'Question Formation',
      description: 'How to form questions in Kurdish',
      difficulty_level: 'beginner',
    },
    {
      title: 'Negation',
      description: 'Making sentences negative',
      difficulty_level: 'beginner',
    },
    {
      title: 'Plural Nouns',
      description: 'Forming plurals of nouns',
      difficulty_level: 'elementary',
    },
    {
      title: 'Prepositions',
      description: 'Using in, on, at, to, from, etc.',
      difficulty_level: 'beginner',
    },
  ];

  const { error: grammarTopicsError } = await supabaseAdmin
    .from('grammar_topics')
    .insert(
      grammarTopicsData.map((topic, index) => ({
        id: grammarTopicIds[index],
        title: topic.title,
        description: topic.description,
        difficulty_level: topic.difficulty_level,
      }))
    );

  if (grammarTopicsError) {
    console.error('Error inserting grammar topics:', grammarTopicsError);
    return;
  }

  // Link grammar to lessons
  const { error: lessonGrammarError } = await supabaseAdmin
    .from('lesson_grammar')
    .insert([
      { lesson_id: soraniLesson4Id, grammar_topic_id: grammarTopicIds[0] },
      { lesson_id: soraniLesson4Id, grammar_topic_id: grammarTopicIds[1] },
      { lesson_id: kurmanjiLesson4Id, grammar_topic_id: grammarTopicIds[0] },
      { lesson_id: kurmanjiLesson4Id, grammar_topic_id: grammarTopicIds[1] },
    ]);

  if (lessonGrammarError) {
    console.error('Error inserting lesson grammar:', lessonGrammarError);
    return;
  }

  console.log('Seed completed successfully!');
}

seed().catch(console.error);
