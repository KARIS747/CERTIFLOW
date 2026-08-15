import React, { useEffect } from 'react';
import { useUIStore } from './store/useUIStore';
import { useProjectStore } from './store/useProjectStore';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './features/dashboard/DashboardView';
import { ProjectsView } from './features/projects/ProjectsView';
import { ImportView } from './features/import/ImportView';
import { StudioCanvasEditor } from './features/editor/StudioCanvasEditor';
import { TemplatesView } from './features/templates/TemplatesView';
import { SettingsView } from './features/settings/SettingsView';
import { OnboardingModal } from './features/onboarding/OnboardingModal';
import { Toaster } from 'sonner';

export const App: React.FC = () => {
  const { activeTab, isOnboardingCompleted, setShowOnboardingModal, theme } = useUIStore();
  const { projects, loadDemoProject } = useProjectStore();

  // Apply theme class to <html> element
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('dark', 'light');
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      html.classList.add(theme);
    }
  }, [theme]);

  useEffect(() => {
    if (!isOnboardingCompleted) {
      setShowOnboardingModal(true);
    }
    if (projects.length === 0) {
      loadDemoProject();
    }
  }, []);

  const isLight = theme === 'light' || (theme === 'system' && !window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`min-h-screen font-sans flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300 ${
      isLight
        ? 'bg-slate-100 text-slate-900'
        : 'bg-slate-950 text-slate-100'
    }`}>
      {/* Top Fixed Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-12">
        {activeTab === 'home'      && <DashboardView />}
        {activeTab === 'projects'  && <ProjectsView />}
        {activeTab === 'import'    && <ImportView />}
        {activeTab === 'editor'    && <StudioCanvasEditor />}
        {activeTab === 'templates' && <TemplatesView />}
        {activeTab === 'settings'  && <SettingsView />}
      </main>

      {/* Onboarding Dialog */}
      <OnboardingModal />

      {/* Notifications */}
      <Toaster
        position="bottom-right"
        theme={isLight ? 'light' : 'dark'}
        richColors
        closeButton
      />
    </div>
  );
};

export default App;
