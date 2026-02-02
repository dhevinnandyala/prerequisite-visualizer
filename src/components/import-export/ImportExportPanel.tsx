import { useRef, useState, useCallback } from 'react';
import { useCourseStore } from '../../stores/courseStore';
import { useUiStore } from '../../stores/uiStore';
import { exportWorkspace, importWorkspace, downloadJson, readFile } from '../../lib/import-export';
import { Button } from '../shared/Button';

export function ImportExportPanel() {
  const activeWorkspace = useCourseStore((s) => s.activeWorkspace());
  const importCourses = useCourseStore((s) => s.importCourses);
  const addToast = useUiStore((s) => s.addToast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleExport() {
    const json = exportWorkspace(activeWorkspace);
    const filename = `${activeWorkspace.name.replace(/[^a-zA-Z0-9]/g, '_')}_courses.json`;
    downloadJson(json, filename);
    addToast('Exported successfully.', 'success');
  }

  const handleImport = useCallback(async (file: File) => {
    try {
      const content = await readFile(file);
      const result = importWorkspace(content);
      if (typeof result === 'string') {
        addToast(result, 'error');
        return;
      }
      importCourses(result.courses, result.name);
      addToast(`Imported ${result.courses.length} courses into "${result.name}".`, 'success');
    } catch {
      addToast('Failed to import file.', 'error');
    }
  }, [importCourses, addToast]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImport(file);
  }

  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Import / Export</h2>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={handleExport}>
          Export JSON
        </Button>
        <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
          Import JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImport(file);
            e.target.value = '';
          }}
        />
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-3 text-center text-xs transition-colors ${
          dragOver
            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500'
        }`}
      >
        Drop a JSON file here to import
      </div>
    </div>
  );
}
