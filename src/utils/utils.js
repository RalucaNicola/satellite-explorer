import { usageRendererConfig, purposeCategories, gray } from '../config';
import { propagate, gstime, eciToGeodetic, radiansToDegrees } from 'satellite.js';

import LabelClass from '@arcgis/core/layers/support/LabelClass';
import Mesh from '@arcgis/core/geometry/Mesh';
import Graphic from '@arcgis/core/Graphic';
import MeshMaterialMetallicRoughness from '@arcgis/core/geometry/support/MeshMaterialMetallicRoughness';
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
      },
      {
        type: 'icon',
        resource: { primitive: 'circle' },
        material: { color: [0, 0, 0, 0] },
        outline: { color: [...outlineColor, outlineOpacity], size: outlineSize },
        size: size * outlineSizeFactor
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

export const getGeneralLineRenderer = () => {
  return {
    type: 'simple',
    symbol: getLineSymbol([255, 255, 255], 0.1)
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

export const getUsageLineRenderer = () => {
  return {
    type: 'unique-value',
    valueExpression: usageRendererConfig.expression,
    defaultSymbol: getLineSymbol(),
    uniqueValueInfos: usageRendererConfig.uniqueValueInfos.map((info) => {
      return {
        value: info.value,
        symbol: getLineSymbol(info.color, 0.8)
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

export function getOrbit(satrec, period, start, segments = 100) {
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
          material: { color: [...color, 0.9] },
          outline: { size: 0 }
        }
      ]
    }
  });
  return graphic;
  // const bottomVertices = [];
  // const faces = [];

  // for (let x = -180; x <= 180; x += 5) {
  //   bottomVertices.push([x, 0, minHeight]);
  // }
  // const vertices = [...bottomVertices];
  // const length = bottomVertices.length;
  // for (let i = 0; i < length; i++) {
  //   const vIdx1 = i;
  //   const vIdx2 = (i + 1) % length;

  //   const vIdx3 = length + i;
  //   const vIdx4 = length + ((i + 1) % length);

  //   const topVertex = [].concat.apply([], vertices[vIdx1]);
  //   topVertex[2] = maxHeight;
  //   vertices.push(topVertex);
  //   if (i !== length - 1) {
  //     faces.push(vIdx2, vIdx3, vIdx1, vIdx4, vIdx3, vIdx2);
  //   }
  // }
  // const mesh = new Mesh({
  //   vertexAttributes: {
  //     position: vertices.flat()
  //   },
  //   components: [
  //     {
  //       faces: faces,
  //       material: new MeshMaterialMetallicRoughness({
  //         color: [...color]
  //       })
  //     }
  //   ],
  //   spatialReference: { wkid: 4326 }
  // });

  // const graphic = new Graphic({
  //   geometry: mesh,
  //   symbol: {
  //     type: 'mesh-3d',
  //     symbolLayers: [
  //       {
  //         type: 'fill'
  //       }
  //     ]
  //   }
  // });
  return graphic;
};
