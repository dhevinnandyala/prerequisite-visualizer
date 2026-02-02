import { useState } from 'react';
import type { Course } from '../../types/course';
import { useCourseStore } from '../../stores/courseStore';
import { useUiStore } from '../../stores/uiStore';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const courses = useCourseStore((s) => s.courses());
  const deleteCourse = useCourseStore((s) => s.deleteCourse);
  const setEditingId = useUiStore((s) => s.setEditingCourseId);
  const addToast = useUiStore((s) => s.addToast);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const prereqNames = course.prerequisites
    .map((pid) => courses.find((c) => c.id === pid)?.name)
    .filter(Boolean);

  return (
    <>
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800/50 hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {course.name}
            </h3>
            {prereqNames.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Requires: {prereqNames.join(', ')}
              </p>
            )}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingId(course.id)}
              aria-label={`Edit ${course.name}`}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              aria-label={`Delete ${course.name}`}
              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteCourse(course.id);
          addToast(`Deleted "${course.name}".`, 'info');
        }}
        title="Delete Course"
        message={`Are you sure you want to delete "${course.name}"? This will also remove it as a prerequisite from other courses.`}
        confirmLabel="Delete"
      />
    </>
  );
}
