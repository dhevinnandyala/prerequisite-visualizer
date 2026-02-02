import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';

export function PrerequisiteEdge(props: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  });

  return (
    <BaseEdge
      id={props.id}
      path={edgePath}
      style={{
        stroke: 'var(--edge-color, #94a3b8)',
        strokeWidth: 2,
      }}
      markerEnd="url(#arrow)"
    />
  );
}
