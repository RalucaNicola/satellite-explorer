export const fields = [
  { name: 'name', metadataIndex: 1, type: 'string' },
  { name: 'official_name', metadataIndex: 2, type: 'string' },
  { name: 'country_operator', metadataIndex: 4, type: 'string' },
  { name: 'operator', metadataIndex: 5, type: 'string' },
  { name: 'purpose', metadataIndex: 7, type: 'string' },
  { name: 'orbit_class', metadataIndex: 9, type: 'string' },
  { name: 'orbit_type', metadataIndex: 10, type: 'string' },
  { name: 'perigee', metadataIndex: 12, type: 'double' },
  { name: 'apogee', metadataIndex: 13, type: 'double' },
  { name: 'eccentricity', metadataIndex: 14, type: 'double' },
  { name: 'inclination', metadataIndex: 15, type: 'double' },
  { name: 'period', metadataIndex: 16, type: 'double' },
  { name: 'launch_date', metadataIndex: 20, type: 'date' },
  { name: 'expected_lifetime', metadataIndex: 21, type: 'string' },
  { name: 'launch_site', metadataIndex: 24, type: 'string' },
  { name: 'launch_vehicle', metadataIndex: 25, type: 'string' },
  { name: 'cospar', metadataIndex: 26, type: 'string' },
  { name: 'norad', metadataIndex: 27, type: 'long' }
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
    expression: `purpose IN ('${purposeCategories.navigation.join("','")}')`
  },
  gps: {
    color: pink,
    expression: `LOWER(name) LIKE '%gps%'`
  },
  glonass: {
    color: pink,
    expression: `LOWER(name) LIKE '%glonass%'`
  },
  beidou: {
    color: pink,
    expression: `LOWER(name) LIKE '%beidou%'`
  },
  galileo: {
    color: pink,
    expression: `LOWER(name) LIKE '%galileo%'`
  },
  communications: {
    color: blue,
    expression: `purpose IN ('${purposeCategories.communications.join("','")}')`
  },
  starlink: {
    color: blue,
    expression: `LOWER(name) LIKE '%starlink%'`
  },
  oneweb: {
    color: blue,
    expression: `LOWER(name) LIKE '%oneweb%'`
  },
  iridium: {
    color: blue,
    expression: `LOWER(name) LIKE '%iridium%'`
  },
  globalstar: {
    color: blue,
    expression: `LOWER(name) LIKE '%globalstar%'`
  },
  earthObservation: {
    color: green,
    expression: `purpose IN ('${purposeCategories.earthObservation.join("','")}') `
  },
  landsat: {
    color: green,
    expression: `LOWER(name) LIKE '%landsat%'`
  },
  doves: {
    color: green,
    expression: `LOWER(name) LIKE '%dove%'`
  },
  spaceObservation: {
    color: purple,
    expression: `purpose IN ('${purposeCategories.spaceObservation.join("','")}') `
  },
  molniya: {
    color: [255, 255, 255, 0.7],
    expression: `orbit_type = 'Molniya'`
  },
  leo: {
    color: orbitOrange,
    expression: `orbit_class = 'LEO'`
  },
  meo: {
    color: orbitYellow,
    expression: `orbit_class = 'MEO'`
  },
  geo: {
    color: orbitGreen,
    expression: `orbit_class = 'GEO'`
  },
  heo: {
    color: orbitYellow,
    expression: `orbit_class = 'Elliptical'`
  },
  geostationary: {
    color: orbitYellow,
    expression: `orbit_class ='GEO' AND inclination < 0.04 AND inclination > 0.00`
  },
  spacex: {
    expression: `operator='SpaceX'`
  },
  oneweboperator: {
    expression: `operator='OneWeb Satellites'`
  },
  planetlabs: {
    expression: `operator='Planet Labs, Inc.'`
  },
  nofilter: {
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

export const initialCamera = {
  position: [-24.17171816, 24.85169084, 131280447.86795],
  heading: 0,
  tilt: 0.4
};

export const leoCamera = {
  position: [12.55521244, 36.59510881, 27326078.59815],
  heading: 1.5,
  tilt: 0.11
};
