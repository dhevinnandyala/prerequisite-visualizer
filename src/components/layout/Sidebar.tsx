import { useEffect, useRef } from 'react';
import { useUiStore } from '../../stores/uiStore';
import { CourseForm } from '../course/CourseForm';
import { CourseList } from '../course/CourseList';
import { ImportExportPanel } from '../import-export/ImportExportPanel';

export function Sidebar() {
  const open = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar on outside click (mobile)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        window.innerWidth < 1024 &&
        open &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, setSidebarOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" aria-hidden="true" />
      )}
      <aside
        ref={sidebarRef}
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 lg:w-96
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-800
          flex flex-col
          transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:hidden'}
          overflow-hidden
        `}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <CourseForm />
          <ImportExportPanel />
          <CourseList />
        </div>
      </aside>
    </>
  );
}
