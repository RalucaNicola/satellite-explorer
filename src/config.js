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

export const pink = [239, 138, 223];
export const lightPink = [250, 217, 245];
export const blue = [109, 189, 232];
export const lightBlue = [204, 237, 255];
export const green = [193, 232, 118];
export const lightGreen = [225, 240, 197];
export const orange = [255, 118, 0];
export const lightOrange = [255, 215, 181];
export const gray = [200, 200, 200];
export const purple = [137, 109, 232];
export const lightPurple = [217, 207, 250];

export const purposeCategories = {
  navigation: ['Navigation/Global Positioning', 'Navigation/Regional Positioning', 'Satellite Positioning'],
  communications: ['Communications', 'Communications/Maritime Tracking', 'Communications/Technology Development'],
  earthObservation: [
    'Earth Science',
    'Earth Observation',
    'Earth Observation/Communications',
    'Earth Observation/Technology Development'
  ],
  spaceObservation: ['Space Science', 'Space Observation'],
  technologyDevelopment: ['Technology Development', 'Technology Demonstration']
};

export const filterDefinition = {
  navigation: {
    color: pink,
    lightColor: lightPink,
    id: 'navigation',
    expression: `purpose IN ('${purposeCategories.navigation.join("','")}')`
  },
  gps: {
    color: pink,
    lightColor: lightPink,
    expression: `LOWER(name) LIKE '%gps%'`
  },
  glonass: {
    color: pink,
    lightColor: lightPink,
    id: 'glonass',
    expression: `LOWER(name) LIKE '%glonass%'`
  },
  beidou: {
    color: pink,
    lightColor: lightPink,
    id: 'beidou',
    expression: `LOWER(name) LIKE '%beidou%'`
  },
  galileo: {
    color: pink,
    lightColor: lightPink,
    id: 'galileo',
    expression: `LOWER(name) LIKE '%galileo%'`
  },
  communications: {
    color: blue,
    lightColor: lightBlue,
    id: 'communications',
    expression: `purpose IN ('${purposeCategories.communications.join("','")}')`
  },
  starlink: {
    color: blue,
    lightColor: lightBlue,
    id: 'starlink',
    expression: `LOWER(name) LIKE '%starlink%'`
  },
  oneweb: {
    color: blue,
    lightColor: lightBlue,
    id: 'oneweb',
    expression: `LOWER(name) LIKE '%oneweb%'`
  },
  iridium: {
    color: blue,
    lightColor: lightBlue,
    id: 'iridium',
    expression: `LOWER(name) LIKE '%iridium%'`
  },
  globalstar: {
    color: blue,
    lightColor: lightBlue,
    id: 'globalstar',
    expression: `LOWER(name) LIKE '%globalstar%'`
  },
  earthObservation: {
    color: green,
    lightColor: lightGreen,
    id: 'earthObservation',
    expression: `purpose IN ('${purposeCategories.earthObservation.join("','")}') `
  },
  landsat: {
    color: green,
    lightColor: lightGreen,
    id: 'landsat',
    expression: `LOWER(name) LIKE '%landsat%'`
  },
  doves: {
    color: green,
    lightColor: lightGreen,
    id: 'doves',
    expression: `LOWER(name) LIKE '%dove%'`
  },
  spaceObservation: {
    color: orange,
    lightColor: lightOrange,
    id: 'spaceObservation',
    expression: `purpose IN ('${purposeCategories.spaceObservation.join("','")}') `
  },
  technologyDevelopment: {
    id: 'technologyDevelopment',
    color: purple,
    lightColor: lightPurple,
    expression: `purpose IN ('${purposeCategories.technologyDevelopment.join("','")}') `
  }
};

export const usageRendererConfig = {
  expression: `
  var purpose = $feature.purpose;
  var p = Dictionary(
    'Navigation/Global Positioning', 'navigation',
    'Navigation/Regional Positioning', 'navigation',
    'Satellite Positioning', 'navigation',
    'Communications', 'communications',
    'Earth Observation', 'earthObservation',
    'Earth Science', 'earthObservation',
    'Earth Observation/Technology Development', 'earthObservation',
    'Technology Development', 'technologyDevelopment',
    'Technology Demonstration', 'technologyDevelopment',
    'Space Science', 'spaceObservation',
    'Space Observation', 'spaceObservation'
  );
  var value = IIf(hasKey(p, purpose), p[purpose], 'others');
  return value;
`,
  uniqueValueInfos: [
    {
      value: 'communications',
      color: blue,
      lightColor: lightBlue
    },
    {
      value: 'navigation',
      color: pink,
      lightColor: lightPink
    },
    {
      value: 'earthObservation',
      color: green,
      lightColor: lightGreen
    },
    {
      value: 'spaceObservation',
      color: orange,
      lightColor: lightOrange
    },
    {
      value: 'technologyDevelopment',
      color: purple,
      lightColor: lightPurple
    }
  ]
};
