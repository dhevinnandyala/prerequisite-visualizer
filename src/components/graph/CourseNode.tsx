import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { CourseNodeData } from '../../types/graph';
import { levelToColor } from '../../lib/graph';

export function CourseNode({ data }: NodeProps) {
  const nodeData = data as unknown as CourseNodeData;
  const isDark = document.documentElement.classList.contains('dark');
  const bgColor = levelToColor(nodeData.level, nodeData.maxLevel, isDark);

  return (
    <div
      className="rounded-lg px-4 py-2 shadow-md text-white text-sm font-medium text-center min-w-[140px] cursor-pointer border border-white/20"
      style={{ backgroundColor: bgColor }}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/50 !w-2 !h-2" />
      <span className="truncate block">{nodeData.label}</span>
      <Handle type="source" position={Position.Bottom} className="!bg-white/50 !w-2 !h-2" />
    </div>
  );
}
