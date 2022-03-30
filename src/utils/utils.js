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
