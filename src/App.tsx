import { useEffect } from 'react';
import { useTheme } from './hooks/useTheme';
import { useCourseStore } from './stores/courseStore';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { ToastContainer } from './components/shared/Toast';

export default function App() {
  useTheme();

  useEffect(() => {
    useCourseStore.getState().migrateLegacyData();
  }, []);

  return (
    <ErrorBoundary>
      <AppShell />
      <ToastContainer />
    </ErrorBoundary>
  );
}
