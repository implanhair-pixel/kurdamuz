import { db } from './index';
import { assessmentQuestions, assessmentTests, assessmentSections } from './schema';
import { eq } from 'drizzle-orm';

// Seed data for Phase 10: Placement Test
// 60 questions total (10 per skill domain × 3 proficiency levels)

const questions = [
  // READING - Beginner (3 questions)
  {
    questionType: 'multiple_choice',
    skillDomain: 'reading',
    difficultyLevel: 'beginner',
    content: {
      question: 'خوێندنەوە: "من ناوم ئەڵێ. من لە سلێمانی دەژیم." ئەم دەقە دەڵێت:',
      options: [
        'من ناوم ئەڵێ و لە هەولێر دەژیم',
        'من ناوم ئەڵێ و لە سلێمانی دەژیم',
        'من ناوم ئەڵێ و لە کەرکووک دەژیم',
        'من ناوم ئەڵێ و لە دھۆک دەژیم'
      ],
      persianTranslation: 'خواندن: "من نام علی است. من در سلیمانی زندگی می‌کنم." این متن می‌گوید:'
    },
    correctAnswer: {
      answer: 'من ناوم ئەڵێ و لە سلێمانی دەژیم'
    },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'reading',
    difficultyLevel: 'beginner',
    content: {
      question: 'خوێندنەوە: "ئەمڕۆ باران دەبارێت." ئەم دەقە دەڵێت:',
      options: [
        'ئەمڕۆ خۆر دەخات',
        'ئەمڕۆ باران دەبارێت',
        'ئەمڕۆ بایەخ دەوێت',
        'ئەمڕۆ بەفر دەبارێت'
      ],
      persianTranslation: 'خواندن: "امروز باران می‌بارد." این متن می‌گوید:'
    },
    correctAnswer: { answer: 'ئەمڕۆ باران دەبارێت' },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'true_false',
    skillDomain: 'reading',
    difficultyLevel: 'beginner',
    content: {
      question: 'خوێندنەوە: "کتێب لەسەر مێزە." ئەم دەقە دەڵێت کتێب لەسەر زەوییە.',
      persianTranslation: 'خواندن: "کتاب روی میز است." این متن می‌گوید کتاب روی زمین است.'
    },
    correctAnswer: { answer: false },
    metadata: { points: 1, timeLimit: 20 }
  },
  // READING - Intermediate (4 questions)
  {
    questionType: 'multiple_choice',
    skillDomain: 'reading',
    difficultyLevel: 'intermediate',
    content: {
      question: 'خوێندنەوە: "کوردستان ناوچەیەکی دێرینە کە مێژوویەکی دێرینی هەیە. خەڵکی کوردستان خۆشەویست و میواندۆستن. ئەوان زمانی کوردی قسە دەکەن." سەرەکیترین تێمەی ئەم دەقە:',
      options: [
        'مێژووی کوردستان',
        'خەڵکی کوردستان',
        'زمانی کوردی',
        'هەموو ئەوانە'
      ],
      persianTranslation: 'خواندن: "کردستان منطقه‌ای باستانی است که تاریخ باستانی دارد. مردم کردستان مهربان و مهمان‌نواز هستند. آن‌ها به زبان کردی صحبت می‌کنند." اصلی‌ترین موضوع این متن:'
    },
    correctAnswer: { answer: 'هەموو ئەوانە' },
    metadata: { points: 2, timeLimit: 45 }
  },
  {
    questionType: 'fill_blank',
    skillDomain: 'reading',
    difficultyLevel: 'intermediate',
    content: {
      question: 'خوێندنەوە: "ئەمڕۆ من بۆ _____ رفتم. لەوێدا کتێبم کڕی." وشەی گونجاو:',
      options: ['بازاڕ', 'قوتابخانە', 'نەخۆشخانە', 'پارک'],
      persianTranslation: 'خواندن: "امروز من به _____ رفتم. آنجا کتاب خریدم." کلمه مناسب:'
    },
    correctAnswer: { answer: 'بازاڕ' },
    metadata: { points: 2, timeLimit: 40 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'reading',
    difficultyLevel: 'intermediate',
    content: {
      question: 'خوێندنەوە: "زەوی سەوز و جوانە. گوڵبارانە و باڵندەکان دەگوێنن. ئاسمان شینە." ئەم دەقە باسی دەکات لە:',
      options: ['زستان', 'بەهار', 'هاوین', 'پاییز'],
      persianTranslation: 'خواندن: "زمین سبز و زیباست. گلباران است و پرندگان آواز می‌خوانند. آسمان آبی است." این متن صحبت می‌کند از:'
    },
    correctAnswer: { answer: 'بەهار' },
    metadata: { points: 2, timeLimit: 40 }
  },
  {
    questionType: 'true_false',
    skillDomain: 'reading',
    difficultyLevel: 'intermediate',
    content: {
      question: 'خوێندنەوە: "ئەو کتێبە زۆر جوانە و زانیاری زۆر تێدایە." نووسەر کتێبەکەی ناپەسەند.',
      persianTranslation: 'خواندن: "آن کتاب بسیار زیبا است و اطلاعات زیادی در آن دارد." نویسنده کتاب را نپسندید.'
    },
    correctAnswer: { answer: false },
    metadata: { points: 1, timeLimit: 30 }
  },
  // READING - Advanced (3 questions)
  {
    questionType: 'multiple_choice',
    skillDomain: 'reading',
    difficultyLevel: 'advanced',
    content: {
      question: 'خوێندنەوە: "کۆمەڵگای کوردی کۆمەڵگایەکی کۆنی و دێرینە کە بەڵگەی مێژوویی لە سەدەکان پێشەوە هەیە. ئەم کۆمەڵگایە خۆی لە دۆزینەوەی ناسنامەی خۆیدا سەرکەوتوو بووە سەرەڕای چەندین دوژمنانەوە. زمان و کولتوور کوردی بەشێکی گرنگی میراتی کوردستانە." نووسەر باسی لە دەکات لە:',
      options: [
        'مێژووی کوردستان',
        'ناسنامەی کوردی',
        'میراتی کولتووری کوردی',
        'هەموو ئەوانە'
      ],
      persianTranslation: 'خواندن: "جامعه کردی جامعه‌ای باستانی و قدیمی است که شواهد تاریخی از قرن‌ها پیش دارد. این جامعه در یافتن هویت خود با وجود چندین دشمن موفق بوده است. زبان و فرهنگ کردی بخش مهمی از میراث کردستان است." نویسنده صحبت می‌کند از:'
    },
    correctAnswer: { answer: 'هەموو ئەوانە' },
    metadata: { points: 3, timeLimit: 60 }
  },
  {
    questionType: 'fill_blank',
    skillDomain: 'reading',
    difficultyLevel: 'advanced',
    content: {
      question: 'خوێندنەوە: "ئەگەر بەردەوام بە _____ بوین، دەتوانین بە ئامانجەکانیمان بگەین." وشەی گونجاو:',
      options: ['هەوڵدان', 'وازهێنان', 'بێتاقەتی', 'سەرکەوتن'],
      persianTranslation: 'خواندن: "اگر به _____ ادامه دهیم، می‌توانیم به اهدافمان برسیم." کلمه مناسب:'
    },
    correctAnswer: { answer: 'هەوڵدان' },
    metadata: { points: 3, timeLimit: 50 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'reading',
    difficultyLevel: 'advanced',
    content: {
      question: 'خوێندنەوە: "فەلسەفەی کوردی بەشێکی گرنگی فەلسەفەی جیهانیە. فەیلەسووفانی کورد وەک مەلا بابە و ئیبن سینا بەشدارییان لە پێشکەشکردنی بیرەکانیان بە جیهان کردووە." ئەم دەقە باسی دەکات لە:',
      options: [
        'فەلسەفەی ئیسلامی',
        'فەلسەفەی کوردی',
        'فەلسەفەی یۆنانی',
        'فەلسەفەی ڕۆژاوایی'
      ],
      persianTranslation: 'خواندن: "فلسفه کردی بخش مهمی فلسفه جهانی است. فیلسوفان کرد مانند ملا بابا و ابن سینا در ارائه افکارشان به جهان مشارکت کرده‌اند." این متن صحبت می‌کند از:'
    },
    correctAnswer: { answer: 'فەلسەفەی کوردی' },
    metadata: { points: 3, timeLimit: 50 }
  },

  // WRITING - Beginner (3 questions)
  {
    questionType: 'fill_blank',
    skillDomain: 'writing',
    difficultyLevel: 'beginner',
    content: {
      question: 'تەواوکردن: "من _____ کتێب دەخوێنمەوە."',
      options: ['هەموو ڕۆژێک', 'هەفتەیەک', 'ساڵێک', 'ماوەیەک'],
      persianTranslation: 'تکمیل: "من _____ کتاب می‌خوانم."'
    },
    correctAnswer: { answer: 'هەموو ڕۆژێک' },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'fill_blank',
    skillDomain: 'writing',
    difficultyLevel: 'beginner',
    content: {
      question: 'تەواوکردن: "ئەو _____ جوانە."',
      options: ['گوڵ', 'ڕووخسار', 'بەفر', 'بەیان'],
      persianTranslation: 'تکمیل: "آن _____ زیباست."'
    },
    correctAnswer: { answer: 'گوڵ' },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'writing',
    difficultyLevel: 'beginner',
    content: {
      question: 'کێشەی ڕێنووسین: کامەیان دروستە؟',
      options: [
        'کتێب',
        'کتێب',
        'کتێب',
        'هەموو دروستن'
      ],
      persianTranslation: 'مشکل املا: کدام درست است؟'
    },
    correctAnswer: { answer: 'کتێب' },
    metadata: { points: 1, timeLimit: 20 }
  },
  // WRITING - Intermediate (4 questions)
  {
    questionType: 'fill_blank',
    skillDomain: 'writing',
    difficultyLevel: 'intermediate',
    content: {
      question: 'تەواوکردن: "ئەگەر بەردەوام _____، دەتوانین سەرکەوتوو ببین."',
      options: ['هەوڵ بدەین', 'واز بهێنین', 'بێتاقەت بین', 'بەڵێ'],
      persianTranslation: 'تکمیل: "اگر به _____ ادامه دهیم، می‌توانیم موفق باشیم."'
    },
    correctAnswer: { answer: 'هەوڵ بدەین' },
    metadata: { points: 2, timeLimit: 40 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'writing',
    difficultyLevel: 'intermediate',
    content: {
      question: 'جملەی دروست بنوسە: "من _____ بۆ قوتابخانە رفتم."',
      options: [
        'ئەمڕۆ',
        'دوێنێ',
        'سێ ڕۆژ',
        'هەفتەی ڕابردوو'
      ],
      persianTranslation: 'جمله درست بنویسید: "من _____ به مدرسه رفتم."'
    },
    correctAnswer: { answer: 'ئەمڕۆ' },
    metadata: { points: 2, timeLimit: 35 }
  },
  {
    questionType: 'fill_blank',
    skillDomain: 'writing',
    difficultyLevel: 'intermediate',
    content: {
      question: 'تەواوکردن: "ئەو کتێبە زۆر _____ و زانیاری زۆر تێدایە."',
      options: ['جوان', 'گەورە', 'بچووک', 'نوێ'],
      persianTranslation: 'تکمیل: "آن کتاب بسیار _____ و اطلاعات زیادی در آن دارد."'
    },
    correctAnswer: { answer: 'جوان' },
    metadata: { points: 2, timeLimit: 35 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'writing',
    difficultyLevel: 'intermediate',
    content: {
      question: 'کێشەی ڕێنووسین: کامەیان دروستە؟',
      options: [
        'مێز',
        'مێز',
        'مێز',
        'هەموو دروستن'
      ],
      persianTranslation: 'مشکل املا: کدام درست است؟'
    },
    correctAnswer: { answer: 'مێز' },
    metadata: { points: 1, timeLimit: 25 }
  },
  // WRITING - Advanced (3 questions)
  {
    questionType: 'fill_blank',
    skillDomain: 'writing',
    difficultyLevel: 'advanced',
    content: {
      question: 'تەواوکردن: "کۆمەڵگای کوردی _____ کۆمەڵگایەکی دێرینە کە مێژوویەکی دێرینی هەیە."',
      options: [],
      persianTranslation: 'تکمیل: "جامعه کردی _____ جامعه‌ای باستانی است که تاریخ باستانی دارد."'
    },
    correctAnswer: { answer: 'بەڵێ' },
    metadata: { points: 3, timeLimit: 60 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'writing',
    difficultyLevel: 'advanced',
    content: {
      question: 'جملەی دروست بنوسە: "فەلسەفەی کوردی _____ بەشێکی گرنگی فەلسەفەی جیهانیە."',
      options: [
        'بەڵێ',
        'هەروەها',
        'لەڕاستیدا',
        'بەدڵێ'
      ],
      persianTranslation: 'جمله درست بنویسید: "فلسفه کردی _____ بخش مهمی فلسفه جهانی است."'
    },
    correctAnswer: { answer: 'لەڕاستیدا' },
    metadata: { points: 3, timeLimit: 50 }
  },
  {
    questionType: 'fill_blank',
    skillDomain: 'writing',
    difficultyLevel: 'advanced',
    content: {
      question: 'تەواوکردن: "زمان و کولتوور کوردی _____ بەشێکی گرنگی میراتی کوردستانە."',
      options: [],
      persianTranslation: 'تکمیل: "زبان و فرهنگ کردی _____ بخش مهمی میراث کردستان است."'
    },
    correctAnswer: { answer: 'بەڵێ' },
    metadata: { points: 3, timeLimit: 50 }
  },

  // LISTENING - Beginner (3 questions)
  {
    questionType: 'audio_listening',
    skillDomain: 'listening',
    difficultyLevel: 'beginner',
    content: {
      question: 'گوێگرتن: "من ناوم ئەڵێ." ئەم دەنگە دەڵێت:',
      audioUrl: '/audio/beginner/listening_1.mp3',
      options: [
        'من ناوم ئەڵێ',
        'من ناوم محەممەد',
        'من ناوم ئەحمەد',
        'من ناوم عەلی'
      ],
      persianTranslation: 'گوش دادن: "من نام علی است." این صدا می‌گوید:'
    },
    correctAnswer: { answer: 'من ناوم ئەڵێ' },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'audio_listening',
    skillDomain: 'listening',
    difficultyLevel: 'beginner',
    content: {
      question: 'گوێگرتن: "ئەمڕۆ باران دەبارێت." ئەم دەنگە دەڵێت:',
      audioUrl: '/audio/beginner/listening_2.mp3',
      options: [
        'ئەمڕۆ خۆر دەخات',
        'ئەمڕۆ باران دەبارێت',
        'ئەمڕۆ بایەخ دەوێت',
        'ئەمڕۆ بەفر دەبارێت'
      ],
      persianTranslation: 'گوش دادن: "امروز باران می‌بارد." این صدا می‌گوید:'
    },
    correctAnswer: { answer: 'ئەمڕۆ باران دەبارێت' },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'true_false',
    skillDomain: 'listening',
    difficultyLevel: 'beginner',
    content: {
      question: 'گوێگرتن: "کتێب لەسەر مێزە." ئەم دەنگە دەڵێت کتێب لەسەر زەوییە.',
      audioUrl: '/audio/beginner/listening_3.mp3',
      persianTranslation: 'گوش دادن: "کتاب روی میز است." این صدا می‌گوید کتاب روی زمین است.'
    },
    correctAnswer: { answer: false },
    metadata: { points: 1, timeLimit: 20 }
  },
  // LISTENING - Intermediate (4 questions)
  {
    questionType: 'audio_listening',
    skillDomain: 'listening',
    difficultyLevel: 'intermediate',
    content: {
      question: 'گوێگرتن: "کوردستان ناوچەیەکی دێرینە کە مێژوویەکی دێرینی هەیە." سەرەکیترین تێمەی ئەم دەنگە:',
      audioUrl: '/audio/intermediate/listening_1.mp3',
      options: [
        'مێژووی کوردستان',
        'خەڵکی کوردستان',
        'زمانی کوردی',
        'هەموو ئەوانە'
      ],
      persianTranslation: 'گوش دادن: "کردستان منطقه‌ای باستانی است که تاریخ باستانی دارد." اصلی‌ترین موضوع این صدا:'
    },
    correctAnswer: { answer: 'مێژووی کوردستان' },
    metadata: { points: 2, timeLimit: 45 }
  },
  {
    questionType: 'audio_listening',
    skillDomain: 'listening',
    difficultyLevel: 'intermediate',
    content: {
      question: 'گوێگرتن: "ئەمڕۆ من بۆ بازاڕ رفتم. لەوێدا کتێبم کڕی." نووسەر چی کڕی؟',
      audioUrl: '/audio/intermediate/listening_2.mp3',
      options: ['پێڵاو', 'کتێب', 'جلوبەرگ', 'خواردن'],
      persianTranslation: 'گوش دادن: "امروز من به بازار رفتم. آنجا کتاب خریدم." نویسنده چه خرید؟'
    },
    correctAnswer: { answer: 'کتێب' },
    metadata: { points: 2, timeLimit: 40 }
  },
  {
    questionType: 'audio_listening',
    skillDomain: 'listening',
    difficultyLevel: 'intermediate',
    content: {
      question: 'گوێگرتن: "زەوی سەوز و جوانە. گوڵبارانە و باڵندەکان دەگوێنن." ئەم دەنگە باسی دەکات لە:',
      audioUrl: '/audio/intermediate/listening_3.mp3',
      options: ['زستان', 'بەهار', 'هاوین', 'پاییز'],
      persianTranslation: 'گوش دادن: "زمین سبز و زیباست. گلباران است و پرندگان آواز می‌خوانند." این صدا صحبت می‌کند از:'
    },
    correctAnswer: { answer: 'بەهار' },
    metadata: { points: 2, timeLimit: 40 }
  },
  {
    questionType: 'true_false',
    skillDomain: 'listening',
    difficultyLevel: 'intermediate',
    content: {
      question: 'گوێگرتن: "ئەو کتێبە زۆر جوانە و زانیاری زۆر تێدایە." نووسەر کتێبەکەی ناپەسەند.',
      audioUrl: '/audio/intermediate/listening_4.mp3',
      persianTranslation: 'گوش دادن: "آن کتاب بسیار زیبا است و اطلاعات زیادی در آن دارد." نویسنده کتاب را نپسندید.'
    },
    correctAnswer: { answer: false },
    metadata: { points: 1, timeLimit: 30 }
  },
  // LISTENING - Advanced (3 questions)
  {
    questionType: 'audio_listening',
    skillDomain: 'listening',
    difficultyLevel: 'advanced',
    content: {
      question: 'گوێگرتن: "کۆمەڵگای کوردی کۆمەڵگایەکی کۆنی و دێرینە کە بەڵگەی مێژوویی لە سەدەکان پێشەوە هەیە." نووسەر باسی لە دەکات لە:',
      audioUrl: '/audio/advanced/listening_1.mp3',
      options: [
        'مێژووی کوردستان',
        'ناسنامەی کوردی',
        'میراتی کولتووری کوردی',
        'هەموو ئەوانە'
      ],
      persianTranslation: 'گوش دادن: "جامعه کردی جامعه‌ای باستانی و قدیمی است که شواهد تاریخی از قرن‌ها پیش دارد." نویسنده صحبت می‌کند از:'
    },
    correctAnswer: { answer: 'هەموو ئەوانە' },
    metadata: { points: 3, timeLimit: 60 }
  },
  {
    questionType: 'audio_listening',
    skillDomain: 'listening',
    difficultyLevel: 'advanced',
    content: {
      question: 'گوێگرتن: "فەلسەفەی کوردی بەشێکی گرنگی فەلسەفەی جیهانیە." ئەم دەنگە باسی دەکات لە:',
      audioUrl: '/audio/advanced/listening_2.mp3',
      options: [
        'فەلسەفەی ئیسلامی',
        'فەلسەفەی کوردی',
        'فەلسەفەی یۆنانی',
        'فەلسەفەی ڕۆژاوایی'
      ],
      persianTranslation: 'گوش دادن: "فلسفه کردی بخش مهمی فلسفه جهانی است." این صدا صحبت می‌کند از:'
    },
    correctAnswer: { answer: 'فەلسەفەی کوردی' },
    metadata: { points: 3, timeLimit: 50 }
  },
  {
    questionType: 'true_false',
    skillDomain: 'listening',
    difficultyLevel: 'advanced',
    content: {
      question: 'گوێگرتن: "فەیلەسووفانی کورد وەک مەلا بابە و ئیبن سینا بەشدارییان لە پێشکەشکردنی بیرەکانیان بە جیهان کردووە." ئیبن سینا فەیلەسووفی کوردی نەبوو.',
      audioUrl: '/audio/advanced/listening_3.mp3',
      persianTranslation: 'گوش دادن: "فیلسوفان کرد مانند ملا بابا و ابن سینا در ارائه افکارشان به جهان مشارکت کرده‌اند." ابن سینا فیلسوف کردی نبود.'
    },
    correctAnswer: { answer: false },
    metadata: { points: 2, timeLimit: 40 }
  },

  // SPEAKING - Beginner (3 questions)
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'beginner',
    content: {
      question: 'دەربارین: "من ناوم _____." ناوت بڵێ بە کوردی.',
      prompt: 'Say your name in Kurdish',
      expectedPhrases: ['من ناوم', 'ناوم'],
      persianTranslation: 'گفتار: "من نام _____." نامتان را به کردی بگویید.'
    },
    correctAnswer: { answer: 'من ناوم' },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'beginner',
    content: {
      question: 'دەربارین: "ئەمڕۆ _____." ئەمڕۆ چییە؟',
      prompt: 'Say what day it is today in Kurdish',
      expectedPhrases: ['ئەمڕۆ', 'ڕۆژ'],
      persianTranslation: 'گفتار: "امروز _____." امروز چیست؟'
    },
    correctAnswer: { answer: 'ئەمڕۆ' },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'beginner',
    content: {
      question: 'دەربارین: "سڵاو، چۆنیت؟" سڵاو بڵێ.',
      prompt: 'Say hello in Kurdish',
      expectedPhrases: ['سڵاو', 'بەخێربیت'],
      persianTranslation: 'گفتار: "سلام، چطوری؟" سلام بگویید.'
    },
    correctAnswer: { answer: 'سڵاو' },
    metadata: { points: 1, timeLimit: 20 }
  },
  // SPEAKING - Intermediate (4 questions)
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'intermediate',
    content: {
      question: 'دەربارین: "من بۆ بازاڕ رفتم و کتێبم کڕی." چی کڕی؟',
      prompt: 'Say what you bought in Kurdish',
      expectedPhrases: ['کتێب', 'کڕی'],
      persianTranslation: 'گفتار: "من به بازار رفتم و کتاب خریدم." چه خریدید؟'
    },
    correctAnswer: { answer: 'کتێب' },
    metadata: { points: 2, timeLimit: 40 }
  },
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'intermediate',
    content: {
      question: 'دەربارین: "زەوی سەوز و جوانە." وەسف بکە.',
      prompt: 'Describe the scene in Kurdish',
      expectedPhrases: ['سەوز', 'جوان'],
      persianTranslation: 'گفتار: "زمین سبز و زیباست." توصیف کنید.'
    },
    correctAnswer: { answer: 'سەوز' },
    metadata: { points: 2, timeLimit: 40 }
  },
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'intermediate',
    content: {
      question: 'دەربارین: "ئەمڕۆ باران دەبارێت." ئەمڕۆ چەندە؟',
      prompt: 'Say what the weather is like in Kurdish',
      expectedPhrases: ['باران', 'دەبارێت'],
      persianTranslation: 'گفتار: "امروز باران می‌بارد." امروز چطور است؟'
    },
    correctAnswer: { answer: 'باران' },
    metadata: { points: 2, timeLimit: 35 }
  },
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'intermediate',
    content: {
      question: 'دەربارین: "من کتێب دەخوێنمەوە." چی دەکەیت؟',
      prompt: 'Say what you are doing in Kurdish',
      expectedPhrases: ['دەخوێنمەوە', 'کتێب'],
      persianTranslation: 'گفتار: "من کتاب می‌خوانم." چه می‌کنید؟'
    },
    correctAnswer: { answer: 'دەخوێنمەوە' },
    metadata: { points: 2, timeLimit: 35 }
  },
  // SPEAKING - Advanced (3 questions)
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'advanced',
    content: {
      question: 'دەربارین: "کۆمڵگای کوردی کۆمەڵگایەکی دێرینە." وەسف بکە.',
      prompt: 'Describe Kurdish society in Kurdish',
      expectedPhrases: ['کۆمەڵگای کوردی', 'دێرین'],
      persianTranslation: 'گفتار: "جامعه کردی جامعه‌ای باستانی است." توصیف کنید.'
    },
    correctAnswer: { answer: 'کۆمەڵگای کوردی' },
    metadata: { points: 3, timeLimit: 60 }
  },
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'advanced',
    content: {
      question: 'دەربارین: "فەلسەفەی کوردی بەشێکی گرنگی فەلسەفەی جیهانیە." ڕوونکردنەوە بکە.',
      prompt: 'Explain Kurdish philosophy in Kurdish',
      expectedPhrases: ['فەلسەفەی کوردی', 'گرنگ'],
      persianTranslation: 'گفتار: "فلسفه کردی بخش مهمی فلسفه جهانی است." توضیح دهید.'
    },
    correctAnswer: { answer: 'فەلسەفەی کوردی' },
    metadata: { points: 3, timeLimit: 60 }
  },
  {
    questionType: 'speaking',
    skillDomain: 'speaking',
    difficultyLevel: 'advanced',
    content: {
      question: 'دەربارین: "زمان و کولتوور کوردی بەشێکی گرنگی میراتی کوردستانە." بۆچی؟',
      prompt: 'Explain why Kurdish language and culture are important in Kurdish',
      expectedPhrases: ['زمان', 'کولتوور', 'میرات'],
      persianTranslation: 'گفتار: "زبان و فرهنگ کردی بخش مهمی میراث کردستان است." چرا؟'
    },
    correctAnswer: { answer: 'زمان' },
    metadata: { points: 3, timeLimit: 50 }
  },

  // GRAMMAR - Beginner (3 questions)
  {
    questionType: 'multiple_choice',
    skillDomain: 'grammar',
    difficultyLevel: 'beginner',
    content: {
      question: 'ڕێزمان: کامەیان دروستە؟ "من _____ کتێب دەخوێنمەوە."',
      options: ['هەموو ڕۆژێک', 'هەفتەیەک', 'ساڵێک', 'ماوەیەک'],
      persianTranslation: 'دستور زبان: کدام درست است؟ "من _____ کتاب می‌خوانم."'
    },
    correctAnswer: { answer: 'هەموو ڕۆژێک' },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'grammar',
    difficultyLevel: 'beginner',
    content: {
      question: 'ڕێزمان: کامەیان دروستە؟ "ئەو _____ جوانە."',
      options: ['گوڵ', 'ڕووخسار', 'بەفر', 'بەیان'],
      persianTranslation: 'دستور زبان: کدام درست است؟ "آن _____ زیباست."'
    },
    correctAnswer: { answer: 'گوڵ' },
    metadata: { points: 1, timeLimit: 30 }
  },
  {
    questionType: 'true_false',
    skillDomain: 'grammar',
    difficultyLevel: 'beginner',
    content: {
      question: 'ڕێزمان: "من رفتم بۆ بازاڕ." ئەم جملەیە دروستە.',
      persianTranslation: 'دستور زبان: "من رفتم به بازار." این جمله درست است.'
    },
    correctAnswer: { answer: true },
    metadata: { points: 1, timeLimit: 20 }
  },
  // GRAMMAR - Intermediate (4 questions)
  {
    questionType: 'multiple_choice',
    skillDomain: 'grammar',
    difficultyLevel: 'intermediate',
    content: {
      question: 'ڕێزمان: کامەیان دروستە؟ "ئەگەر بەردەوام _____، دەتوانین سەرکەوتوو ببین."',
      options: ['هەوڵ بدەین', 'واز بهێنین', 'بێتاقەت بین', 'بەڵێ'],
      persianTranslation: 'دستور زبان: کدام درست است؟ "اگر به _____ ادامه دهیم، می‌توانیم موفق باشیم."'
    },
    correctAnswer: { answer: 'هەوڵ بدەین' },
    metadata: { points: 2, timeLimit: 40 }
  },
  {
    questionType: 'fill_blank',
    skillDomain: 'grammar',
    difficultyLevel: 'intermediate',
    content: {
      question: 'ڕێزمان: "ئەمڕۆ من _____ بۆ قوتابخانە رفتم."',
      options: ['ئەمڕۆ', 'دوێنێ', 'سێ ڕۆژ', 'هەفتەی ڕابردوو'],
      persianTranslation: 'دستور زبان: "امروز من _____ به مدرسه رفتم."'
    },
    correctAnswer: { answer: 'ئەمڕۆ' },
    metadata: { points: 2, timeLimit: 35 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'grammar',
    difficultyLevel: 'intermediate',
    content: {
      question: 'ڕێزمان: کامەیان دروستە؟ "ئەو کتێبە زۆر _____ و زانیاری زۆر تێدایە."',
      options: ['جوان', 'گەورە', 'بچووک', 'نوێ'],
      persianTranslation: 'دستور زبان: کدام درست است؟ "آن کتاب بسیار _____ و اطلاعات زیادی در آن دارد."'
    },
    correctAnswer: { answer: 'جوان' },
    metadata: { points: 2, timeLimit: 35 }
  },
  {
    questionType: 'true_false',
    skillDomain: 'grammar',
    difficultyLevel: 'intermediate',
    content: {
      question: 'ڕێزمان: "من کتێب دەخوێنمەوە ئێستا." ئەم جملەیە دروستە.',
      persianTranslation: 'دستور زبان: "من کتاب می‌خوانم الان." این جمله درست است.'
    },
    correctAnswer: { answer: true },
    metadata: { points: 1, timeLimit: 25 }
  },
  // GRAMMAR - Advanced (3 questions)
  {
    questionType: 'multiple_choice',
    skillDomain: 'grammar',
    difficultyLevel: 'advanced',
    content: {
      question: 'ڕێزمان: کامەیان دروستە؟ "کۆمەڵگای کوردی _____ کۆمەڵگایەکی دێرینە."',
      options: ['بەڵێ', 'هەروەها', 'لەڕاستیدا', 'بەدڵێ'],
      persianTranslation: 'دستور زبان: کدام درست است؟ "جامعه کردی _____ جامعه‌ای باستانی است."'
    },
    correctAnswer: { answer: 'لەڕاستیدا' },
    metadata: { points: 3, timeLimit: 50 }
  },
  {
    questionType: 'fill_blank',
    skillDomain: 'grammar',
    difficultyLevel: 'advanced',
    content: {
      question: 'ڕێزمان: "فەلسەفەی کوردی _____ بەشێکی گرنگی فەلسەفەی جیهانیە."',
      options: ['بەڵێ', 'هەروەها', 'لەڕاستیدا', 'بەدڵێ'],
      persianTranslation: 'دستور زبان: "فلسفه کردی _____ بخش مهمی فلسفه جهانی است."'
    },
    correctAnswer: { answer: 'لەڕاستیدا' },
    metadata: { points: 3, timeLimit: 50 }
  },
  {
    questionType: 'true_false',
    skillDomain: 'grammar',
    difficultyLevel: 'advanced',
    content: {
      question: 'ڕێزمان: "زمان و کولتوور کوردی بەشێکی گرنگی میراتی کوردستانە." ئەم جملەیە نادروستە.',
      persianTranslation: 'دستور زبان: "زبان و فرهنگ کردی بخش مهمی میراث کردستان است." این جمله نادرست است.'
    },
    correctAnswer: { answer: false },
    metadata: { points: 2, timeLimit: 30 }
  },

  // VOCABULARY - Beginner (3 questions)
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'beginner',
    content: {
      question: 'وشە: "کتێب" بە فارسی دەبێت:',
      options: ['کتاب', 'قلم', 'کاغذ', 'میز'],
      persianTranslation: 'واژه: "کتێب" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'کتاب' },
    metadata: { points: 1, timeLimit: 20 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'beginner',
    content: {
      question: 'وشە: "مێز" بە فارسی دەبێت:',
      options: ['میز', 'صندلی', 'در', 'دیوار'],
      persianTranslation: 'واژه: "مێز" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'میز' },
    metadata: { points: 1, timeLimit: 20 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'beginner',
    content: {
      question: 'وشە: "گوڵ" بە فارسی دەبێت:',
      options: ['گل', 'برگ', 'درخت', 'چمن'],
      persianTranslation: 'واژه: "گوڵ" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'گل' },
    metadata: { points: 1, timeLimit: 20 }
  },
  // VOCABULARY - Intermediate (4 questions)
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'intermediate',
    content: {
      question: 'وشە: "کۆمەڵگا" بە فارسی دەبێت:',
      options: ['جامعه', 'خانواده', 'دوست', 'همسایه'],
      persianTranslation: 'واژه: "کۆمەڵگا" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'جامعه' },
    metadata: { points: 2, timeLimit: 25 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'intermediate',
    content: {
      question: 'وشە: "مێژوو" بە فارسی دەبێت:',
      options: ['تاریخ', 'جغرافیا', 'ریاضیات', 'فیزیک'],
      persianTranslation: 'واژه: "مێژوو" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'تاریخ' },
    metadata: { points: 2, timeLimit: 25 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'intermediate',
    content: {
      question: 'وشە: "کولتوور" بە فارسی دەبێت:',
      options: ['فرهنگ', 'زبان', 'دین', 'سیاست'],
      persianTranslation: 'واژه: "کولتوور" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'فرهنگ' },
    metadata: { points: 2, timeLimit: 25 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'intermediate',
    content: {
      question: 'وشە: "ناسنامە" بە فارسی دەبێت:',
      options: ['هویت', 'نام', 'خانواده', 'ملیت'],
      persianTranslation: 'واژه: "ناسنامە" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'هویت' },
    metadata: { points: 2, timeLimit: 25 }
  },
  // VOCABULARY - Advanced (3 questions)
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'advanced',
    content: {
      question: 'وشە: "فەلسەفە" بە فارسی دەبێت:',
      options: ['فلسفه', 'علم', 'هنر', 'ادبیات'],
      persianTranslation: 'واژه: "فەلسەفە" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'فلسفه' },
    metadata: { points: 3, timeLimit: 30 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'advanced',
    content: {
      question: 'وشە: "میرات" بە فارسی دەبێت:',
      options: ['میراث', 'دارایی', 'ملک', 'سرمایه'],
      persianTranslation: 'واژه: "میرات" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'میراث' },
    metadata: { points: 3, timeLimit: 30 }
  },
  {
    questionType: 'multiple_choice',
    skillDomain: 'vocabulary',
    difficultyLevel: 'advanced',
    content: {
      question: 'وشە: "دێرین" بە فارسی دەبێت:',
      options: ['باستانی', 'جدید', 'مدرن', 'آینده'],
      persianTranslation: 'واژه: "دێرین" به فارسی می‌شود:'
    },
    correctAnswer: { answer: 'باستانی' },
    metadata: { points: 3, timeLimit: 30 }
  }
];

async function seedPlacementTest() {
  console.log('Seeding placement test data...');

  try {
    // Check if test already exists
    const existingTest = await db.select().from(assessmentTests).where(eq(assessmentTests.name, 'KurdAmuz Placement Test'));
    
    let testId;
    if (existingTest.length === 0) {
      // Create placement test
      const [test] = await db.insert(assessmentTests).values({
        name: 'KurdAmuz Placement Test',
        description: 'Comprehensive placement test for Kurdish language proficiency evaluation',
        assessmentType: 'placement',
        status: 'active'
      }).returning();
      testId = test.id;
      console.log('Created placement test:', test.name);
    } else {
      testId = existingTest[0].id;
      console.log('Using existing placement test:', existingTest[0].name);
    }

    // Create sections for each skill domain
    const skillDomains = ['reading', 'writing', 'listening', 'speaking', 'grammar', 'vocabulary'];
    const sectionIds: Record<string, string> = {};

    for (const domain of skillDomains) {
      const existingSection = await db.select().from(assessmentSections).where(
        eq(assessmentSections.testId, testId)
      );
      
      const domainSection = existingSection.find(s => s.skillDomain === domain);
      
      if (!domainSection) {
        const [section] = await (db.insert(assessmentSections) as any).values({
          testId,
          skillDomain: domain,
          weight: 1.0,
          questionCount: 10
        }).returning();
        sectionIds[domain] = section.id;
        console.log(`Created section for ${domain}`);
      } else {
        sectionIds[domain] = domainSection.id;
      }
    }

    // Insert questions
    for (const question of questions) {
      await db.insert(assessmentQuestions).values({
        questionType: question.questionType,
        skillDomain: question.skillDomain,
        difficultyLevel: question.difficultyLevel,
        content: question.content,
        correctAnswer: question.correctAnswer,
        metadata: question.metadata,
        status: 'active',
        version: 1
      });
    }

    console.log(`Seeded ${questions.length} questions`);
    console.log('Placement test seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding placement test:', error);
    throw error;
  }
}

// Run the seed
seedPlacementTest().catch(console.error);
