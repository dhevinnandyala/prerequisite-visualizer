import { useState, useEffect, useCallback } from 'react';
import { useCourseStore } from '../../stores/courseStore';
import { useUiStore } from '../../stores/uiStore';
import { validateCourseName, detectCycle } from '../../lib/validation';
import { Button } from '../shared/Button';
import { PrerequisiteInput } from './PrerequisiteInput';

export function CourseForm() {
  const courses = useCourseStore((s) => s.courses());
  const addCourse = useCourseStore((s) => s.addCourse);
  const updateCourse = useCourseStore((s) => s.updateCourse);

  const editingId = useUiStore((s) => s.editingCourseId);
  const setEditingId = useUiStore((s) => s.setEditingCourseId);
  const addToast = useUiStore((s) => s.addToast);
  const setShowGraph = useUiStore((s) => s.setShowGraph);

  const [name, setName] = useState('');
  const [prereqs, setPrereqs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const editingCourse = editingId ? courses.find((c) => c.id === editingId) : null;

  useEffect(() => {
    if (editingCourse) {
      setName(editingCourse.name);
      setPrereqs(editingCourse.prerequisites);
      setError(null);
    }
  }, [editingCourse]);

  const resetForm = useCallback(() => {
    setName('');
    setPrereqs([]);
    setError(null);
    setEditingId(null);
  }, [setEditingId]);

  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();

    const nameError = validateCourseName(name, courses, editingId ?? undefined);
    if (nameError) {
      setError(nameError);
      return;
    }

    if (editingId && detectCycle(courses, editingId, prereqs)) {
      setError('This would create a circular dependency.');
      return;
    }

    if (editingId) {
      updateCourse(editingId, name, prereqs);
      addToast('Course updated.', 'success');
    } else {
      addCourse(name, prereqs);
      addToast('Course added.', 'success');
    }

    resetForm();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-3">
      <div>
        <label
          htmlFor="course-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Course Name
        </label>
        <input
          id="course-name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          placeholder="e.g. Calculus II"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {error && (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>

      <PrerequisiteInput
        courses={courses}
        selected={prereqs}
        onChange={setPrereqs}
        excludeId={editingId ?? undefined}
      />

      <div className="flex gap-2">
        <Button type="submit" size="md">
          {editingId ? 'Update' : 'Add Course'}
        </Button>
        {editingId && (
          <Button type="button" variant="secondary" size="md" onClick={resetForm}>
            Cancel
          </Button>
        )}
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => setShowGraph(true)}
          disabled={courses.length === 0}
        >
          Show Graph
        </Button>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500">
        Tip: Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to submit
      </p>
    </form>
  );
}
