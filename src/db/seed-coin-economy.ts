import { db } from '@/db';
import { coinEconomyPolicies } from '@/db/schema';

export async function seedCoinEconomyPolicies() {
  console.log('Seeding coin economy policies...');

  const policies = [
    {
      eventType: 'daily_login' as const,
      coinReward: 10,
      xpReward: 10,
      isActive: true,
    },
    {
      eventType: 'lesson_completion' as const,
      coinReward: 25,
      xpReward: 50,
      isActive: true,
    },
    {
      eventType: 'quiz_completion' as const,
      coinReward: 20,
      xpReward: 40,
      isActive: true,
    },
    {
      eventType: 'vocabulary_session' as const,
      coinReward: 15,
      xpReward: 30,
      isActive: true,
    },
    {
      eventType: 'streak_milestone' as const,
      coinReward: 50,
      xpReward: 100,
      isActive: true,
    },
    {
      eventType: 'mission_completion' as const,
      coinReward: 50, // Default, can be overridden per mission
      xpReward: 100, // Default, can be overridden per mission
      isActive: true,
    },
  ];

  for (const policy of policies) {
    await db.insert(coinEconomyPolicies).values(policy).onConflictDoNothing();
  }

  console.log('Coin economy policies seeded successfully!');
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedCoinEconomyPolicies()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error seeding coin economy policies:', error);
      process.exit(1);
    });
}
