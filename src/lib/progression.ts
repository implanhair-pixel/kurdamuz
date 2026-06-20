import { supabaseAdmin } from './supabase';

export interface LessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  score?: number;
}

export interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  totalXP: number;
  completionPercentage: number;
}

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  completionPercentage: number = 0,
  score?: number
) {
  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons')
    .select('xp_reward')
    .eq('id', lessonId)
    .single();

  if (lessonError) {
    throw new Error('Failed to fetch lesson');
  }

  const { error: progressError } = await supabaseAdmin
    .from('user_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      status,
      completion_percentage: completionPercentage,
      score,
      completed_at: status === 'completed' ? new Date().toISOString() : null,
    });

  if (progressError) {
    throw new Error('Failed to update progress');
  }

  // Award XP if lesson is completed
  if (status === 'completed' && lesson?.xp_reward) {
    await awardXP(userId, lesson.xp_reward);
  }

  // Check if course is complete
  await checkCourseCompletion(userId, lessonId);
}

export async function awardXP(userId: string, xp: number) {
  // This would update a user_xp table or user metadata
  // For now, we'll use user metadata
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId);
  
  if (user && user.user) {
    const currentXP = user.user.user_metadata?.total_xp || 0;
    const newXP = currentXP + xp;
    
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...user.user.user_metadata,
        total_xp: newXP,
      },
    });
  }
}

export async function checkCourseCompletion(userId: string, lessonId: string) {
  // Get the lesson's course
  const { data: lesson, error: lessonError } = await supabaseAdmin
    .from('lessons')
    .select(`
      course_modules(
        course_id
      )
    `)
    .eq('id', lessonId)
    .single();

  if (lessonError || !lesson) {
    return;
  }

  const courseId = lesson.course_modules[0]?.course_id;
  if (!courseId) {
    return;
  }

  // Get all lessons in the course
  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from('lessons')
    .select('id')
    .eq('course_modules.course_id', courseId);

  if (lessonsError || !lessons) {
    return;
  }

  // Get user's progress for all lessons in the course
  const lessonIds = lessons.map((l: any) => l.id);
  const { data: progress, error: progressError } = await supabaseAdmin
    .from('user_progress')
    .select('lesson_id, status')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  if (progressError) {
    return;
  }

  // Check if all lessons are completed
  const completedCount = progress?.filter((p: any) => p.status === 'completed').length || 0;
  
  if (completedCount === lessons.length) {
    // Award certificate
    await awardCertificate(userId, courseId);
  }
}

export async function awardCertificate(userId: string, courseId: string) {
  // Check if certificate already exists
  const { data: existing } = await supabaseAdmin
    .from('certificates')
    .select('*')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single();

  if (existing) {
    return; // Certificate already exists
  }

  // Create certificate
  const { error } = await supabaseAdmin
    .from('certificates')
    .insert({
      user_id: userId,
      course_id: courseId,
      issued_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error('Failed to award certificate');
  }
}

export async function getUserProgress(userId: string) {
  const { data: progress, error } = await supabaseAdmin
    .from('user_progress')
    .select(`
      *,
      lesson:lessons(
        *,
        module:course_modules(
          *,
          course:courses(*)
        )
      )
    `)
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to fetch user progress');
  }

  return progress;
}

export async function getUserCertificates(userId: string) {
  const { data: certificates, error } = await supabaseAdmin
    .from('certificates')
    .select(`
      *,
      course:courses(*)
    `)
    .eq('user_id', userId);

  if (error) {
    throw new Error('Failed to fetch certificates');
  }

  return certificates;
}

export async function getCourseProgress(userId: string, courseId: string) {
  // Get all lessons in the course
  const { data: lessons, error: lessonsError } = await supabaseAdmin
    .from('lessons')
    .select('id, xp_reward')
    .eq('course_modules.course_id', courseId);

  if (lessonsError || !lessons) {
    return null;
  }

  // Get user's progress for lessons in the course
  const lessonIds = lessons.map((l: any) => l.id);
  const { data: progress, error: progressError } = await supabaseAdmin
    .from('user_progress')
    .select('lesson_id, status, score')
    .eq('user_id', userId)
    .in('lesson_id', lessonIds);

  if (progressError) {
    return null;
  }

  const completedLessons = progress?.filter((p: any) => p.status === 'completed').length || 0;
  const totalXP = progress?.reduce((acc: number, p: any) => {
    const lesson = lessons.find((l: any) => l.id === p.lesson_id);
    return acc + (lesson?.xp_reward || 0);
  }, 0) || 0;

  return {
    courseId,
    totalLessons: lessons.length,
    completedLessons,
    totalXP,
    completionPercentage: (completedLessons / lessons.length) * 100,
  };
}
