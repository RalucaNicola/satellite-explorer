import { usageRendererConfig, purposeCategories, gray, countriesRendererConfig } from '../config';

import LabelClass from '@arcgis/core/layers/support/LabelClass';
import Graphic from '@arcgis/core/Graphic';
import { Polygon } from '@arcgis/core/geometry';

const getPointSymbol = ({ color = gray, size = 4 }) => {
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

export const getSatellitePointSymbol = ({
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
      outlineSize: 0
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

const fadeLayer = (layer) => {
  const opacity = parseFloat((layer.opacity + 0.05).toFixed(2));
  layer.opacity = opacity;
  if (layer.opacity < 1) {
    window.requestAnimationFrame(function () {
      fadeLayer(layer);
    });
  }
};
export function fadeIn(layer) {
  layer.opacity = 0;
  fadeLayer(layer);
}

export const fadeInSymbol = (graphic) => {
  const color = graphic.symbol.symbolLayers.getItemAt(0).material.color;
  color.a = parseFloat((color.a + 0.05).toFixed(2));
  const symbol = {
    type: 'polygon-3d',
    symbolLayers: [
      {
        type: 'fill',
        material: { color },
        outline: { size: 0 }
      }
    ]
  };
  graphic.symbol = symbol;
  if (color.a < 0.8) {
    window.requestAnimationFrame(function () {
      fadeInSymbol(graphic);
    });
  }
};

export const fadeOutSymbol = (graphic) => {
  const color = graphic.symbol.symbolLayers.getItemAt(0).material.color;
  color.a = 0.5;
  const symbol = {
    type: 'polygon-3d',
    symbolLayers: [
      {
        type: 'fill',
        material: { color },
        outline: { size: 0 }
      }
    ]
  };
  graphic.symbol = symbol;
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
};
