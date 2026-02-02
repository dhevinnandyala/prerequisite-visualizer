import type { AppData, LegacyCourse, Course, Workspace } from '../types/course';
import { generateId } from './id';

const STORAGE_KEY = 'prereq-visualizer';
const LEGACY_KEY = 'courses';

export function loadAppData(): AppData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as AppData;
    if (data.version === 2 && Array.isArray(data.workspaces)) {
      return data;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save app data:', e);
  }
}

export function loadLegacyData(): Course[] | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;
    const legacy = JSON.parse(raw) as LegacyCourse[];
    if (!Array.isArray(legacy)) return null;
    return legacy.map((lc) => ({
      id: lc.id,
      name: lc.course_name,
      prerequisites: lc.course_prerequisites ?? [],
      createdAt: Date.now(),
    }));
  } catch {
    return null;
  }
}

export function clearLegacyData(): void {
  localStorage.removeItem(LEGACY_KEY);
}

export function createDefaultWorkspace(courses: Course[] = []): Workspace {
  const now = Date.now();
  return {
    id: generateId(),
    name: 'Default',
    courses,
    createdAt: now,
    updatedAt: now,
  };
}

export function createDefaultAppData(): AppData {
  const workspace = createDefaultWorkspace();
  return {
    version: 2,
    activeWorkspaceId: workspace.id,
    workspaces: [workspace],
  };
}
