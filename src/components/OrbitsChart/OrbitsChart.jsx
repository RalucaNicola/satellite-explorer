import * as styles from './OrbitsChart.module.css';

import { scaleLinear } from 'd3-scale';

import { filterDefinition } from '../../config';
import { getChartWidth, formatNumber } from '../../utils/utils';
import appStore from '../../stores/AppStore';

import { observer } from 'mobx-react';

const height = 20;

export const OrbitsChart = observer(({ data, type, title }) => {
  const width = getChartWidth(appStore.appPadding);
  const x = scaleLinear().domain([0, data.total]).range([0, width]);
  const typeColor = filterDefinition[type].color;
  const rgbColor = `rgb(${typeColor.join(',')})`;
  const percentage = (data[type] / data.total) * 100;
  return (
    <>
      <p style={{ color: rgbColor }} className={styles.title}>
        {title}
      </p>
      <svg width={width} height={height}>
        <rect x='0' y='0' height={height} width={width} fill='rgba(255, 255, 255, 0.3)'></rect>
        <rect x='0' y='0' height={height} width={x(data[type])} fill={rgbColor}></rect>
        <text x='20' y={height / 1.4} className={styles.label}>
          {formatNumber(data[type])} satellites ({percentage.toFixed(2)}%)
        </text>
      </svg>
    </>
  );
});
