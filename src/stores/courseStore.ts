import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Course, Workspace, AppData } from '../types/course';
import { generateId } from '../lib/id';
import { loadLegacyData, clearLegacyData, createDefaultWorkspace, createDefaultAppData } from '../lib/storage';

interface CourseStore {
  data: AppData;

  // Workspace selectors
  activeWorkspace: () => Workspace;
  courses: () => Course[];

  // Workspace actions
  createWorkspace: (name: string) => void;
  renameWorkspace: (id: string, name: string) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string) => void;

  // Course actions
  addCourse: (name: string, prerequisites: string[]) => void;
  updateCourse: (id: string, name: string, prerequisites: string[]) => void;
  deleteCourse: (id: string) => void;
  resetCourses: () => void;
  importCourses: (courses: Course[], workspaceName?: string) => void;

  // Legacy migration
  migrateLegacyData: () => void;
}

function updateActiveWorkspace(
  data: AppData,
  updater: (ws: Workspace) => Workspace,
): AppData {
  return {
    ...data,
    workspaces: data.workspaces.map((ws) =>
      ws.id === data.activeWorkspaceId
        ? { ...updater(ws), updatedAt: Date.now() }
        : ws,
    ),
  };
}

export const useCourseStore = create<CourseStore>()(
  persist(
    (set, get) => ({
      data: createDefaultAppData(),

      activeWorkspace: () => {
        const { data } = get();
        return data.workspaces.find((ws) => ws.id === data.activeWorkspaceId) ?? data.workspaces[0];
      },

      courses: () => get().activeWorkspace().courses,

      createWorkspace: (name) =>
        set((state) => {
          const ws = createDefaultWorkspace();
          ws.name = name;
          return {
            data: {
              ...state.data,
              activeWorkspaceId: ws.id,
              workspaces: [...state.data.workspaces, ws],
            },
          };
        }),

      renameWorkspace: (id, name) =>
        set((state) => ({
          data: {
            ...state.data,
            workspaces: state.data.workspaces.map((ws) =>
              ws.id === id ? { ...ws, name, updatedAt: Date.now() } : ws,
            ),
          },
        })),

      deleteWorkspace: (id) =>
        set((state) => {
          if (state.data.workspaces.length <= 1) return state;
          const remaining = state.data.workspaces.filter((ws) => ws.id !== id);
          return {
            data: {
              ...state.data,
              activeWorkspaceId:
                state.data.activeWorkspaceId === id
                  ? remaining[0].id
                  : state.data.activeWorkspaceId,
              workspaces: remaining,
            },
          };
        }),

      setActiveWorkspace: (id) =>
        set((state) => ({ data: { ...state.data, activeWorkspaceId: id } })),

      addCourse: (name, prerequisites) =>
        set((state) => ({
          data: updateActiveWorkspace(state.data, (ws) => ({
            ...ws,
            courses: [
              ...ws.courses,
              {
                id: generateId(),
                name: name.trim(),
                prerequisites,
                createdAt: Date.now(),
              },
            ],
          })),
        })),

      updateCourse: (id, name, prerequisites) =>
        set((state) => ({
          data: updateActiveWorkspace(state.data, (ws) => ({
            ...ws,
            courses: ws.courses.map((c) =>
              c.id === id
                ? { ...c, name: name.trim(), prerequisites }
                : c,
            ),
          })),
        })),

      deleteCourse: (id) =>
        set((state) => ({
          data: updateActiveWorkspace(state.data, (ws) => ({
            ...ws,
            courses: ws.courses
              .filter((c) => c.id !== id)
              .map((c) => ({
                ...c,
                prerequisites: c.prerequisites.filter((pid) => pid !== id),
              })),
          })),
        })),

      resetCourses: () =>
        set((state) => ({
          data: updateActiveWorkspace(state.data, (ws) => ({
            ...ws,
            courses: [],
          })),
        })),

      importCourses: (courses, workspaceName) =>
        set((state) => {
          if (workspaceName) {
            const ws = createDefaultWorkspace(courses);
            ws.name = workspaceName;
            return {
              data: {
                ...state.data,
                activeWorkspaceId: ws.id,
                workspaces: [...state.data.workspaces, ws],
              },
            };
          }
          return {
            data: updateActiveWorkspace(state.data, (ws) => ({
              ...ws,
              courses,
            })),
          };
        }),

      migrateLegacyData: () => {
        const legacy = loadLegacyData();
        if (!legacy || legacy.length === 0) return;
        const { data } = get();
        // Only migrate if the store is fresh (single empty workspace)
        if (
          data.workspaces.length === 1 &&
          data.workspaces[0].courses.length === 0
        ) {
          set((state) => ({
            data: updateActiveWorkspace(state.data, (ws) => ({
              ...ws,
              name: 'Default',
              courses: legacy,
            })),
          }));
          clearLegacyData();
        }
      },
    }),
    {
      name: 'prereq-visualizer',
    },
  ),
);
