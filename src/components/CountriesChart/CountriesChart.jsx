import { countriesRendererConfig } from '../../config';
import { getChartWidth } from '../../utils/utils';
import appStore from '../../stores/AppStore';
import { BarChartComponent } from '../index';

import { observer } from 'mobx-react';

const verticalSpacing = 25;
const barHeight = 20;
const height = (barHeight + verticalSpacing) * 5;

export const CountriesChart = observer(({ data }) => {
  const width = getChartWidth(appStore.appPadding);
  return (
    <svg width={width} height={height}>
      {countriesRendererConfig.uniqueValueInfos.map((valueInfo, index) => {
        const rgbColor = `rgb(${valueInfo.color.join(',')})`;
        if (valueInfo.value === data.list[index].key) {
          const value = data.list[index].value;
          const y = index * (barHeight + verticalSpacing) + verticalSpacing;
          return (
            <g key={index}>
              <BarChartComponent
                rank={index}
                y={y}
                value={value}
                rgbColor={rgbColor}
                total={data.total}
                title={valueInfo.value}
                width={width}
              ></BarChartComponent>
            </g>
          );
        }
      })}
    </svg>
  );
});
