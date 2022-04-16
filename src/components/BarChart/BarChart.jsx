import appStore from '../../stores/AppStore';
import { BarChartComponent } from '../index';
import { observer } from 'mobx-react';
import { getChartWidth } from '../../utils/utils';
const verticalSpacing = 25;
const barHeight = 20;
const height = barHeight + verticalSpacing;

export const BarChart = observer(({ rank = '', data, rgbColor }) => {
  const width = getChartWidth(appStore.appPadding);
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
