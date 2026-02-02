import type { Node, Edge } from '@xyflow/react';

export interface CourseNodeData {
  label: string;
  level: number;
  maxLevel: number;
  courseId: string;
  [key: string]: unknown;
}

export type CourseNode = Node<CourseNodeData, 'course'>;
export type PrerequisiteEdge = Edge;

export interface LayoutResult {
  nodes: CourseNode[];
  edges: PrerequisiteEdge[];
}
