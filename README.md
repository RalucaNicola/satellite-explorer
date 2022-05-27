# Satellite explorer

[Satellite Explorer](https://geoxc-apps.bd.esri.com/space/satellite-explorer/) displays active satellites orbiting the Earth: what are they used for, where are they and who owns them? Discover the current position of each satellite along with purpose, operator and launch information.

[View it live](https://geoxc-apps.bd.esri.com/space/satellite-explorer/)

[![App](./public/assets/image.jpeg)](https://geoxc-apps.bd.esri.com/space/satellite-explorer/)

## Instructions:

Clone this repository to your computer

```sh
git clone git@github.com:RalucaNicola/satellite-explorer.git
```

```sh
npm install
```

## Running the app

Now you can start the vite development server to test the app on your local machine:

```sh
# it will start a server instance and begin listening for connections from localhost on port 3000
npm run dev
```

## Deployment

To build/deploy the app, you can simply run:

```sh
# it will place all files needed for deployment into the /dist directory
npm run build
```

## Requirements

- [ArcGIS API for JavaScript (version 4.23)](https://developers.arcgis.com/javascript/index.html)
- [SatelliteJS](https://github.com/shashwatak/satellite-js)

## Data

- Satellite metadata from the [Union of Concerned Scientists Satellite Database](https://www.ucsusa.org/resources/satellite-database)
- Satellite positions calculated from [TLE data](https://celestrak.com/NORAD/elements/active.txt). The data is updated on a weekly basis.
- [Firefly basemap](https://www.arcgis.com/home/item.html?id=a66bfb7dd3b14228bf7ba42b138fe2ea) by [John Nelson](https://www.esri.com/arcgis-blog/author/j_nelson/)

## Issues

Find a bug or want to request a new feature? Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

## Licensing

Copyright 2022 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's [license.txt](license.txt) file.
