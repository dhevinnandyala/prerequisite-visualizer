import { useState } from 'react';
import { useCourseStore } from '../../stores/courseStore';
import { useUiStore } from '../../stores/uiStore';
import { CourseCard } from './CourseCard';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';

export function CourseList() {
  const courses = useCourseStore((s) => s.courses());
  const resetCourses = useCourseStore((s) => s.resetCourses);
  const addToast = useUiStore((s) => s.addToast);
  const [confirmReset, setConfirmReset] = useState(false);

  if (courses.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No courses yet. Add one above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Courses ({courses.length})
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirmReset(true)}
          className="text-red-500 hover:text-red-700"
        >
          Reset All
        </Button>
      </div>

      <div className="space-y-2">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => {
          resetCourses();
          addToast('All courses removed.', 'info');
        }}
        title="Reset All Courses"
        message="Are you sure you want to remove all courses from this workspace? This cannot be undone."
        confirmLabel="Reset"
      />
    </div>
  );
}
