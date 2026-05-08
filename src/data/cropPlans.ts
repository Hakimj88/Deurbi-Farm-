import { CropPlanStep } from '../types';

export const maizePlan: CropPlanStep[] = [
  {
    dayRange: "0-7",
    stage: "Nursery",
    activity: "Land Preparation & Sowing",
    lookOutFor: ["Soil moisture", "Birds eating seeds", "Termites"],
    monitoringChecklist: [
      "Verify soil is moist to 15cm depth before sowing",
      "Check seed spacing is exactly 25cm (plant to plant)",
      "Ensure basal NPK is applied 5cm away from the seed",
      "Scan for exposed seeds that might attract birds"
    ],
    interventions: {
      fertilizer: {
        organic: {
          type: 'organic',
          product: 'Well-rotted Manure/Compost',
          dosage: '5-10 tons/ha',
          method: 'Incorporate during land prep',
          notes: 'Builds soil structure and long-term fertility.'
        },
        synthetic: {
          type: 'synthetic',
          product: 'NPK 15-15-15',
          dosage: '100-200 kg/ha',
          method: 'Basal application at planting',
          notes: 'Apply 5cm away from seed to avoid burn.'
        }
      }
    }
  },
  {
    dayRange: "14-21",
    stage: "Vegetative",
    activity: "First Weeding & Thinning",
    lookOutFor: ["Stem borers", "Fall Armyworm (FAW)", "Stunting"],
    monitoringChecklist: [
      "Count plant population (target 53,000 plants/ha)",
      "Pull out weak/diseased seedlings during thinning",
      "Inspect whorls of 20 random plants for FAW 'window pane' damage",
      "Ensure field is 100% weed-free within the rows"
    ],
    interventions: {
      pestControl: {
        organic: {
          type: 'organic',
          product: 'Neem Oil / Leaf Extract',
          dosage: '50ml per 15L sprayer',
          method: 'Foliar spray in the evening',
          notes: 'Target the whorl (center) of the plant for FAW.'
        },
        synthetic: {
          type: 'synthetic',
          product: 'Emamectin Benzoate',
          dosage: '10g per 15L sprayer',
          method: 'Spray directly into the whorl',
          notes: 'Rotate with other chemicals to prevent resistance.'
        }
      }
    }
  },
  {
    dayRange: "40-50",
    stage: "Vegetative",
    activity: "Second Weeding & Top Dressing",
    lookOutFor: ["Yellowing leaves", "Striga weed", "Moisture stress"],
    monitoringChecklist: [
      "Verify Nitrogen deficiency (yellowing starting from lower leaves)",
      "Check for Striga (witchweed) presence around maize roots",
      "Ensure Urea is buried immediately after application",
      "Observe leaf curl as an indicator of drought stress"
    ],
    interventions: {
      fertilizer: {
        organic: {
          type: 'organic',
          product: 'Compost Tea / Liquid Manure',
          dosage: '2L per plant',
          method: 'Soil drench',
          notes: 'High in readily available Nitrogen.'
        },
        synthetic: {
          type: 'synthetic',
          product: 'Urea (46% N)',
          dosage: '100 kg/ha',
          method: 'Side dressing',
          notes: 'Apply when soil is moist; cover immediately to prevent gas loss.'
        }
      }
    }
  },
  {
    dayRange: "60-75",
    stage: "Flowering",
    activity: "Tasseling & Silking",
    lookOutFor: ["Drought at flowering (critical)", "Stem borers", "Nutrient deficiency"],
    monitoringChecklist: [
      "Monitor daily rainfall/irrigation; drought now causes 50% yield loss",
      "Check for synchronized tasseling and silking",
      "Inspect silks for maize earworm presence",
      "Ensure no foot traffic through rows to avoid damaging silks"
    ],
    interventions: {
      pestControl: {
        organic: {
          type: 'organic',
          product: 'Chili & Garlic Spray',
          dosage: 'Strong concentration',
          method: 'Foliar spray',
          notes: 'Repels pests during sensitive reproductive stage.'
        },
        synthetic: {
          type: 'synthetic',
          product: 'Cypermethrin',
          dosage: '30-40ml per 15L sprayer',
          method: 'Foliar spray',
          notes: 'General purpose insecticide.'
        }
      }
    }
  }
];

export const tomatoPlan: CropPlanStep[] = [
  {
    dayRange: "0-21",
    stage: "Nursery",
    activity: "Seedling Management",
    lookOutFor: ["Damping off", "Whiteflies", "Aphids"],
    monitoringChecklist: [
      "Monitor nursery tray moisture (moist but not soaked)",
      "Verify seedling height reaches 10-15cm before transplanting",
      "Check under leaves for whitefly eggs/nymphs",
      "Ensure net covering is securely fastened without gaps"
    ],
    interventions: {
      pestControl: {
        organic: {
          type: 'organic',
          product: 'Yellow Sticky Traps & Neem',
          dosage: 'As needed',
          method: 'Placement and light spray',
          notes: 'Keep seedlings protected under a net if possible.'
        },
        synthetic: {
          type: 'synthetic',
          product: 'Imidacloprid',
          dosage: '5ml / 15L sprayer',
          method: 'Foliar spray',
          notes: 'Systemic control for sucking insects.'
        }
      }
    }
  },
  {
    dayRange: "21-45",
    stage: "Vegetative",
    activity: "Transplanting & Staking",
    lookOutFor: ["Transplant shock", "Wilting", "Leaf spots"],
    monitoringChecklist: [
      "Verify roots are white and healthy before transplanting",
      "Ensure spacing of 60cm between plants",
      "Apply mulch immediately after transplanting to retain moisture",
      "Check that stakes are firm and ties are not choking stems"
    ],
    interventions: {
      fertilizer: {
        organic: {
          type: 'organic',
          product: 'Poultry Manure',
          dosage: '1 handful per hole',
          method: 'Mix with soil before planting',
          notes: 'Very high in Nitrogen and Phosphorus.'
        },
        synthetic: {
          type: 'synthetic',
          product: 'NPK 15-15-15',
          dosage: '10g per plant',
          method: 'Ring application',
          notes: 'Avoid contact with the stem.'
        }
      }
    }
  }
];

export const cropPlans: Record<string, CropPlanStep[]> = {
  'c1': maizePlan,
  'c14': tomatoPlan
};
