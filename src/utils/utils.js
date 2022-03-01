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

const getPointSymbol = ({
  color = gray,
  size = 0,
  outlineSize = 0,
  outlineOpacity = 0,
  outlineColor = gray,
  outlineSizeFactor = 2
}) => {
  return {
    type: 'point-3d',
    symbolLayers: [
      {
        type: 'icon',
        resource: { primitive: 'circle' },
        material: { color: [0, 0, 0, 0] },
        outline: { color: [...outlineColor, outlineOpacity], size: outlineSize },
        size: size * outlineSizeFactor
      },
      {
        type: 'icon',
        resource: { primitive: 'circle' },
        material: { color: [...color, 1] },
        size: size
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
          outlineOpacity: 0.4,
          outlineColor: info.color
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
        symbol: getLineSymbol(info.color, 0.4)
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
        symbol: getPointSymbol({
          color: info.color,
          size: 5,
          outlineSize: 1,
          outlineOpacity: 1,
          outlineColor: info.lightColor,
          outlineSizeFactor: 3
        })
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
        symbol: getLineSymbol(info.color, 1)
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

export function debounce(func, wait, immediate) {
  let timeout, previous, args, result, context;

  const later = function () {
    const passed = Date.now() - previous;
    if (wait > passed) {
      timeout = setTimeout(later, wait - passed);
    } else {
      timeout = null;
      if (!immediate) result = func.apply(context, args);
      if (!timeout) args = context = null;
    }
  };

  const debounced = function (..._args) {
    context = this;
    args = _args;
    previous = Date.now();
    if (!timeout) {
      timeout = setTimeout(later, wait);
      if (immediate) result = func.apply(context, args);
    }
    return result;
  };

  debounced.cancel = function () {
    clearTimeout(timeout);
    timeout = args = context = null;
  };

  return debounced;
}
