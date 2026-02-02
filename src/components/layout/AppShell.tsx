import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { PrerequisiteGraph } from '../graph/PrerequisiteGraph';
import { useUiStore } from '../../stores/uiStore';

export function AppShell() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);

  return (
    <div className="flex flex-col h-dvh">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && <Sidebar />}
        <main className="flex-1 relative">
          <PrerequisiteGraph />
        </main>
      </div>
    </div>
  );
}
