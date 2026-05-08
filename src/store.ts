import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Farmer, Farm, CropCycle, Task, ScoutingRecord, FertilizerLog, PestControlLog, HarvestRecord, FinancialRecord, SoilTest, FertilizerSchedule, InventoryItem, SoilRecord, IrrigationRecord, MarketData } from './types';
import { format, addDays } from 'date-fns';

interface AppState {
  farmer: Farmer | null;
  farms: Farm[];
  cropCycles: CropCycle[];
  tasks: Task[];
  scoutingRecords: ScoutingRecord[];
  fertilizerLogs: FertilizerLog[];
  pestControlLogs: PestControlLog[];
  harvestRecords: HarvestRecord[];
  financialRecords: FinancialRecord[];
  soilTests: SoilTest[];
  fertilizerSchedules: FertilizerSchedule[];
  inventory: InventoryItem[];
  soilRecords: SoilRecord[];
  irrigationRecords: IrrigationRecord[];
  marketBenchmarks: MarketData[];
  selectedFarmId: string | null;
  
  setFarmer: (farmer: Farmer) => void;
  setSelectedFarmId: (id: string | null) => void;
  addFarm: (farm: Farm) => void;
  addCropCycle: (cycle: CropCycle) => void;
  addTask: (task: Task) => void;
  addTasks: (tasks: Task[]) => void;
  completeTask: (taskId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  addScoutingRecord: (record: ScoutingRecord) => void;
  addFertilizerLog: (log: FertilizerLog) => void;
  addPestControlLog: (log: PestControlLog) => void;
  addHarvestRecord: (record: HarvestRecord) => void;
  addFinancialRecord: (record: FinancialRecord) => void;
  addSoilTest: (test: SoilTest) => void;
  addChecklistItem: (taskId: string, label: string) => void;
  addFertilizerSchedule: (schedule: FertilizerSchedule) => void;
  removeFertilizerSchedule: (scheduleId: string) => void;
  markFertilizerScheduleAsApplied: (scheduleId: string, logId: string) => void;
  addInventoryItem: (item: InventoryItem) => void;
  updateInventoryQuantity: (itemId: string, quantity: number) => void;
  removeInventoryItem: (itemId: string) => void;
  addSoilRecord: (record: SoilRecord) => void;
  addIrrigationRecord: (record: IrrigationRecord) => void;
  setMarketBenchmarks: (data: MarketData[]) => void;
}

const today = new Date();
const todayStr = format(today, 'yyyy-MM-dd');
const in3Days = format(addDays(today, 3), 'yyyy-MM-dd');
const past7Days = format(addDays(today, -7), 'yyyy-MM-dd');

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      farmer: {
        id: 'f1',
        name: 'Sheikh Jah',
        phone: '+220 700 0000',
        region: 'North Bank Region',
        village: 'Kerewan',
        language: 'Mandinka',
        createdAt: todayStr
      },
      farms: [
        {
          id: 'farm1',
          farmerId: 'f1',
          name: 'Kerewan Main Plot',
          area: 2.5,
          areaUnit: 'ha',
          soilType: 'sandy',
          agroZone: 'Sudan Savanna',
          waterSource: 'Rain-fed',
          latitude: 13.4898,
          longitude: -16.0894
        }
      ],
      cropCycles: [
        {
          id: 'cc1',
          farmId: 'farm1',
          cropId: 'c1', // Maize
          variety: 'Oba Super 6 (Hybrid)',
          area: 1.5,
          plantingDate: past7Days,
          season: 'Wet Season',
          purpose: 'Commercial',
          status: 'active',
          currentStage: 'Vegetative'
        },
        {
          id: 'cc2',
          farmId: 'farm1',
          cropId: 'c2', // Cowpea
          variety: 'Local',
          area: 1.0,
          plantingDate: todayStr,
          season: 'Wet Season',
          purpose: 'Subsistence',
          status: 'planned',
          currentStage: 'Nursery'
        }
      ],
      tasks: [
        {
          id: 't1',
          cropCycleId: 'cc1',
          taskType: 'First Weeding',
          dueDate: in3Days,
          status: 'pending',
          checklist: [
            { id: 't1-1', label: 'Clear weeds between rows', completed: false },
            { id: 't1-2', label: 'Check for stem borers in whorls', completed: false },
            { id: 't1-3', label: 'Remove striga weeds if any', completed: false }
          ]
        },
        {
          id: 't2',
          cropCycleId: 'cc1',
          taskType: 'Basal Fertilizer Application (NPK)',
          dueDate: past7Days,
          status: 'completed',
          cost: 2500,
          checklist: [
            { id: 't2-1', label: 'Purchase 2 bags of NPK', completed: true },
            { id: 't2-2', label: 'Dig banding holes 5cm from plants', completed: true },
            { id: 't2-3', label: 'Apply 1 teaspoon per plant', completed: true }
          ]
        },
        {
          id: 't3',
          cropCycleId: 'cc2',
          taskType: 'Planting (Cowpea)',
          dueDate: todayStr,
          status: 'pending',
          checklist: [
            { id: 't3-1', label: 'Prepare planting holes', completed: false },
            { id: 't3-2', label: 'Treat seeds if needed', completed: false },
            { id: 't3-3', label: 'Sow 2 seeds per hole', completed: false }
          ]
        }
      ],
      scoutingRecords: [],
      fertilizerLogs: [
        {
          id: 'fl1',
          cropCycleId: 'cc1',
          date: past7Days,
          product: 'NPK 15-15-15',
          rate: '2 bags',
          method: 'Banding',
          cost: 2500
        }
      ],
      pestControlLogs: [],
      harvestRecords: [],
      financialRecords: [
        {
          id: 'fr1',
          cropCycleId: 'cc1',
          category: 'input',
          item: 'NPK 15-15-15',
          quantity: 2,
          unitCost: 1250,
          totalCost: 2500,
          date: past7Days
        }
      ],
      soilTests: [
        {
          id: 'st1',
          cropCycleId: 'cc1',
          date: past7Days,
          nitrogen: 'low',
          phosphorus: 'medium',
          potassium: 'medium',
          ph: 6.2,
          organicMatter: 2.1,
          notes: 'Standard pre-planting soil test'
        }
      ],
      fertilizerSchedules: [
        {
          id: 'fs1',
          cropCycleId: 'cc1',
          plannedDate: format(addDays(today, 10), 'yyyy-MM-dd'),
          stage: 'Vegetative (V6)',
          product: 'Urea',
          dosage: '1 bag per ha',
          method: 'Top-dressing',
          status: 'planned'
        }
      ],
      inventory: [
        { 
          id: 'i1', name: 'NPK 15-15-15', category: 'fertilizer', 
          quantity: 15, unit: 'bags', unitPrice: 1250, 
          subUnit: 'kg', subUnitsPerPackage: 50,
          minThreshold: 5, lastUpdated: todayStr 
        },
        { 
          id: 'i2', name: 'Urea', category: 'fertilizer', 
          quantity: 8, unit: 'bags', unitPrice: 1100, 
          subUnit: 'kg', subUnitsPerPackage: 50,
          minThreshold: 3, lastUpdated: todayStr 
        },
        { 
          id: 'i3', name: 'Maize Seeds (Oba Super)', category: 'seeds', 
          quantity: 20, unit: 'kg', unitPrice: 150, 
          subUnit: 'grams', subUnitsPerPackage: 1000,
          minThreshold: 5, lastUpdated: todayStr 
        },
        { 
          id: 'i4', name: 'Neem Oil', category: 'pesticide', 
          quantity: 5, unit: 'liters', unitPrice: 400, 
          subUnit: 'ml', subUnitsPerPackage: 1000,
          minThreshold: 2, lastUpdated: todayStr 
        }
      ],
      soilRecords: [],
      irrigationRecords: [],
      marketBenchmarks: [
        { id: 'm1', cropType: 'Maize', date: todayStr, pricePerUnit: 180, location: 'Kerewan Market', trend: 'up' },
        { id: 'm2', cropType: 'Cowpea', date: todayStr, pricePerUnit: 250, location: 'Kerewan Market', trend: 'stable' }
      ],
      selectedFarmId: null,

