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
          <main className="flex-1 overflow-y-auto w-full pb-20 md:pb-0 relative custom-scrollbar">
            <div className="absolute top-6 end-6 md:top-10 md:end-10 z-50">
              <LanguageSwitcher />
            </div>
            <div className="max-w-[1600px] mx-auto p-6 md:p-10 lg:p-16 xl:p-20 pt-20 md:pt-16">
              <Outlet />
            </div>
          </main>
        </>
      )}
    </div>
  );
}
