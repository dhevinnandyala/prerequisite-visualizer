import React, { useMemo } from 'react';
import { ReactFlow, Background, Controls, Handle, getStraightPath } from '@xyflow/react';
import ELK from 'elkjs/lib/elk.bundled.js';
import '@xyflow/react/dist/style.css';

const nodeWidth = 180;
const nodeHeight = 60;
const elk = new ELK();

// Helper: interpolate between black and light blue
function interpolateColor(level, minLevel, maxLevel) {
  // Black:   rgb(0,0,0)
  // Light blue: rgb(96,165,250) (#60a5fa)
  if (maxLevel === minLevel) return 'rgb(96,165,250)';
  const t = (level - minLevel) / (maxLevel - minLevel);
  const r = Math.round(0   + (96  - 0)   * t);
  const g = Math.round(0   + (165 - 0)   * t);
  const b = Math.round(0   + (250 - 0)   * t);
  return `rgb(${r},${g},${b})`;
}

// Helper: interpolate color using HSL based on level (lightness) and x (hue)
function interpolateHSL(level, minLevel, maxLevel, x, minX, maxX) {
  // Map x to hue (0-360)
  let hue = 200; // fallback blue
  if (maxX !== minX) {
    hue = 360 * (x - minX) / (maxX - minX);
  }
  // Map level to lightness (90% to 40%)
  let lightness = 90;
  if (maxLevel !== minLevel) {
    lightness = 90 - 50 * ((level - minLevel) / (maxLevel - minLevel));
  }
  return `hsl(${hue}, 70%, ${lightness}%)`;
}

// Custom node component with color from data
function BlueNode({ data }) {
  return (
    <div
      style={{
        background: data.color,
        color: 'white',
        borderRadius: 8,
        padding: '16px 12px',
        textAlign: 'center',
        fontWeight: 600,
        fontSize: 16,
        boxShadow: `0 2px 8px ${data.color}22`,
        border: `2px solid ${data.color}`,
        minWidth: 120,
        transition: 'background 0.3s, border 0.3s',
        cursor: 'pointer',
      }}
      onClick={data.onNodeClick}
    >
      {data.label}
      <Handle type="target" position="top" style={{ opacity: 0 }} />
      <Handle type="source" position="bottom" style={{ opacity: 0 }} />
    </div>
  );
}

// Helper to get a point at a given ratio along a polyline
function getPointAtRatio(points, ratio) {
  if (!points || points.length < 2) return points?.[0] || { x: 0, y: 0 };
  let total = 0;
  const segLengths = [];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segLengths.push(len);
    total += len;
  }
  let dist = ratio * total;
  for (let i = 1; i < points.length; i++) {
    if (dist <= segLengths[i - 1]) {
      const t = dist / segLengths[i - 1];
      return {
        x: points[i - 1].x + t * (points[i].x - points[i - 1].x),
        y: points[i - 1].y + t * (points[i].y - points[i - 1].y),
      };
    }
    dist -= segLengths[i - 1];
  }
  return points[points.length - 1];
}

// Custom edge with polyline/curve and arrow halfway through
function ArrowEdge({ id, data, style, sourceX, sourceY, targetX, targetY }) {
  let points = data?.routedPoints;
  // Debug: log the points for this edge
  console.log('ArrowEdge', id, points);
  // Fallback: use source/target if routedPoints are missing or invalid
  if (!points || points.length < 2) {
    points = [
      { x: sourceX, y: sourceY },
      { x: targetX, y: targetY },
    ];
  }
  // Build SVG path (polyline or smooth curve)
  let path = '';
  if (points.length === 2) {
    // straight line
    path = `M${points[0].x},${points[0].y} L${points[1].x},${points[1].y}`;
  } else {
    // smooth curve (Catmull-Rom to Bezier)
    path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      path += ` Q${points[i].x},${points[i].y} ${xc},${yc}`;
    }
    path += ` T${points[points.length - 1].x},${points[points.length - 1].y}`;
  }
  // Arrow at halfway
  const arrowPos = getPointAtRatio(points, 0.5);
  const nextPos = getPointAtRatio(points, 0.51);
  const angle = Math.atan2(nextPos.y - arrowPos.y, nextPos.x - arrowPos.x);
  const arrowLength = 16;
  const arrowWidth = 8;
  const arrowPoints = [
    { x: arrowPos.x, y: arrowPos.y },
    { x: arrowPos.x - arrowLength * Math.cos(angle - Math.PI / 8), y: arrowPos.y - arrowLength * Math.sin(angle - Math.PI / 8) },
    { x: arrowPos.x - arrowLength * Math.cos(angle + Math.PI / 8), y: arrowPos.y - arrowLength * Math.sin(angle + Math.PI / 8) },
  ];
  const edgeColor = data?.color || (style && style.stroke) || '#2563eb';
  return (
    <g>
      <path id={id} style={{ ...style, stroke: edgeColor }} className="react-flow__edge-path" d={path} markerEnd="" fill="none" />
      <polygon
        points={arrowPoints.map(p => `${p.x},${p.y}`).join(' ')}
        fill={edgeColor}
        stroke={edgeColor}
        strokeWidth={1}
      />
    </g>
  );
}

