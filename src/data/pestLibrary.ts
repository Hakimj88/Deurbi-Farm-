import { PestRecord } from '../types';

export const pestLibrary: PestRecord[] = [
  {
    id: 'p1',
    name: 'Fall Armyworm',
    scientificName: 'Spodoptera frugiperda',
    type: 'insect',
    targets: ['c1', 'c6'], // Maize, Sorghum
    symptoms: 'Ragged holes in leaves, sawdust-like frass in whorl, destroyed growing points.',
    prevention: 'Early planting, intercropping with desmodium (push-pull), frequent monitoring.',
    organicControl: 'Handpicking egg masses, applying Neem oil or Wood ash into the whorl.',
    syntheticControl: 'Emamectin benzoate, Chlorantraniliprole.'
  },
  {
    id: 'p2',
    name: 'Pod Borer',
    scientificName: 'Maruca vitrata',
    type: 'insect',
    targets: ['c2'], // Cowpea
    symptoms: 'Holes in flowers and pods, webbing of leaves and flowers.',
    prevention: 'Early maturing varieties, synchronized planting with neighbors.',
    organicControl: 'Neem seed kernel extract, Bacillus thuringiensis (Bt).',
    syntheticControl: 'Lambda-cyhalothrin.'
  },
  {
    id: 'p3',
    name: 'Groundnut Rosette Virus',
    type: 'disease',
    targets: ['c3'],
    symptoms: 'Stunted plants, distorted/yellowed leaves, failure to produce pods.',
    prevention: 'Control aphids (vector), close spacing to prevent aphid landing, resistant varieties (e.g. Samnut series).',
    organicControl: 'Apply wood ash around base to deter ants tending aphids.',
    syntheticControl: 'Acetamiprid or Imidacloprid for aphid control.'
  },
  {
    id: 'p4',
    name: 'Striga (Witchweed)',
    scientificName: 'Striga hermonthica',
    type: 'weed',
    targets: ['c1', 'c6', 'c7'],
    symptoms: 'Stunted yellowing cereal crops, small purple flowers emerging at the base of the crop.',
    prevention: 'Crop rotation with trap crops (Groundnut/Soybean), manure application to boost soil fertility.',
    organicControl: 'Hand pulling before it flowers, using Desmodium as a "push-pull" intercrop.',
    syntheticControl: 'Selective herbicides like 2,4-D (apply with care).'
  },
  {
    id: 'p5',
    name: 'Cassava Mosaic Disease',
    type: 'disease',
    targets: ['c5'],
    symptoms: 'Chlorosis on leaves, distorted leaf shape, reduced tuber size.',
    prevention: 'Use clean planting materials (cuttings), resistant varieties (TMP series).',
    organicControl: 'Uproot and burn infected plants early.',
    syntheticControl: 'N/A (focus on vector whitefly control with Imidacloprid if severe).'
  },
  {
    id: 'p6',
    name: 'Tuta Absoluta (Tomato Leafminer)',
    scientificName: 'Phthorimaea absoluta',
    type: 'insect',
    targets: ['c14'],
    symptoms: 'Blotch-shaped mines on leaves, holes in fruit, black frass near entry.',
    prevention: 'Pheromone traps, insect-proof netting in nurseries.',
    organicControl: 'Neem oil, Bacillus thuringiensis (Bt), sticky traps.',
    syntheticControl: 'Spinosad, Abamectin.'
  }
];
