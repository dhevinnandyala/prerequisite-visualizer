import { useState, useRef, useEffect, useCallback } from 'react';
import { useCourseStore } from '../../stores/courseStore';
import { useUiStore } from '../../stores/uiStore';
import { ConfirmDialog } from '../shared/ConfirmDialog';

export function WorkspaceSelector() {
  const data = useCourseStore((s) => s.data);
  const setActiveWorkspace = useCourseStore((s) => s.setActiveWorkspace);
  const createWorkspace = useCourseStore((s) => s.createWorkspace);
  const renameWorkspace = useCourseStore((s) => s.renameWorkspace);
  const deleteWorkspace = useCourseStore((s) => s.deleteWorkspace);
  const addToast = useUiStore((s) => s.addToast);

  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setRenamingId(null);
  }, []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, close]);

  const activeWorkspace = data.workspaces.find((ws) => ws.id === data.activeWorkspaceId);

  function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    createWorkspace(trimmed);
    setNewName('');
    addToast(`Workspace "${trimmed}" created.`, 'success');
  }

  function handleRename(id: string) {
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    renameWorkspace(id, trimmed);
    setRenamingId(null);
    addToast('Workspace renamed.', 'success');
  }

  return (
    <>
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="
            inline-flex items-center gap-1.5 px-2.5 py-1.5
            text-sm font-medium rounded-lg
            bg-gray-100 hover:bg-gray-200
            dark:bg-gray-800 dark:hover:bg-gray-700
            text-gray-700 dark:text-gray-300
            border border-gray-200 dark:border-gray-700
            transition-colors
            focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
          "
          aria-label="Workspace"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>{activeWorkspace?.name ?? 'Workspace'}</span>
          <svg
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="
              absolute right-0 mt-1.5 z-50
              min-w-[240px] py-1
              bg-white dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              rounded-xl shadow-lg
              ring-1 ring-black/5 dark:ring-white/5
            "
            role="listbox"
            aria-label="Workspace"
          >
            {data.workspaces.map((ws) => {
              const isActive = ws.id === data.activeWorkspaceId;
              const isRenaming = renamingId === ws.id;

              if (isRenaming) {
                return (
                  <div key={ws.id} className="px-2 py-1.5 flex gap-1.5">
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === 'Enter') handleRename(ws.id);
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRename(ws.id);
                      }}
                      className="px-2 py-1 text-xs font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 transition-colors"
                    >
                      Save
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={ws.id}
                  className={`
                    group flex items-center gap-1 px-3 py-2 text-sm
                    ${isActive
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }
                  `}
                >
                  <button
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveWorkspace(ws.id);
                      close();
                    }}
                    className="flex-1 text-left flex items-center gap-2"
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                      {ws.courses.length}
                    </span>
                  </button>
                  {isActive && (
                    <svg className="w-4 h-4 text-primary-600 dark:text-primary-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <div className="shrink-0 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setRenamingId(ws.id);
                        setRenameValue(ws.name);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                      aria-label={`Rename ${ws.name}`}
                      title="Rename"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingId(ws.id);
                      }}
                      disabled={data.workspaces.length <= 1}
                      className="p-1 rounded text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label={`Delete ${ws.name}`}
                      title="Delete"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}

            <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

            <div className="px-2 py-1.5 flex gap-1.5">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') handleCreate();
                }}
                onMouseDown={(e) => e.stopPropagation()}
                placeholder="New workspace..."
                className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreate();
                }}
                disabled={!newName.trim()}
                className="px-2 py-1 text-xs font-medium rounded-md bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            deleteWorkspace(deletingId);
            addToast('Workspace deleted.', 'info');
            setDeletingId(null);
          }
        }}
        title="Delete Workspace"
        message="Are you sure you want to delete this workspace and all its courses?"
        confirmLabel="Delete"
      />
    </>
  );
}
