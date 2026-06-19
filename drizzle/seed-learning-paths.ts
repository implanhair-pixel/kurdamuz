import { db } from '@/db';
import { learningPrograms, learningPaths } from '@/db/schema';
import { createLearningProgramSchema, createLearningPathSchema } from '@/lib/validations/learning-paths';

/**
 * Seed initial learning programs and paths
 * Programs: Kurdish in 30 Days, Travel, Conversation, Migration, Business
 */
export async function seedLearningPaths() {
  console.log('Seeding learning paths...');

  // Create programs
  const programs = [
    {
      name: 'Kurdish in 30 Days',
      slug: 'kurdish-in-30-days',
      description: 'A comprehensive beginner program to learn Kurdish in 30 days',
      programType: 'beginner' as const,
      difficultyLevel: 'beginner' as const,
      status: 'active' as const,
    },
    {
      name: 'Travel Kurdish',
      slug: 'travel-kurdish',
      description: 'Essential Kurdish phrases and vocabulary for travelers',
      programType: 'specialized' as const,
      difficultyLevel: 'beginner' as const,
      status: 'active' as const,
    },
    {
      name: 'Kurdish Conversation',
      slug: 'kurdish-conversation',
      description: 'Improve your Kurdish conversation skills with practical dialogues',
      programType: 'intermediate' as const,
      difficultyLevel: 'intermediate' as const,
      status: 'active' as const,
    },
    {
      name: 'Migration Kurdish',
      slug: 'migration-kurdish',
      description: 'Kurdish language skills for migrants and expatriates',
      programType: 'specialized' as const,
      difficultyLevel: 'intermediate' as const,
      status: 'active' as const,
    },
    {
      name: 'Business Kurdish',
      slug: 'business-kurdish',
      description: 'Professional Kurdish language skills for business contexts',
      programType: 'advanced' as const,
      difficultyLevel: 'advanced' as const,
      status: 'active' as const,
    },
  ];

  const createdPrograms = [];
  for (const program of programs) {
    const validated = createLearningProgramSchema.parse(program);
    const [created] = await db.insert(learningPrograms).values(validated).returning();
    createdPrograms.push(created);
    console.log(`Created program: ${program.name}`);
  }

  // Create paths for each program
  const paths = [];

  // Kurdish in 30 Days - 3 paths (Beginner, Intermediate, Advanced)
  paths.push(
    {
      programId: createdPrograms[0].id,
      name: 'Beginner Course',
      slug: 'kurdish-in-30-days-beginner',
      description: 'Foundation course for absolute beginners',
      estimatedDuration: 600, // 10 hours
      difficultyLevel: 'beginner' as const,
      active: true,
    },
    {
      programId: createdPrograms[0].id,
      name: 'Intermediate Course',
      slug: 'kurdish-in-30-days-intermediate',
      description: 'Build on your foundation with intermediate concepts',
      estimatedDuration: 900, // 15 hours
      difficultyLevel: 'intermediate' as const,
      active: true,
    },
    {
      programId: createdPrograms[0].id,
      name: 'Advanced Course',
      slug: 'kurdish-in-30-days-advanced',
      description: 'Master advanced Kurdish language skills',
      estimatedDuration: 1200, // 20 hours
      difficultyLevel: 'advanced' as const,
      active: true,
    }
  );

  // Travel Kurdish - 1 path
  paths.push({
    programId: createdPrograms[1].id,
    name: 'Travel Essentials',
    slug: 'travel-kurdish-essentials',
    description: 'Essential phrases for travelers',
    estimatedDuration: 300, // 5 hours
    difficultyLevel: 'beginner' as const,
    active: true,
  });

  // Kurdish Conversation - 2 paths
  paths.push(
    {
      programId: createdPrograms[2].id,
      name: 'Daily Conversations',
      slug: 'kurdish-conversation-daily',
      description: 'Everyday conversation topics',
      estimatedDuration: 600, // 10 hours
      difficultyLevel: 'intermediate' as const,
      active: true,
    },
    {
      programId: createdPrograms[2].id,
      name: 'Advanced Dialogues',
      slug: 'kurdish-conversation-advanced',
      description: 'Complex conversation scenarios',
      estimatedDuration: 900, // 15 hours
      difficultyLevel: 'advanced' as const,
      active: true,
    }
  );

  // Migration Kurdish - 2 paths
  paths.push(
    {
      programId: createdPrograms[3].id,
      name: 'Settling In',
      slug: 'migration-kurdish-settling',
      description: 'Language skills for new residents',
      estimatedDuration: 600, // 10 hours
      difficultyLevel: 'intermediate' as const,
      active: true,
    },
    {
      programId: createdPrograms[3].id,
      name: 'Integration',
      slug: 'migration-kurdish-integration',
      description: 'Advanced language for full integration',
      estimatedDuration: 900, // 15 hours
      difficultyLevel: 'advanced' as const,
      active: true,
    }
  );

  // Business Kurdish - 2 paths
  paths.push(
    {
      programId: createdPrograms[4].id,
      name: 'Business Basics',
      slug: 'business-kurdish-basics',
      description: 'Fundamental business Kurdish',
      estimatedDuration: 600, // 10 hours
      difficultyLevel: 'intermediate' as const,
      active: true,
    },
    {
      programId: createdPrograms[4].id,
      name: 'Professional Communication',
      slug: 'business-kurdish-professional',
      description: 'Advanced business communication',
      estimatedDuration: 900, // 15 hours
      difficultyLevel: 'advanced' as const,
      active: true,
    }
  );

  for (const path of paths) {
    const validated = createLearningPathSchema.parse(path);
    const [created] = await db.insert(learningPaths).values(validated).returning();
    console.log(`Created path: ${path.name}`);
  }

  console.log('Learning paths seeding completed!');
}

// Run seed if executed directly
if (require.main === module) {
  seedLearningPaths()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error seeding learning paths:', error);
      process.exit(1);
    });
}
