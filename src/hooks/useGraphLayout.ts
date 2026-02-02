import { useMemo } from 'react';
import { layoutGraph } from '../lib/graph';
import type { Course } from '../types/course';

export function useGraphLayout(courses: Course[]) {
  return useMemo(() => layoutGraph(courses), [courses]);
}
