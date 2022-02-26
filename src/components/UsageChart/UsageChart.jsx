import { filterDefinition } from '../../config';
import { scaleLinear } from 'd3-scale';
import * as styles from './UsageChart.module.css';
const width = 350;
const height = 15;

export function UsageChart({ data, category }) {
  const x = scaleLinear().domain([0, data.total]).range([0, width]);
  const categoryColor = filterDefinition[category].color;
  const rgbColor = `rgb(${categoryColor.join(',')})`;
  const percentage = (data[category] / data.total) * 100;
  return (
    <>
      <svg width={width} height={height}>
        <rect x='0' y='0' height={height} width={width} fill='rgba(255, 255, 255, 0.3)'></rect>
        <rect x='0' y='0' height={height} width={x(data[category])} fill={rgbColor}></rect>
        <text x={x(data[category]) + 5} y={height / 1.2} className={styles.label}>
          {data[category]} satellites
        </text>
      </svg>
      <div className={styles.caption}>
        {percentage.toFixed(2)}% of total satellites used for {category} purposes.
      </div>
    </>
  );
}
