import { filterDefinition } from '../../config';
import { scaleLinear } from 'd3-scale';
import * as styles from './OrbitsChart.module.css';
import appStore from '../../stores/AppStore';
import { observer } from 'mobx-react';
let width = 350;
const height = 20;
const innerPaddingMobile = 20;
const innerPaddingDesktop = 47;

export const OrbitsChart = observer(({ data, type, title }) => {
  if (appStore.mapPadding[1] > 0) {
    width = appStore.mapPadding[1] - innerPaddingDesktop * 2;
  } else {
    width = window.innerWidth - innerPaddingMobile * 2;
  }
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
        <text x='15' y={height / 1.4} className={styles.label}>
          {data[type]} satellites ({percentage.toFixed(2)}%)
        </text>
      </svg>
    </>
  );
});
