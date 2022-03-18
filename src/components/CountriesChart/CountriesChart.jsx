import { countriesRendererConfig } from '../../config';
import appStore from '../../stores/AppStore';
import { BarChartComponent } from '../index';

import { observer } from 'mobx-react';

let width = 350;
const verticalSpacing = 25;
const barHeight = 20;
const height = (barHeight + verticalSpacing) * 5;
const innerPaddingMobile = 20;
const innerPaddingDesktop = 47;

export const CountriesChart = observer(({ data }) => {
  if (appStore.mapPadding[1] > 0) {
    width = appStore.mapPadding[1] - innerPaddingDesktop * 2;
  } else {
    width = window.innerWidth - innerPaddingMobile * 2;
  }

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
