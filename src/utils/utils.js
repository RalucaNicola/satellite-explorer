import { usageRendererConfig, purposeCategories, gray, countriesRendererConfig } from '../config';
import { propagate, gstime, eciToGeodetic, radiansToDegrees } from 'satellite.js';

import LabelClass from '@arcgis/core/layers/support/LabelClass';
import Graphic from '@arcgis/core/Graphic';
import { Polygon } from '@arcgis/core/geometry';

const checkForNaN = (value) => {
  if (isNaN(value)) {
    return null;
  }
  return value;
};

export const convertToType = (value, type) => {
  if (type === 'string') {
    if (value) {
      return String(value);
    }
    return null;
  }
  if (type === 'double') {
    const floatValue = parseFloat(value);
    return checkForNaN(floatValue);
  }
  if (type === 'integer' || type === 'long') {
    const intValue = parseInt(value);
    return checkForNaN(intValue);
  }
  if (type === 'date') {
    const date = Date.parse(value);
    return checkForNaN(date);
  }
  if (value) {
    return value;
  }
  return null;
};

export const clamp = (min, percentage, max, total) => {
  const value = (percentage * total) / 100;
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

export const getChartWidth = (appPadding) => {
  const innerPaddingMobile = 20;
  const innerPaddingDesktop = 47;
  let width = 350;
  if (appPadding[1] > 0) {
    width = appPadding[1] - innerPaddingDesktop * 2;
  } else {
    width = window.innerWidth - innerPaddingMobile * 2;
  }
  return width;
};

export const getPointSymbol = ({
  color = gray,
  size = 4,
  outlineSize = 1,
  outlineOpacity = 1,
  outlineColor = gray,
  outlineSizeFactor = 2
}) => {
  return {
    type: 'point-3d',
    symbolLayers: [
      {
        type: 'icon',
        resource: { primitive: 'circle' },
        material: { color: [...color, 1] },
        size: size
      }
    ]
  };
};

export const getLineSymbol = (color = gray, size = 0) => {
  return {
    type: 'simple-line',
    width: size,
    color: [...color, 0.7],
    style: 'solid',
    cap: 'round',
    join: 'round'
  };
};

export function getStippledLineSymbol(color, size) {
  return {
    type: 'line-3d',
    symbolLayers: [
      {
        type: 'line',
        size,
        material: { color },
        pattern: {
          type: 'style',
          style: 'dash'
        }
      }
    ]
  };
}

export const getGeneralPointRenderer = () => {
  return {
    type: 'simple',
    symbol: getPointSymbol({
      color: [255, 255, 255],
      size: 3,
      outlineSize: 1,
      outlineOpacity: 0.4,
      outlineColor: [255, 255, 255]
    })
  };
};

export const getGeneralLineRenderer = (size = 0.1) => {
  return {
    type: 'simple',
    symbol: getLineSymbol([255, 255, 255], size)
  };
};

export const getUsagePointRenderer = () => {
  return {
    type: 'unique-value',
    valueExpression: usageRendererConfig.expression,
    defaultSymbol: getPointSymbol({}),
    uniqueValueInfos: usageRendererConfig.uniqueValueInfos.map((info) => {
      return {
        value: info.value,
        symbol: getPointSymbol({
          color: info.color,
          size: 4,
          outlineSize: 1,
          outlineOpacity: 0.7,
          outlineColor: info.color,
          outlineSizeFactor: 2
        })
      };
    })
  };
};

export const getUsageLineRenderer = (size = 0.4) => {
  return {
    type: 'unique-value',
    valueExpression: usageRendererConfig.expression,
    defaultSymbol: getLineSymbol(),
    uniqueValueInfos: usageRendererConfig.uniqueValueInfos.map((info) => {
      return {
        value: info.value,
        symbol: getLineSymbol(info.color, size)
      };
    })
  };
};

export const getCountryLineRenderer = (size = 0.4) => {
  return {
    type: 'unique-value',
    field: countriesRendererConfig.field,
    defaultSymbol: getLineSymbol([255, 255, 255, 0], size),
    uniqueValueInfos: countriesRendererConfig.uniqueValueInfos.map((info) => {
      return {
        value: info.value,
        symbol: getLineSymbol(info.color, size)
      };
    })
  };
};

export const getUsageLabelingInfo = () => {
  const labelingInfo = usageRendererConfig.uniqueValueInfos.map((info) => {
    return new LabelClass({
      labelExpressionInfo: { expression: `'   ' + $feature.official_name` },
      labelPlacement: 'center-right',
      where: `purpose IN ('${purposeCategories[info.value].join("','")}')`,
      symbol: {
        type: 'label-3d',
        symbolLayers: [
          {
            type: 'text',
            material: {
              color: info.lightColor
            },
            halo: {
              size: 0.2,
              color: [100, 100, 100]
            },
            font: {
              size: 10,
              weight: 'lighter',
              family: 'Poppins, sans-serif',
              decoration: 'underline'
            }
          }
        ]
      }
    });
  });
  return labelingInfo;
};

export function fadeIn(layer) {
  layer.opacity = 0;
  const fading = (layer) => {
    const opacity = parseFloat((layer.opacity + 0.05).toFixed(2));
    layer.opacity = opacity;
    if (layer.opacity < 1) {
      window.requestAnimationFrame(function () {
        fading(layer);
      });
    }
  };
  fading(layer);
}

export function getOrbit(satrec, period, start, segments = 60) {
  const milliseconds = (period * 60000) / segments;

  const vertices = [];
  for (let i = 0; i <= segments; i++) {
    const date = new Date(start.getTime() - i * milliseconds);
    const satelliteLocation = getSatelliteLocation(satrec, date, start);
    if (!satelliteLocation) {
      continue;
    }
    vertices.push(satelliteLocation);
  }

  return vertices;
}

export function getSatelliteLocation(satrec, date, start) {
  const propagation = propagate(satrec, date);
  const position = propagation?.position;
  if (!position || Number.isNaN(position.x) || Number.isNaN(position.y) || Number.isNaN(position.z)) {
    return null;
  }
  if (!start) {
    start = date;
  }
  const gmst = gstime(start);
  const geographic = eciToGeodetic(position, gmst);
  const { longitude, latitude, height } = geographic;

  const x = radiansToDegrees(longitude);
  const y = radiansToDegrees(latitude);
  const z = height * 1000;
  return { x, y, z };
}

export const formatOrbitClass = (value) => {
  switch (value) {
    case 'LEO':
      return 'The satellite has a low earth orbit.';
    case 'MEO':
      return 'The satellite has a medium earth orbit.';
    case 'GEO':
      return 'The satellite has a geosynchronous orbit.';
    case 'HEO':
      return 'The satellite has a high earth orbit.';
    case 'Elliptical':
      return 'The satellite has a high elliptical orbit.';
  }
  return value;
};

export const getOrbitRangeGraphic = (minHeight, maxHeight, color) => {
  const rings = [];
  for (let x = 180; x >= -175; x -= 5) {
    const ring = [
      [x, 0, minHeight],
      [x - 5, 0, minHeight],
      [x - 5, 0.1, maxHeight],
      [x, 0.1, maxHeight]
    ];
    rings.push(ring);
  }

  const graphic = new Graphic({
    geometry: new Polygon({
      rings: rings
    }),
    symbol: {
      type: 'polygon-3d',
      symbolLayers: [
        {
          type: 'fill',
          material: { color: [...color, 0.7] },
          outline: { size: 0 }
        }
      ]
    }
  });
  return graphic;
};

export const parseHash = () => {
  const hashString = window.location.hash.substring(1);
  return parsePairsFromString(hashString);
};

const parsePairsFromString = (inputStr = '') => {
  const output = {};

  const pairs = inputStr.split('&');

  for (const item of pairs) {
    const pair = item.split('=');
    const key = decodeURIComponent(pair[0]);
    const value = decodeURIComponent(pair[1] || '');

    if (key) {
      output[key] = value;
    }
  }

  return output;
};

export const updateHashParam = ({ key = '', value = '' } = {}) => {
  if (key) {
    const hashParams = parseHash();

    hashParams[key] = value;

    const queryParamsStr = Object.keys(hashParams)
      .map((paramKey) => {
        const val = hashParams[paramKey];
        return val ? `${paramKey}=${val}` : '';
      })
      .filter((d) => d)
      .join('&');

    window.location.hash = queryParamsStr;
  }
};
