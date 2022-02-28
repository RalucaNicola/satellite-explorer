import { usageRendererConfig, purposeCategories, gray } from '../config';

import LabelClass from '@arcgis/core/layers/support/LabelClass';
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

const getPointSymbol = ({ color = gray, size = 0, outlineSize = 0, outlineOpacity = 0 }) => {
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
        material: { color: [...color, 0] },
        outline: { color: [...color, outlineOpacity], size: outlineSize },
        size: size * 2
      }
    ]
  };
};

const getLineSymbol = (color = gray, size = 0) => {
  return {
    type: 'simple-line',
    width: size,
    color: [...color, 0.7],
    style: 'solid',
    cap: 'round',
    join: 'round'
  };
};

export const getGeneralPointRenderer = () => {
  return {
    type: 'simple',
    symbol: getPointSymbol({ color: [255, 255, 255], size: 3, outlineSize: 1, outlineOpacity: 0.4 })
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
        symbol: getPointSymbol({ color: info.color, size: 4, outlineSize: 1, outlineOpacity: 0.4 })
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
        symbol: getLineSymbol(info.color, 1)
      };
    })
  };
};

export const getUsageConstellationsPointRenderer = () => {
  return {
    type: 'unique-value',
    valueExpression: usageRendererConfig.expression,
    defaultSymbol: getPointSymbol({}),
    uniqueValueInfos: usageRendererConfig.uniqueValueInfos.map((info) => {
      return {
        value: info.value,
        symbol: getPointSymbol({ color: info.color, size: 8, outlineSize: 4, outlineOpacity: 0.7 })
      };
    })
  };
};

export const getUsageConstellationsLineRenderer = () => {
  return {
    type: 'unique-value',
    valueExpression: usageRendererConfig.expression,
    defaultSymbol: getLineSymbol(),
    uniqueValueInfos: usageRendererConfig.uniqueValueInfos.map((info) => {
      return {
        value: info.value,
        symbol: getLineSymbol(info.color, 1.5)
      };
    })
  };
};

export const getUsageLabelingInfo = () => {
  const labelingInfo = usageRendererConfig.uniqueValueInfos.map((info) => {
    return new LabelClass({
      labelExpressionInfo: { expression: '$feature.official_name' },
      labelPlacement: 'center-right',
      where: `purpose IN ('${purposeCategories[info.value].join("','")}')`,
      symbol: {
        type: 'label-3d',
        symbolLayers: [
          {
            type: 'text',
            material: {
              color: [255, 255, 255]
            },
            halo: {
              size: 1,
              color: info.color
            },
            font: {
              size: 11,
              family: 'Poppins, sans-serif'
            }
          }
        ]
      }
    });
  });
  return labelingInfo;
};
