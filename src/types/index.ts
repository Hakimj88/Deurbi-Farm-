export interface Farmer {
  id: string;
  name: string;
  phone: string;
  region: string;
  village: string;
  language: string;
  createdAt: string;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  area: number;
  areaUnit: 'ha' | 'acres';
  soilType: 'sandy' | 'clay' | 'loamy' | 'laterite';
  agroZone: string;
  waterSource: string;
  latitude?: number;
  longitude?: number;
}

export interface Crop {
  id: string;
  name: string;
  localNames: string;
  scientificName: string;
  cycleDays: number;
  zones: string[];
  spacing: string;
  expectedYield: string;
  category: 'Cereal' | 'Legume' | 'Vegetable' | 'Root' | 'Fruit' | 'Cash Crop';
  optimalPh?: [number, number];
  waterNeeds?: 'Low' | 'Moderate' | 'High';
  nutrients?: {
    n: 'Low' | 'Medium' | 'High';
    p: 'Low' | 'Medium' | 'High';
    k: 'Low' | 'Medium' | 'High';
  };
  commonPests?: string[];
  stages?: {
    name: string;
    durationDays: number;
  }[];
}

export interface CropCycle {
  id: string;
  farmId: string;
  cropId: string;
  variety: string;
  area: number;
  plantingDate: string;
  season: string;
  purpose: string;
  system?: 'open_field' | 'greenhouse' | 'shade_net';
  status: 'planned' | 'active' | 'harvested';
  currentStage?: 'Nursery' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Senescence';
}

export interface InterventionOption {
  type: 'organic' | 'synthetic';
  product: string;
  dosage: string;
  method: string;
  notes: string;
  costEstimate?: string;
}

export interface CropPlanStep {
  dayRange: string; // e.g. "0-7" or "14-21"
  stage: string;
  activity: string;
  lookOutFor: string[];
  monitoringChecklist?: string[];
  interventions: {
    fertilizer?: {
      organic: InterventionOption;
      synthetic: InterventionOption;
    };
    pestControl?: {
      organic: InterventionOption;
      synthetic: InterventionOption;
    };
  };
}

export interface Botanical {
  id: string;
  name: string;
  scientificName: string;
  localNames: string;
  type: 'biopesticide' | 'fertilizer' | 'both';
  targetPests?: string[];
  nutrients?: string;
  preparation: string;
  dosage: string;
  application: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface Task {
  id: string;
  cropCycleId: string;
  taskType: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
  cost?: number;
  checklist?: ChecklistItem[];
  dependencyTaskId?: string;
}

export interface PestRecord {
  id: string;
  name: string;
  scientificName?: string;
  type: 'insect' | 'disease' | 'nematode' | 'weed';
  targets: string[];
  symptoms: string;
  prevention: string;
  organicControl: string;
  syntheticControl?: string;
}

export interface ScoutingRecord {
  id: string;
  cropCycleId: string;
  date: string;
  pestId: string;
  severity: 'low' | 'moderate' | 'severe';
  actionTaken?: string;
  cost?: number;
  soilMoisture?: number; // percentage 0-100
}

export interface FertilizerLog {
  id: string;
  cropCycleId: string;
  date: string;
  product: string;
  rate: string;
  appliedQuantity?: number;
  inventoryItemId?: string;
  method: string;
  cost: number;
  scheduleId?: string;
}

export interface PestControlLog {
  id: string;
  cropCycleId: string;
  date: string;
  type: 'organic' | 'synthetic';
  product: string;
  dosage: string;
  appliedQuantity?: number;
  inventoryItemId?: string;
  method: string;
  cost: number;
  notes?: string;
}

export interface HarvestRecord {
  id: string;
  cropCycleId: string;
  date: string;
  quantity: number;
  unit: 'kg' | 'bags' | 'tons';
  quality: string;
  destination: string;
}

export interface SoilTest {
  id: string;
  cropCycleId: string;
  date: string;
  nitrogen: 'low' | 'medium' | 'high';
  phosphorus: 'low' | 'medium' | 'high';
  potassium: 'low' | 'medium' | 'high';
  ph: number;
  organicMatter: number;
  notes?: string;
}

export interface FertilizerSchedule {
  id: string;
  cropCycleId: string;
  plannedDate: string;
  stage: string;
  product: string;
  dosage: string;
  method: string;
  status: 'planned' | 'applied';
  logId?: string;
}

export interface SoilRecord {
  id: string;
  date: string;
  farmId: string;
  ph: number;
  nitrogen: 'low' | 'medium' | 'high';
  phosphorus: 'low' | 'medium' | 'high';
  potassium: 'low' | 'medium' | 'high';
  organicMatter: number;
  recommendations?: string;
}

export interface IrrigationRecord {
  id: string;
  cropCycleId: string;
  date: string;
  volume: number; // in liters or m3
  duration: number; // minutes
  method: string;
  cost: number;
}

export interface MarketData {
  id: string;
  cropType: string;
  date: string;
  pricePerUnit: number;
  location: string;
  trend: 'up' | 'down' | 'stable';
}

export interface FinancialRecord {
  id: string;
  cropCycleId: string;
  category: 'input' | 'labor' | 'service' | 'revenue';
  item: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  date: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'seeds' | 'fertilizer' | 'pesticide' | 'tools' | 'other';
  quantity: number; // in package units (e.g. 10 bags)
  unit: string; // package unit (e.g. "bags", "liters")
  unitPrice: number; // cost per package unit
  subUnit?: string; // e.g. "grams" or "ml"
  subUnitsPerPackage?: number; // e.g. 50000 for 50kg bag
  minThreshold: number;
  lastUpdated: string;
}
