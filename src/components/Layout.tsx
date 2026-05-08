import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { FarmSelectionOverlay } from './FarmSelectionOverlay';
import { useStore } from '../store';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Layout() {
  const { selectedFarmId } = useStore();

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-earth-50">
      <FarmSelectionOverlay />
      {selectedFarmId && (
        <>
          <Sidebar />
          <main className="flex-1 overflow-y-auto w-full pb-20 md:pb-0 relative">
            <div className="absolute top-4 end-4 md:top-8 md:end-8 z-50">
              <LanguageSwitcher />
            </div>
            <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12 pt-16 md:pt-12">
              <Outlet />
            </div>
          </main>
        </>
      )}
    </div>
  );
}