const nodeTypes = { blue: BlueNode };
const edgeTypes = { arrow: ArrowEdge };

function getTopologicalLevels(courses) {
  // Build adjacency and in-degree
  const adj = new Map();
  const inDegree = new Map();
  courses.forEach(course => {
    adj.set(course.id, []);
    inDegree.set(course.id, 0);
  });
  courses.forEach(course => {
    course.course_prerequisites.forEach(prereqId => {
      if (adj.has(prereqId)) adj.get(prereqId).push(course.id);
      inDegree.set(course.id, (inDegree.get(course.id) || 0) + 1);
    });
  });
  // BFS from roots
  const level = new Map();
  const queue = [];
  inDegree.forEach((deg, id) => {
    if (deg === 0) {
      level.set(id, 0);
      queue.push(id);
    }
  });
  while (queue.length > 0) {
    const node = queue.shift();
    const currLevel = level.get(node);
    (adj.get(node) || []).forEach(child => {
      if (!level.has(child) || level.get(child) < currLevel + 1) {
        level.set(child, currLevel + 1);
      }
      inDegree.set(child, inDegree.get(child) - 1);
      if (inDegree.get(child) === 0) {
        queue.push(child);
      }
    });
  }
  return level;
}

async function getLayoutedElementsElk(nodes, edges, direction = 'TB') {
  // ELK layout config
  const elkDirection = direction === 'TB' ? 'DOWN' : 'RIGHT';
  
  // Find nodes with no prerequisites (root nodes)
  const rootNodes = new Set(nodes.map(node => node.id));
  edges.forEach(edge => {
    rootNodes.delete(edge.target);
  });
  
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': elkDirection,
      'elk.layered.spacing.nodeNodeBetweenLayers': '120',
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.edgeNodeBetweenLayers': '40',
      'elk.layered.spacing.edgeEdgeBetweenLayers': '40',
      'elk.layered.nodePlacement.strategy': 'SIMPLE',
      'elk.edgeRouting': 'SPLINES',
      // Force root nodes to be in the first layer
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.layering.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.layering.layerId': '0',
      'elk.layered.layering.layerId.0': Array.from(rootNodes).join(' ')
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: nodeWidth,
      height: nodeHeight,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };
  const layout = await elk.layout(graph);
  // Debug: log the ELK layout output for edges
  console.log('ELK layout.edges', layout.edges);
  // Map node positions
  const nodeMap = new Map();
  layout.children.forEach((n) => {
    nodeMap.set(n.id, n);
  });
  // Map edge routing points
  const edgeMap = new Map();
  (layout.edges || []).forEach((e) => {
    edgeMap.set(e.id, e.sections?.[0]?.points || []);
  });
  return {
    nodes: nodes.map((node) => {
      const n = nodeMap.get(node.id);
      return {
        ...node,
        position: {
          x: n.x,
          y: n.y,
        },
        targetPosition: direction === 'LR' ? 'left' : 'top',
        sourcePosition: direction === 'LR' ? 'right' : 'bottom',
      };
    }),
    edges: edges.map((edge) => ({
      ...edge,
      data: {
        ...edge.data,
        routedPoints: edgeMap.get(edge.id),
      },
    })),
  };
}

