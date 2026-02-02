import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCourseStore } from '../../stores/courseStore';
import { useUiStore } from '../../stores/uiStore';
import { useGraphLayout } from '../../hooks/useGraphLayout';
import { levelToColor } from '../../lib/graph';
import { CourseNode } from './CourseNode';
import { PrerequisiteEdge } from './PrerequisiteEdge';

const nodeTypes: NodeTypes = { course: CourseNode };
const edgeTypes: EdgeTypes = { prerequisite: PrerequisiteEdge };

function PrerequisiteGraphInner() {
  const courses = useCourseStore((s) => s.courses());
  const showGraph = useUiStore((s) => s.showGraph);
  const setEditingId = useUiStore((s) => s.setEditingCourseId);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const { fitView } = useReactFlow();

  const layout = useGraphLayout(courses);
  const [nodes, setNodes, onNodesChange] = useNodesState(layout.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layout.edges);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
    setDirty(false);
  }, [layout, setNodes, setEdges]);

  const handleNodesChange: typeof onNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      if (changes.some((c) => c.type === 'position' && 'dragging' in c && c.dragging)) {
        setDirty(true);
      }
    },
    [onNodesChange],
  );

  const regenerate = useCallback(() => {
    setNodes(layout.nodes);
    setEdges(layout.edges);
    setDirty(false);
    setTimeout(() => fitView({ padding: 0.2 }), 0);
  }, [layout, setNodes, setEdges, fitView]);

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
      {dirty && (
        <button
          onClick={regenerate}
          className="absolute top-3 right-3 z-10 px-3 py-1.5 text-xs font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 shadow-md transition-colors"
        >
          Regenerate Layout
        </button>
      )}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
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
            return levelToColor(data.level, data.maxLevel, isDark, useUiStore.getState().colorTheme);
          }}
          className="!bg-gray-100 dark:!bg-gray-800 !border-gray-200 dark:!border-gray-700"
        />
      </ReactFlow>
    </div>
  );
}

export function PrerequisiteGraph() {
  return (
    <ReactFlowProvider>
      <PrerequisiteGraphInner />
    </ReactFlowProvider>
  );
}
