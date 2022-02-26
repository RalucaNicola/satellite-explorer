export const fields = [
  { name: 'name', metadataIndex: 1, type: 'string' },
  { name: 'official_name', metadataIndex: 2, type: 'string' },
  { name: 'country_UN_registry', metadataIndex: 3, type: 'string' },
  { name: 'country_operator', metadataIndex: 4, type: 'string' },
  { name: 'operator', metadataIndex: 5, type: 'string' },
  { name: 'users', metadataIndex: 6, type: 'string' },
  { name: 'purpose', metadataIndex: 7, type: 'string' },
  { name: 'detailed_purpose', metadataIndex: 8, type: 'string' },
  { name: 'orbit_class', metadataIndex: 9, type: 'string' },
  { name: 'orbit_type', metadataIndex: 10, type: 'string' },
  { name: 'perigee', metadataIndex: 12, type: 'double' },
  { name: 'apogee', metadataIndex: 13, type: 'double' },
  { name: 'eccentricity', metadataIndex: 14, type: 'double' },
  { name: 'inclination', metadataIndex: 15, type: 'double' },
  { name: 'period', metadataIndex: 16, type: 'double' },
  { name: 'launch_mass', metadataIndex: 17, type: 'double' },
  { name: 'dry_mass', metadataIndex: 18, type: 'double' },
  { name: 'power', metadataIndex: 19, type: 'double' },
  { name: 'launch_date', metadataIndex: 20, type: 'date' },
  { name: 'expected_lifetime', metadataIndex: 21, type: 'string' },
  { name: 'contractor', metadataIndex: 22, type: 'string' },
  { name: 'launch_site', metadataIndex: 24, type: 'string' },
  { name: 'launch_vehicle', metadataIndex: 25, type: 'string' },
  { name: 'cospar', metadataIndex: 26, type: 'string' },
  { name: 'norad', metadataIndex: 27, type: 'long' },
  { name: 'source', metadataIndex: 29, type: 'string' }
];

const pink = [239, 138, 223];
const blue = [109, 189, 232];
const green = [193, 232, 118];
const orange = [255, 118, 0];
const gray = [200, 200, 200];
const purple = [137, 109, 232];

export const purposeCategories = {
  navigation: ['Navigation/Global Positioning', 'Navigation/Regional Positioning', 'Satellite Positioning'],
  communications: ['Communications', 'Communication'],
  earthObservation: [
    'Earth Science',
    'Earth Observation',
    'Earth Observation/Communications',
    'Earth Observation/Technology Development'
  ],
  spaceObservation: ['Space Science', 'Space Observation']
};

export const filterDefinition = {
  navigation: {
    color: pink,
    id: 'navigation',
    expression: `purpose IN ('${purposeCategories.navigation.join("','")}')`
  },
  gps: {
    color: pink,
    expression: `LOWER(name) LIKE '%gps%'`
  },
  glonass: {
    color: pink,
    id: 'glonass',
    expression: `LOWER(name) LIKE '%glonass%'`
  },
  beidou: {
    color: pink,
    id: 'beidou',
    expression: `LOWER(name) LIKE '%beidou%'`
  },
  galileo: {
    color: pink,
    id: 'galileo',
    expression: `LOWER(name) LIKE '%galileo%'`
  },
  communications: {
    color: blue,
    id: 'communications',
    expression: `purpose IN ('${purposeCategories.communications.join("','")}')`
  },
  earthObservation: {
    color: green,
    id: 'earthObservation',
    expression: `purpose IN ('${purposeCategories.earthObservation.join("','")}') `
  },
  spaceObservation: {
    color: orange,
    id: 'spaceObservation',
    expression: `purpose IN ('${purposeCategories.spaceObservation.join("','")}') `
  }
};

export const usageRendererConfig = {
  expression: `
  var purpose = $feature.purpose;
  var p = Dictionary(
    'Navigation/Global Positioning', 'Navigation',
    'Navigation/Regional Positioning', 'Navigation',
    'Satellite Positioning', 'Navigation',
    'Communications', 'Communications',
    'Earth Observation', 'Earth Observation',
    'Earth Science', 'Earth Observation',
    'Earth Observation/Technology Development', 'Earth Observation',
    'Technology Development', 'Technology Development',
    'Technology Demonstration', 'Technology Development',
    'Space Science', 'Space Observation',
    'Space Observation', 'Space Observation'
  );
  var value = IIf(hasKey(p, purpose), p[purpose], 'Others');
  return value;
`,
  uniqueValueInfos: [
    {
      value: 'Communications',
      color: blue
    },
    {
      value: 'Navigation',
      color: pink
    },
    {
      value: 'Earth Observation',
      color: green
    },
    {
      value: 'Space Observation',
      color: orange
    },
    {
      value: 'Technology Development',
      color: purple
    },
    { value: 'Others', color: gray }
  ]
};
