import type { Workspace, Course } from '../types/course';

interface ExportData {
  version: 2;
  workspace: {
    name: string;
    courses: Array<{
      id: string;
      name: string;
      prerequisites: string[];
    }>;
  };
}

export function exportWorkspace(workspace: Workspace): string {
  const data: ExportData = {
    version: 2,
    workspace: {
      name: workspace.name,
      courses: workspace.courses.map((c) => ({
        id: c.id,
        name: c.name,
        prerequisites: c.prerequisites,
      })),
    },
  };
  return JSON.stringify(data, null, 2);
}

export function importWorkspace(json: string): { courses: Course[]; name: string } | string {
  try {
    const data = JSON.parse(json) as ExportData;
    if (data.version !== 2 || !data.workspace || !Array.isArray(data.workspace.courses)) {
      return 'Invalid file format. Expected a PrereqTree export file.';
    }

    const courseIds = new Set(data.workspace.courses.map((c) => c.id));
    const courses: Course[] = data.workspace.courses.map((c) => ({
      id: c.id,
      name: c.name,
      prerequisites: c.prerequisites.filter((pid) => courseIds.has(pid)),
      createdAt: Date.now(),
    }));

    return { courses, name: data.workspace.name };
  } catch {
    return 'Failed to parse JSON file. Please check the file format.';
  }
}

export function downloadJson(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
