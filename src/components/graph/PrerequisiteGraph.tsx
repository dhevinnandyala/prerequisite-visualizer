import { useCallback, useEffect, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCourseStore } from '../../stores/courseStore';
import { useUiStore } from '../../stores/uiStore';
import { useGraphLayout } from '../../hooks/useGraphLayout';
import { CourseNode } from './CourseNode';
import { PrerequisiteEdge } from './PrerequisiteEdge';

const nodeTypes: NodeTypes = { course: CourseNode };
const edgeTypes: EdgeTypes = { prerequisite: PrerequisiteEdge };

export function PrerequisiteGraph() {
  const courses = useCourseStore((s) => s.courses());
  const showGraph = useUiStore((s) => s.showGraph);
  const setEditingId = useUiStore((s) => s.setEditingCourseId);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  const layout = useGraphLayout(courses);
  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [layout, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: { id: string }) => {
      setEditingId(node.id);
      setSidebarOpen(true);
    },
    [setEditingId, setSidebarOpen],
  );

  const isDark = document.documentElement.classList.contains('dark');

  const arrowMarker = useMemo(
    () => (
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={isDark ? '#94a3b8' : '#64748b'} />
          </marker>
        </defs>
      </svg>
    ),
    [isDark],
  );

  if (!showGraph && courses.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
        <div className="text-center">
          <p className="text-lg font-medium">No courses to display</p>
          <p className="text-sm mt-1">Add courses in the sidebar to see the prerequisite graph.</p>
        </div>
      </div>
    );
  }

  if (!showGraph) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-600">
        <div className="text-center">
          <p className="text-lg font-medium">Graph hidden</p>
          <p className="text-sm mt-1">Click "Show Graph" in the sidebar to visualize prerequisites.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ ['--edge-color' as string]: isDark ? '#94a3b8' : '#64748b' }}>
      {arrowMarker}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color={isDark ? '#374151' : '#e5e7eb'}
          gap={20}
        />
        <Controls
          className="!bg-white dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700 !shadow-md [&>button]:!bg-white dark:[&>button]:!bg-gray-800 [&>button]:!border-gray-200 dark:[&>button]:!border-gray-700 [&>button]:!text-gray-600 dark:[&>button]:!text-gray-300"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as unknown as { level: number; maxLevel: number };
            return `hsl(${210 + (data.level / Math.max(data.maxLevel, 1)) * 120}, 70%, 50%)`;
          }}
          className="!bg-gray-100 dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700"
        />
      </ReactFlow>
    </div>
  );
}
