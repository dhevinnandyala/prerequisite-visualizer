import { useState } from 'react';
import { useCourseStore } from '../../stores/courseStore';
import { WorkspaceManager } from './WorkspaceManager';

export function WorkspaceSelector() {
  const data = useCourseStore((s) => s.data);
  const setActiveWorkspace = useCourseStore((s) => s.setActiveWorkspace);
  const [managerOpen, setManagerOpen] = useState(false);

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={data.activeWorkspaceId}
        onChange={(e) => setActiveWorkspace(e.target.value)}
        className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        aria-label="Select workspace"
      >
        {data.workspaces.map((ws) => (
          <option key={ws.id} value={ws.id}>
            {ws.name}
          </option>
        ))}
      </select>
      <button
        onClick={() => setManagerOpen(true)}
        className="p-1 rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs"
        aria-label="Manage workspaces"
        title="Manage workspaces"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      <WorkspaceManager open={managerOpen} onClose={() => setManagerOpen(false)} />
    </div>
  );
}
