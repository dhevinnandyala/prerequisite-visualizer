import { useState } from 'react';
import { useCourseStore } from '../../stores/courseStore';
import { useUiStore } from '../../stores/uiStore';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { ConfirmDialog } from '../shared/ConfirmDialog';

interface WorkspaceManagerProps {
  open: boolean;
  onClose: () => void;
}

export function WorkspaceManager({ open, onClose }: WorkspaceManagerProps) {
  const data = useCourseStore((s) => s.data);
  const createWorkspace = useCourseStore((s) => s.createWorkspace);
  const renameWorkspace = useCourseStore((s) => s.renameWorkspace);
  const deleteWorkspace = useCourseStore((s) => s.deleteWorkspace);
  const addToast = useUiStore((s) => s.addToast);

  const [newName, setNewName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      <Modal open={open} onClose={onClose} title="Manage Workspaces">
        <div className="space-y-3">
          {/* Create new */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="New workspace name..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
              Add
            </Button>
          </div>

          {/* Workspace list */}
          <ul className="space-y-2">
            {data.workspaces.map((ws) => (
              <li
                key={ws.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700"
              >
                {renamingId === ws.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(ws.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                    onBlur={() => setRenamingId(null)}
                    className="flex-1 px-2 py-0.5 text-sm border rounded bg-white dark:bg-gray-700 dark:text-gray-100"
                  />
                ) : (
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">
                    {ws.name}
                    <span className="text-xs text-gray-400 ml-1">
                      ({ws.courses.length} courses)
                    </span>
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRenamingId(ws.id);
                    setRenameValue(ws.name);
                  }}
                >
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeletingId(ws.id)}
                  disabled={data.workspaces.length <= 1}
                  className="text-red-500"
                >
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      <ConfirmDialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={() => {
          if (deletingId) {
            deleteWorkspace(deletingId);
            addToast('Workspace deleted.', 'info');
          }
        }}
        title="Delete Workspace"
        message="Are you sure you want to delete this workspace and all its courses?"
        confirmLabel="Delete"
      />
    </>
  );
}
