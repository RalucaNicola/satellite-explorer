import * as styles from './BarChartComponent.module.css';

import { scaleLinear } from 'd3-scale';

export const BarChartComponent = ({ rank, total, title, value, y = 0, width, rgbColor }) => {
  const xScale = scaleLinear().domain([0, total]).range([0, width]);
  const barHeight = 20;
  const percentage = (value / total) * 100;
  return (
    <>
      <rect x='0' y={y} height={barHeight} width={width} fill='rgba(255, 255, 255, 0.3)'></rect>
      <rect x='0' y={y} height={barHeight} width={xScale(value)} fill={rgbColor}></rect>
      <text x='0' y={y - 5} className={styles.label}>
        {`${rank + 1}. ${title}`}
      </text>
      <text textAnchor='end' x={width - 5} y={y + barHeight / 1.5} className={styles.label}>
        {value} satellites, {percentage.toFixed(2)}% of total
      </text>
    </>
  );
};
