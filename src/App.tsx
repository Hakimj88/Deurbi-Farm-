import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Farms } from './pages/Farms';
import { CropCycles } from './pages/CropCycles';
import { CropCycleDetails } from './pages/CropCycleDetails';
import { Tasks } from './pages/Tasks';
import { CropLibrary } from './pages/CropLibrary';
import { PestLog } from './pages/PestLog';
import { FertilizerLogList } from './pages/FertilizerLog';
import { HarvestLog } from './pages/HarvestLog';
import { Finance } from './pages/Finance';
import { Inventory } from './pages/Inventory';
import { MarketInsights } from './pages/MarketInsights';
import { SoilAndNutrition } from './pages/SoilAndNutrition';
import { Irrigation } from './pages/Irrigation';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="farms" element={<Farms />} />
        <Route path="cycles" element={<CropCycles />} />
        <Route path="cycles/:id" element={<CropCycleDetails />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="market" element={<MarketInsights />} />
        <Route path="soil" element={<SoilAndNutrition />} />
        <Route path="irrigation" element={<Irrigation />} />
        <Route path="scouting" element={<PestLog />} />
        <Route path="fertilizer" element={<FertilizerLogList />} />
        <Route path="harvest" element={<HarvestLog />} />
        <Route path="finance" element={<Finance />} />
        <Route path="library" element={<CropLibrary />} />
        <Route path="*" element={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-earth-900 mb-2">Coming Soon</h2>
              <p className="text-earth-500">This module is under development for Phase 2.</p>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
}
