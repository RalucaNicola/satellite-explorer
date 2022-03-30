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
export const red = [235, 64, 52];
export const lightRed = [240, 170, 165];
export const orbitOrange = [255, 147, 0];
export const orbitYellow = [255, 206, 0];
export const orbitGreen = [111, 170, 0];

export const perigeeYellow = [255, 217, 0];
export const apogeeBlue = [66, 135, 245];

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

export const orbitTypes = {
  leo: 'LEO',
  meo: 'MEO',
  geo: 'GEO',
  heo: 'Elliptical'
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
    id: 'gps',
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
  },
  molniya: {
    id: 'molniya',
    color: [255, 255, 255, 0.7],
    lightColor: [255, 255, 255, 0.7],
    expression: `orbit_type = 'Molniya'`
  },
  leo: {
    id: 'leo',
    color: orbitOrange,
    lightColor: [...orbitOrange, 0.7],
    expression: `orbit_class = 'LEO'`
  },
  meo: {
    id: 'meo',
    color: orbitYellow,
    lightColor: [...orbitYellow, 0.7],
    expression: `orbit_class = 'MEO'`
  },
  geo: {
    id: 'geo',
    color: orbitGreen,
    lightColor: [...orbitGreen, 0.7],
    expression: `orbit_class = 'GEO'`
  },
  heo: {
    id: 'heo',
    color: orbitYellow,
    lightColor: [...orbitYellow, 0.7],
    expression: `orbit_class = 'Elliptical'`
  },
  geostationary: {
    id: 'geostationary',
    color: orbitYellow,
    lightColor: [...orbitYellow, 0.7],
    expression: `orbit_class ='GEO' AND inclination < 0.04 AND inclination > 0.00`
  },
  spacex: {
    id: 'spacex',
    expression: `operator='SpaceX'`
  },
  onewebsatellites: {
    id: 'onewebsatellites',
    expression: `operator='OneWeb Satellites'`
  },
  planetlabs: {
    id: 'planetlabs',
    expression: `operator='Planet Labs, Inc.'`
  },
  nofilter: {
    id: 'nofilter',
    expression: null
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
// hard coded values, to check with getCountsByCountry if the ranking is still the same
export const countriesRendererConfig = {
  field: 'country_operator',
  uniqueValueInfos: [
    {
      value: 'USA',
      color: blue
    },
    {
      value: 'China',
      color: orange
    },
    {
      value: 'United Kingdom',
      color: green
    },
    {
      value: 'Russia',
      color: red
    },
    {
      value: 'Japan',
      color: purple
    }
  ]
};

export const debrisLabelingConfig = [
  {
    name: 'COSMOS 2251',
    color: '#a7c636'
  },
  {
    name: 'COSMOS 1408',
    color: '#43abeb'
  },
  {
    name: 'IRIDIUM 33',
    color: '#ffd159'
  },
  {
    name: 'FENGYUN 1C',
    color: '#ff8200'
  }
];

export const initialCamera = {
  position: {
    x: 0,
    y: 20,
    z: 2e8
  },
  heading: 0,
  tilt: 0
};