function PrerequisiteGraph({ courses, onNodeClick }) {
  // Compute topological levels and layout with ELK
  const [layouted, setLayouted] = React.useState({ nodes: [], edges: [] });
  React.useEffect(() => {
    const levels = getTopologicalLevels(courses);
    const allLevels = Array.from(levels.values());
    const minLevel = Math.min(...allLevels);
    const maxLevel = Math.max(...allLevels);
    const courseMap = new Map(courses.map(c => [c.id, c]));
    
    const nodes = courses.map((course) => ({
      id: course.id,
      data: {
        label: course.course_name,
        color: interpolateColor(levels.get(course.id) ?? 0, minLevel, maxLevel),
        onNodeClick: () => onNodeClick(course.id)
      },
      type: 'blue',
    }));

    // Only create edges for valid prerequisites, no self-loops, no duplicates
    const edgeSet = new Set();
    const edges = courses.flatMap((course) =>
      course.course_prerequisites
        .filter(prereqId => prereqId !== course.id && courseMap.has(prereqId))
        .map(prereqId => {
          const edgeId = `${prereqId}->${course.id}`;
          if (edgeSet.has(edgeId)) return null;
          edgeSet.add(edgeId);
          return {
            id: edgeId,
            source: prereqId,
            target: course.id,
            animated: false,
            style: { stroke: '#2563eb', strokeWidth: 2 },
            type: 'arrow',
            data: {},
          };
        })
        .filter(Boolean)
    );

    getLayoutedElementsElk(nodes, edges, 'TB').then((layoutedResult) => {
      // Group nodes by level
      const levelGroups = new Map();
      layoutedResult.nodes.forEach((node) => {
        const level = levels.get(node.id) ?? 0;
        if (!levelGroups.has(level)) levelGroups.set(level, []);
        levelGroups.get(level).push(node);
      });

      // Compute min/max level for lightness
      const allLevels = Array.from(levelGroups.keys());
      const minLevel = Math.min(...allLevels);
      const maxLevel = Math.max(...allLevels);

      // Assign color per node: lightness by level, hue by index in level (sorted by id for consistency)
      const nodeColorMap = new Map();
      const newNodes = layoutedResult.nodes.map((node) => {
        const level = levels.get(node.id) ?? 0;
        let nodesInLevel = levelGroups.get(level);
        // Sort nodes in this level by course name for consistent color order
        nodesInLevel = [...nodesInLevel].sort((a, b) => 
          courseMap.get(a.id).course_name.localeCompare(courseMap.get(b.id).course_name)
        );
        const idx = nodesInLevel.findIndex(n => n.id === node.id);
        const nInLevel = nodesInLevel.length;
        // Spread hues evenly in [0, 360)
        const hue = nInLevel > 1 ? (360 * idx / nInLevel) : 200;
        // Lightness: 90% (top) to 40% (bottom)
        let lightness = 90;
        if (maxLevel !== minLevel) {
          lightness = 90 - 50 * ((level - minLevel) / (maxLevel - minLevel));
        }
        const color = `hsl(${hue}, 70%, ${lightness}%)`;
        nodeColorMap.set(node.id, color);
        return {
          ...node,
          data: {
            ...node.data,
            color,
          },
        };
      });

      // Update edge color to match the target node's color
      const newEdges = layoutedResult.edges.map((edge) => {
        const targetColor = nodeColorMap.get(edge.target) || '#2563eb';
        return {
          ...edge,
          style: { ...edge.style, stroke: targetColor },
          data: { ...edge.data, color: targetColor },
        };
      });

      setLayouted({
        nodes: newNodes,
        edges: newEdges,
      });
    });
  }, [courses]);

  return (
    <div className="graph-container">
      <h2>Prerequisite Graph</h2>
      <div style={{ flex: 1, width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={layouted.nodes}
          edges={layouted.edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          panOnDrag={true}
          zoomOnScroll={true}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={true}
          onNodeClick={(_, node) => node.data.onNodeClick()}
        >
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default PrerequisiteGraph; 