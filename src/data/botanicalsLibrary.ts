import { Botanical } from '../types';

export const botanicalsLibrary: Botanical[] = [
  {
    id: 'b1',
    name: 'Neem',
    scientificName: 'Azadirachta indica',
    localNames: 'Dogon Yaro (Hausa), Cassi (Wolof)',
    type: 'both',
    targetPests: ['Fall Armyworm', 'Aphids', 'Whiteflies', 'Caterpillars', 'Nematodes', 'Grubs', 'Stem borers'],
    nutrients: 'Nitrogen, Phosphorus, Potassium (Neem Cake)',
    preparation: 'Crush 500g of neem seeds or 2kg of fresh leaves. Soak in 10L of water overnight. Filter the solution through a cloth and add 10ml of liquid soap as a sticker. For fertilizer, use the crushed seed residue (neem cake).',
    dosage: 'Pesticide: Dilute 1L of extract in 9L of water. Fertilizer: Apply 250kg of neem cake per hectare.',
    application: 'Pesticide: Spray early morning or late evening every 7-10 days as a preventative or curative measure. Fertilizer: Incorporate neem cake directly into the soil during land preparation to repel soil pests and boost fertility.'
  },
  {
    id: 'b6',
    name: 'Chili Extract',
    scientificName: 'Capsicum spp.',
    localNames: 'Kani (Wolof)',
    type: 'biopesticide',
    targetPests: ['General insect repellent', 'Aphids', 'Beetles', 'Mites'],
    preparation: 'Blend or crush hot chilies, soak in water for 24 hours. Add a few drops of dish soap.',
    dosage: 'Depends on concentration, usually dilute further with water.',
    application: 'Foliar spray. Test on a few leaves first to ensure it does not burn the plant. Reapply after rain, as it washes off easily.'
  },
  {
    id: 'b7',
    name: 'Garlic Extract',
    scientificName: 'Allium sativum',
    localNames: 'Loj',
    type: 'biopesticide',
    targetPests: ['Fungal diseases', 'General insect repellent'],
    preparation: 'Crush garlic cloves, soak in water or mineral oil.',
    dosage: 'Dilute before use.',
    application: 'Spray on affected plants. Has strong antifungal and insect repellent properties.'
  },
  {
    id: 'b8',
    name: 'Tobacco',
    scientificName: 'Nicotiana tabacum',
    localNames: 'Tamaka',
    type: 'biopesticide',
    targetPests: ['Aphids', 'Thrips', 'Caterpillars'],
    preparation: 'Steep tobacco leaves in water. (USE WITH CAUTION: Highly toxic handle carefully)',
    dosage: 'Dilute well before use.',
    application: 'Strong insecticide, do not use on plants belonging to the nightshade family (tomatoes, peppers, eggplants) to avoid spreading tobacco mosaic virus.'
  },
  {
    id: 'b5',
    name: 'Papaya Leaves',
    scientificName: 'Carica papaya',
    localNames: 'Pawpaw',
    type: 'biopesticide',
    targetPests: ['Thrips', 'Aphids', 'Caterpillars', 'Fungal spores'],
    preparation: 'Shred 1kg of fresh papaya leaves. Soak in 1L of water for 24 hours. Strain the mixture to remove leaf matter, then add 4L of soapy water.',
    dosage: 'Use the resulting 5L mixture directly as a foliar spray.',
    application: 'Spray aggressively on the underside of leaves where pests hide. Apply in the late afternoon to avoid the sun breaking down the active compounds.'
  },
  {
    id: 'b9',
    name: 'Animal Manure (Compost)',
    scientificName: 'Organic',
    localNames: 'Fumier',
    type: 'fertilizer',
    nutrients: 'Nitrogen, Phosphorus, Potassium, Organic Matter',
    preparation: 'Compost crop residues with cattle, poultry, or goat manure until fully decomposed.',
    dosage: '5-20 tons per hectare depending on soil and crop.',
    application: 'Incorporate into the soil before planting. Poultry manure is especially high in Nitrogen.'
  },
  {
    id: 'b10',
    name: 'Green Manure Crops (Cowpea, Mucuna, Sesbania)',
    scientificName: 'Leguminosae',
    localNames: 'Engrais vert',
    type: 'fertilizer',
    nutrients: 'Nitrogen, Organic Matter',
    preparation: 'Grow explicitly to be plowed back into the soil before they flower.',
    dosage: 'Entire crop biomass.',
    application: 'Plow or incorporate into the soil to decompose, releasing high-value organic nitrogen.'
  },
  {
    id: 'b11',
    name: 'Moringa (Nebedaye) Extract',
    scientificName: 'Moringa oleifera',
    localNames: 'Nebedaye',
    type: 'fertilizer',
    nutrients: 'Zeatin (plant growth hormone), Micronutrients',
    preparation: 'Blend young Moringa leaves with a bit of water. Strain the juice and dilute it.',
    dosage: 'Dilute 1 part extract to 32 parts of water.',
    application: 'Use as a foliar spray to accelerate growth and strengthen crop immunity.'
  },
  {
    id: 'b12',
    name: 'Baobab Leaves',
    scientificName: 'Adansonia digitata',
    localNames: 'Laló / Buy leaves',
    type: 'fertilizer',
    nutrients: 'Calcium, Magnesium, Potassium',
    preparation: 'Incorporate dry or fresh baobab leaves into compost or directly into soil.',
    dosage: 'As available, used as rich organic mulch.',
    application: 'Improves soil structure and enriches it with trace elements.'
  },
  {
    id: 'b13',
    name: 'Liquid Fertilizers (Compost / Manure Tea, Seaweed, Fish emulsion)',
    scientificName: 'Organic Liquid',
    localNames: 'The de Compost',
    type: 'fertilizer',
    nutrients: 'Readily available NPK, Micronutrients',
    preparation: 'Soak compost, manure, or fish scraps/seaweed in a porous bag suspended in a barrel of water for 1-2 weeks. Stir daily.',
    dosage: 'Dilute until the color of weak tea.',
    application: 'Apply directly to the root zone or as a foliar feed for quickly available nutrients.'
  }
];
