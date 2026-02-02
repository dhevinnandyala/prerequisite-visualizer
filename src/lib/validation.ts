import type { Course } from '../types/course';

export function validateCourseName(
  name: string,
  courses: Course[],
  excludeId?: string,
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Course name is required.';
  if (trimmed.length > 100) return 'Course name must be 100 characters or fewer.';
  const duplicate = courses.find(
    (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== excludeId,
  );
  if (duplicate) return `A course named "${duplicate.name}" already exists.`;
  return null;
}

export function detectCycle(
  courses: Course[],
  courseId: string,
  prerequisiteIds: string[],
): boolean {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const visited = new Set<string>();

  function dfs(id: string): boolean {
    if (id === courseId) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    const course = courseMap.get(id);
    if (!course) return false;
    return course.prerequisites.some(dfs);
  }

  return prerequisiteIds.some(dfs);
}
