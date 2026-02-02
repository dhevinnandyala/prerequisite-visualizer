import Dagre from '@dagrejs/dagre';
import type { Course } from '../types/course';
import type { CourseNode, PrerequisiteEdge, LayoutResult } from '../types/graph';

const NODE_WIDTH = 180;
const NODE_HEIGHT = 50;

export function computeTopologicalLevels(courses: Course[]): Map<string, number> {
  const courseMap = new Map(courses.map((c) => [c.id, c]));
  const levels = new Map<string, number>();
  const visited = new Set<string>();

  function dfs(id: string): number {
    if (levels.has(id)) return levels.get(id)!;
    if (visited.has(id)) return 0; // cycle guard
    visited.add(id);
    const course = courseMap.get(id);
    if (!course || course.prerequisites.length === 0) {
      levels.set(id, 0);
      return 0;
    }
    const maxPrereqLevel = Math.max(
      ...course.prerequisites
        .filter((pid) => courseMap.has(pid))
        .map(dfs),
      -1,
    );
    const level = maxPrereqLevel + 1;
    levels.set(id, level);
    return level;
  }

  courses.forEach((c) => dfs(c.id));
  return levels;
}

export function layoutGraph(courses: Course[]): LayoutResult {
  if (courses.length === 0) return { nodes: [], edges: [] };

  const levels = computeTopologicalLevels(courses);
  const maxLevel = Math.max(...levels.values(), 0);

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80 });

  courses.forEach((course) => {
    g.setNode(course.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  const edges: PrerequisiteEdge[] = [];
  courses.forEach((course) => {
    course.prerequisites.forEach((prereqId) => {
      if (courses.some((c) => c.id === prereqId)) {
        g.setEdge(prereqId, course.id);
        edges.push({
          id: `${prereqId}->${course.id}`,
          source: prereqId,
          target: course.id,
          type: 'prerequisite',
          animated: false,
        });
      }
    });
  });

  Dagre.layout(g);

  const nodes: CourseNode[] = courses.map((course) => {
    const pos = g.node(course.id);
    return {
      id: course.id,
      type: 'course',
      position: {
        x: pos.x - NODE_WIDTH / 2,
        y: pos.y - NODE_HEIGHT / 2,
      },
      data: {
        label: course.name,
        level: levels.get(course.id) ?? 0,
        maxLevel,
        courseId: course.id,
      },
    };
  });

  return { nodes, edges };
}

export function levelToColor(level: number, maxLevel: number, dark: boolean): string {
  if (maxLevel === 0) {
    return dark ? 'hsl(210, 70%, 45%)' : 'hsl(210, 80%, 55%)';
  }
  const t = level / maxLevel;
  const hue = 210 + t * 120; // blue -> green
  const sat = dark ? 65 : 75;
  const light = dark ? 40 : 50;
  return `hsl(${hue}, ${sat}%, ${light}%)`;
}