      setFarmer: (farmer) => set({ farmer }),
      setSelectedFarmId: (selectedFarmId) => set({ selectedFarmId }),
      addFarm: (farm) => set((state) => ({ farms: [...state.farms, farm] })),
      addCropCycle: (cycle) => set((state) => ({ cropCycles: [...state.cropCycles, cycle] })),
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      addTasks: (newTasks) => set((state) => ({ tasks: [...state.tasks, ...newTasks] })),
      completeTask: (taskId) => set((state) => ({
        tasks: state.tasks.map(t => {
          if (t.id === taskId) {
            const checklist = t.checklist?.map(item => ({ ...item, completed: true }));
            return { ...t, status: 'completed', checklist };
          }
          return t;
        })
      })),
      toggleChecklistItem: (taskId, itemId) => set((state) => {
        const tasks = state.tasks.map(t => {
          if (t.id === taskId && t.checklist) {
            const updatedChecklist = t.checklist.map(item => 
              item.id === itemId ? { ...item, completed: !item.completed } : item
            );
            
            // Check if all items are now completed
            const allCompleted = updatedChecklist.every(item => item.completed);
            
            return { 
              ...t, 
              checklist: updatedChecklist,
              status: (allCompleted ? 'completed' : t.status === 'completed' ? 'pending' : t.status) as Task['status']
            };
          }
          return t;
        });
        return { tasks };
      }),
      addScoutingRecord: (record) => set((state) => ({ scoutingRecords: [...state.scoutingRecords, record] })),
      addFertilizerLog: (log) => set((state) => ({ fertilizerLogs: [...state.fertilizerLogs, log] })),
      addPestControlLog: (log) => set((state) => ({ pestControlLogs: [...state.pestControlLogs, log] })),
      addHarvestRecord: (record) => set((state) => ({ harvestRecords: [...state.harvestRecords, record] })),
      addFinancialRecord: (record) => set((state) => ({ financialRecords: [...state.financialRecords, record] })),
      addSoilTest: (test) => set((state) => ({ soilTests: [...state.soilTests, test] })),
      addChecklistItem: (taskId, label) => set((state) => ({
        tasks: state.tasks.map(t => {
          if (t.id === taskId) {
            const newItem = { id: `item-${Date.now()}`, label, completed: false };
            const checklist = [...(t.checklist || []), newItem];
            return { ...t, checklist, status: 'pending' };
          }
          return t;
        })
      })),
      addFertilizerSchedule: (schedule) => set((state) => ({ 
        fertilizerSchedules: [...state.fertilizerSchedules, schedule] 
      })),
      removeFertilizerSchedule: (id) => set((state) => ({
        fertilizerSchedules: state.fertilizerSchedules.filter(fs => fs.id !== id)
      })),
      markFertilizerScheduleAsApplied: (scheduleId, logId) => set((state) => ({
        fertilizerSchedules: state.fertilizerSchedules.map(fs => 
          fs.id === scheduleId ? { ...fs, status: 'applied', logId } : fs
        )
      })),
      addInventoryItem: (item) => set((state) => ({ inventory: [...state.inventory, item] })),
      updateInventoryQuantity: (itemId, quantity) => set((state) => ({
        inventory: state.inventory.map(item => 
          item.id === itemId ? { ...item, quantity, lastUpdated: format(new Date(), 'yyyy-MM-dd') } : item
        )
      })),
      removeInventoryItem: (itemId) => set((state) => ({
        inventory: state.inventory.filter(item => item.id !== itemId)
      })),
      addSoilRecord: (record) => set((state) => ({ soilRecords: [...state.soilRecords, record] })),
      addIrrigationRecord: (record) => set((state) => ({ irrigationRecords: [...state.irrigationRecords, record] })),
      setMarketBenchmarks: (marketBenchmarks) => set({ marketBenchmarks })
    }),
    {
      name: 'sheikh-jah-farm-storage'
    }
  )
);
