import { db } from '@/db';
import { dialects } from '@/db/schema';

async function seedDialects() {
  console.log('Seeding dialects...');

  const dialectData = [
    {
      name: 'Central Kurdish (Sorani)',
      code: 'ckb',
      description: 'Central Kurdish, also known as Sorani, is one of the two main dialects of the Kurdish language. It is primarily spoken in Iraqi Kurdistan and parts of Iranian Kurdistan.',
      region: 'Iraq, Iran',
      status: 'active',
    },
    {
      name: 'Northern Kurdish (Kurmanji)',
      code: 'kmr',
      description: 'Northern Kurdish, also known as Kurmanji, is the most widely spoken Kurdish dialect. It is primarily spoken in Turkey, Syria, and parts of Iraqi Kurdistan.',
      region: 'Turkey, Syria, Iraq',
      status: 'active',
    },
    {
      name: 'Southern Kurdish',
      code: 'sdh',
      description: 'Southern Kurdish is spoken in the Kermanshah and Ilam provinces of Iran, as well as in parts of Iraqi Kurdistan.',
      region: 'Iran, Iraq',
      status: 'active',
    },
    {
      name: 'Hawrami',
      code: 'hac',
      description: 'Hawrami is a Kurdish dialect spoken in the Hawraman region, spanning parts of Iran and Iraq. It is considered one of the most archaic Kurdish dialects.',
      region: 'Iran, Iraq',
      status: 'active',
    },
    {
      name: 'Zazaki',
      code: 'zza',
      description: 'Zazaki, also known as Zaza, is a Northwestern Iranian language spoken in eastern Turkey. While debated by linguists, it is often considered a Kurdish dialect.',
      region: 'Turkey',
      status: 'active',
    },
    {
      name: 'Standardized Educational Kurdish',
      code: 'sek',
      description: 'A standardized form of Kurdish developed for educational purposes, incorporating elements from various dialects to create a unified learning standard.',
      region: 'Educational',
      status: 'experimental',
    },
  ];

  try {
    // Check if dialects already exist
    const existingDialects = await db.select().from(dialects);
    
    if (existingDialects.length > 0) {
      console.log('Dialects already seeded, skipping...');
      return;
    }

    // Insert dialects
    await db.insert(dialects).values(dialectData as any);
    
    console.log('Successfully seeded dialects!');
  } catch (error) {
    console.error('Error seeding dialects:', error);
    throw error;
  }
}

// Run the seed function
seedDialects()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
