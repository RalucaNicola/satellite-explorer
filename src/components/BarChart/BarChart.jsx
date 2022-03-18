import * as styles from './BarChart.module.css';
import appStore from '../../stores/AppStore';
import { BarChartComponent } from '../index';
import { observer } from 'mobx-react';
let width = 350;
const verticalSpacing = 25;
const barHeight = 20;
const height = barHeight + verticalSpacing;
const innerPaddingMobile = 20;
const innerPaddingDesktop = 47;
export const BarChart = observer(({ rank = '', data, rgbColor }) => {
  if (appStore.mapPadding[1] > 0) {
    width = appStore.mapPadding[1] - innerPaddingDesktop * 2;
  } else {
    width = window.innerWidth - innerPaddingMobile * 2;
  }
  return (
    <svg width={width} height={height}>
      <BarChartComponent
        rank={rank}
        y={verticalSpacing}
        value={data.list[rank].value}
        rgbColor={rgbColor}
        total={data.total}
        title={data.list[rank].key}
        width={width}
      ></BarChartComponent>
    </svg>
  );
});
