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
