import * as styles from './Map.module.css';

import SceneView from '@arcgis/core/views/SceneView';
import Home from '@arcgis/core/widgets/Home';
import Viewpoint from '@arcgis/core/Viewpoint';

import appStore from '../../stores/AppStore';
import mapStore from '../../stores/MapStore';
import satelliteStore from '../../stores/SatelliteStore';

import { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';
import dataStore from '../../stores/DataStore';

import { initialCamera } from '../../config';

export const Map = observer(() => {
  const mapDiv = useRef(null);

  useEffect(async () => {
    // initializing the view
    if (mapDiv.current && mapStore.map) {
      const map = mapStore.map;
      const view = new SceneView({
        container: mapDiv.current,
        map: map,
        qualityProfile: 'high',
        environment: {
          starsEnabled: true,
          atmosphereEnabled: true,
          lighting: {
            type: 'virtual',
            directShadowsEnabled: false
          }
        },
        ui: { components: [] },
        constraints: {
          altitude: {
            max: 1e9
          },
          clipDistance: {
            mode: 'manual',
            near: 1e4,
            far: 1e9 + 5e10
          }
        },
        popup: {
          dockEnabled: true,
          dockOptions: {
            position: 'top-right',
            buttonEnabled: false,
            breakpoint: false
          },
          collapseEnabled: false
        },
        highlightOptions: {
          color: [255, 118, 0],
          haloOpacity: 0.25,
          fillOpacity: 1
        }
      });
      const homeWidget = new Home({
        view: view,
        viewpoint: new Viewpoint({
          camera: initialCamera
        })
      });

      const loading = document.createElement('div');

      loading.classList.add('loadingAnimation', 'esri-icon', 'esri-icon-loading-indicator');

      view.ui.add(['compass', 'zoom', homeWidget, loading], 'top-left');

      window.view = view;

      const popupTemplate = {
        title: '{name}',
        content:
          'Satellite used for {purpose}.<br/> Launched from {launch_site} on {launch_date}.<br/> Operator: {operator}, {country_operator}.<br/> NORAD: {norad}.',
        actions: [
          {
            title: 'Go to satellite',
            id: 'go-to',
            image: './assets/satellite-icon.png'
          }
        ]
      };

      view.map.allLayers.forEach((layer) => {
        if (layer.title === 'orbits') {
          layer.popupTemplate = popupTemplate;
          view.whenLayerView(layer).then((lyrView) => {
            lyrView.watch('updating', (value) => {
              loading.style.display = value ? 'block' : 'none';
            });
          });
        }
      });

      view.popup.viewModel.includeDefaultActions = false;

      view.popup.on('trigger-action', (event) => {
        if (event.action.id === 'go-to') {
          const norad = view.popup.viewModel.selectedFeature.attributes.norad;
          const sat = dataStore.getSatelliteById(norad);
          appStore.setActiveState('satellite');
          satelliteStore.setSelectedSatellite(sat);
          view.popup.close();
        }
      });

      view.when(() => {
        mapStore.setView(view);
        appStore.setViewLoading(false);
      });
    }

    return () => {
      view.destroy();
    };
  }, [mapStore.map]);

  return (
    <>
      <div className={styles.mapDiv} ref={mapDiv}></div>
    </>
  );
});
