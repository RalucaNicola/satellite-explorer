import { usageRendererConfig } from '../config';

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

const getPointSymbol = (color, size) => {
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
        outline: { color: [...color, 0.3] },
        size: size * 2
      }
    ]
  };
};

const getLineSymbol = (color, size) => {
  return {
    type: 'simple-line',
    width: size,
    color: [...color, 0.6],
    style: 'solid',
    cap: 'round',
    join: 'round'
  };
};

export const setRenderers = (layers, location) => {
  let pointRenderer, lineRenderer;
  switch (location) {
    case '/satellite-usage':
      pointRenderer = {
        type: 'unique-value',
        valueExpression: usageRendererConfig.expression,
        uniqueValueInfos: usageRendererConfig.uniqueValueInfos.map((info) => {
          return {
            value: info.value,
            symbol: getPointSymbol(info.color, 4)
          };
        })
      };
      lineRenderer = {
        type: 'unique-value',
        valueExpression: usageRendererConfig.expression,
        uniqueValueInfos: usageRendererConfig.uniqueValueInfos.map((info) => {
          return {
            value: info.value,
            symbol: getLineSymbol(info.color, 1)
          };
        })
      };
      break;
    default:
      pointRenderer = {
        type: 'simple',
        symbol: getPointSymbol([255, 255, 255], 3)
      };
      lineRenderer = {
        type: 'simple',
        symbol: getLineSymbol([255, 255, 255], 0.25)
      };
  }
  layers[0].renderer = lineRenderer;
  layers[1].renderer = pointRenderer;
};
