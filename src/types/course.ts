export interface Course {
  id: string;
  name: string;
  prerequisites: string[]; // course IDs
  createdAt: number;
}

export interface Workspace {
  id: string;
  name: string;
  courses: Course[];
  createdAt: number;
  updatedAt: number;
}

export interface AppData {
  version: 2;
  activeWorkspaceId: string;
  workspaces: Workspace[];
}

export interface LegacyCourse {
  id: string;
  course_name: string;
  course_prerequisites: string[];
}
