# فرمت فایل‌های داده Kurdamuz

این فایل توضیح می‌دهد که چطور باید فایل‌های JSON داده آموزشی را پُر کنید.

> این سند با schema واقعی پروژه (`src/types/content.ts`) هم‌خوان شده است.
> توجه: فیلد `dialect` داخل خودِ آبجکت‌های JSON قرار **نمی‌گیرد** — گویش از روی پوشهٔ
> `data/<dialect>/` تشخیص داده می‌شود (`src/lib/content/reader.ts`)، نه از یک فیلد داخلی.

---

## words.json — واژگان

آرایه‌ای از آبجکت با فیلدهای زیر:

```json
[
  {
    "id": "sor-w-001",
    "kurdish": "سڵاو",
    "transliteration": "silav",
    "persian": "سلام",
    "english": "Hello",
    "category": "greetings",
    "difficulty": 1,
    "partOfSpeech": "interjection",
    "examples": [
      {
        "sentence": "سڵاو، چۆنیت؟",
        "transliteration": "Silav, çonît?",
        "translation": "سلام، حالت چطور است؟"
      }
    ],
    "audioUrl": null,
    "imageUrl": null,
    "tags": ["everyday", "formal"]
  }
]
```

### فیلدها:
| فیلد | نوع | اجباری | توضیح |
|------|-----|--------|-------|
| id | string | بله | منحصر به فرد، فرمت: `{dialect_code}-w-{شماره}` |
| kurdish | string | بله | کلمه کردی با خط اصلی گویش |
| transliteration | string | بله | تلفظ با حروف لاتین |
| persian | string | بله | ترجمه فارسی |
| english | string | خیر | ترجمه انگلیسی |
| category | string | بله | دسته‌بندی (ببینید لیست پایین) |
| difficulty | 1\|2\|3\|4\|5 | بله | سطح ۱ (مبتدی) تا ۵ (پیشرفته) |
| partOfSpeech | string | خیر | `noun` · `verb` · `adjective` · `adverb` · `interjection` · `pronoun` · `preposition` |
| examples | array | خیر | جملات نمونه — هر کدام `{sentence, transliteration, translation}` |
| audioUrl | string\|null | خیر | مسیر فایل صوتی در `media/` |
| imageUrl | string\|null | خیر | مسیر تصویر در `media/` |
| tags | string[] | خیر | برچسب‌های اضافه |

### دسته‌بندی‌های معتبر (category):
`greetings` · `numbers` · `animals` · `food` · `family` · `body` · `colors` · `time` · `places` · `verbs` · `adjectives` · `nature` · `daily`

---

## phrases.json — جملات و اصطلاحات

```json
[
  {
    "id": "sor-p-001",
    "kurdish": "ناوم ... ە",
    "transliteration": "nawm ... e",
    "persian": "اسمم ... است",
    "english": "My name is ...",
    "category": "greetings",
    "difficulty": 1,
    "type": "statement",
    "context": "informal",
    "response": null,
    "notes": "برای معرفی خود استفاده می‌شود",
    "audioUrl": null,
    "tags": ["introductions"]
  }
]
```

### فیلدها:
| فیلد | نوع | اجباری | توضیح |
|------|-----|--------|-------|
| id | string | بله | فرمت: `{dialect_code}-p-{شماره}` |
| kurdish | string | بله | جمله کردی |
| transliteration | string | بله | تلفظ لاتین |
| persian | string | بله | ترجمه فارسی |
| english | string | خیر | ترجمه انگلیسی |
| category | string | بله | `greetings` · `shopping` · `travel` · `restaurant` · `emergency` · `socializing` · `work` · `family` · `directions` · `idioms` |
| difficulty | 1\|2\|3\|4\|5 | بله | ۱ تا ۵ |
| type | string | خیر | `statement` · `question` · `idiom` · `proverb` · `command` |
| context | string | خیر | `formal` · `informal` · `written` · `spoken` |
| response | object\|null | خیر | پاسخ معمول به این جمله: `{kurdish, transliteration, persian}` |
| notes | string\|null | خیر | توضیح آزاد موقعیت استفاده |
| audioUrl | string\|null | خیر | مسیر فایل صوتی |
| tags | string[] | خیر | برچسب‌های اضافه |

---

## grammar.json — قواعد گرامری

```json
[
  {
    "id": "sor-g-001",
    "title": "ضمایر شخصی",
    "titleEn": "Personal Pronouns",
    "category": "pronouns",
    "difficulty": 1,
    "explanation": {
      "persian": "در سورانی ضمایر شخصی به شکل زیر هستند...",
      "english": "In Sorani, personal pronouns are as follows..."
    },
    "rules": [
      {
        "rule": "من = ئەمن",
        "example": {
          "kurdish": "ئەمن خوێندکارم",
          "transliteration": "Emen xwendkarim",
          "persian": "من دانش‌آموزم"
        }
      }
    ],
    "table": null,
    "exercises": [],
    "tags": []
  }
]
```

### فیلدها:
| فیلد | نوع | اجباری | توضیح |
|------|-----|--------|-------|
| id | string | بله | فرمت: `{dialect_code}-g-{شماره}` |
| title | string | بله | عنوان فارسی |
| titleEn | string | خیر | عنوان انگلیسی |
| category | string | بله | `pronouns` · `verbs` · `nouns` · `adjectives` · `tenses` · `sentence-structure` · `negation` · `questions` · `cases` |
| difficulty | 1\|2\|3\|4\|5 | بله | ۱ تا ۵ |
| explanation | object | بله | `{persian, english?}` |
| rules | array | بله | هر کدام `{rule, example: {kurdish, transliteration, persian}}` |
| table | object\|null | خیر | `{headers: string[], rows: string[][]}` برای جدول صرف/نحو |
| exercises | array | خیر | هر کدام `{question, answer, hint?}` |
| tags | string[] | خیر | برچسب‌های اضافه |

---

## کدهای گویش:
- `sor` = سورانی (Sorani) — خط کردی-عربی، کردی مرکزی
- `kur` = کرمانجی (Kurmanji) — خط لاتین، کردی شمالی
- `bad` = بادینی (Bahdini) — خط کردی-عربی، گویش شمالی عراق نزدیک به کرمانجی
- `kal` = کلهری (Kalhori) — خط کردی-عربی، کردی جنوبی (ایران)
- `lek` = لکی (Leki) — خط کردی-عربی، گویش جنوبی/لرستان
- `haw` = هورامی (Hawrami) — خط کردی-عربی، شاخهٔ گورانی
- `jaf` = جافی (Jafi) — خط کردی-عربی، زیرگویش سورانی (ناحیهٔ جاف)

## نکات مهم:
1. ID ها باید در تمام فایل‌ها **منحصر به فرد** باشند
2. فایل‌های صوتی/تصویری در `media/` همان گویش قرار می‌گیرند (فعلاً اختیاری — هیچ فایل صوتی/تصویری اجباری نیست)
3. difficulty=1 مبتدی مطلق، difficulty=5 پیشرفته
4. هر فایل باید آرایهٔ JSON معتبر باشد؛ اگر فایلی برای یک گویش هنوز خالی است، آرایهٔ خالی `[]` بگذارید نه این‌که فایل را حذف کنید.
