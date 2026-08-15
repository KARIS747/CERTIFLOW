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
  const { activeTab, isOnboardingCompleted, setShowOnboardingModal } = useUIStore();
  const { projects, loadDemoProject } = useProjectStore();

  useEffect(() => {
    // Show onboarding on initial launch if not completed
    if (!isOnboardingCompleted) {
      setShowOnboardingModal(true);
    }
    // Auto load demo project if empty
    if (projects.length === 0) {
      loadDemoProject();
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Fixed Header */}
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'home' && <DashboardView />}
        {activeTab === 'projects' && <ProjectsView />}
        {activeTab === 'import' && <ImportView />}
        {activeTab === 'editor' && <StudioCanvasEditor />}
        {activeTab === 'templates' && <TemplatesView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Onboarding Dialog */}
      <OnboardingModal />

      {/* Rich Notifications Toaster */}
      <Toaster position="bottom-right" theme="dark" richColors closeButton />
    </div>
  );
};

export default App;
