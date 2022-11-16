# Steps for data processing

## Update attribute data (twice a year)

A first data processing is manual and it consists of getting the latest attribute data (all the information about the satellite type, owner, orbit type etc.), matching it with the TLE information for the orbit prediction and creating the satellite orbits feature layer.

Steps:

1. Download Excel data from: [UCS Satellite Database](https://www.ucsusa.org/resources/satellite-database) (updates every half a year), convert it to csv and copy it to a new file in [this folder](../public/data/).
2. Get latest TLE from https://celestrak.org/NORAD/elements/active.txt and copy it to [this file](../public/data/active.txt).
3. Run [index.html](./index.html) in a browser. This will merge the two datasets, calculate the orbits and publish the features to a feature service:
   - I usually check first that the satellites array looks correct (metadata/orbit coordinates)
   - Then I set the testEnv to false to publish to the test feature service. I verify in the SceneViewer that the orbits look correct and that the attributes are there.
   - Then I set the testEnv to true to update it to the production feature service.

A problem I ran into is that the schema/format of the data changed in the UCS database. Check that the [keys](./js/main.js) on line 32 are the same as in the .csv file. Any errors would show up in the console.

## Update orbital data (every week)

The TLE data needs to be updated on a weekly basis and for this we set up a Jupyter notebook that is scheduled to run every week. This notebook downloads the orbital data from celestrak.com and copies it to the server in `./data/active.txt`.

Content of the [Notebook](https://geoxc-ent.bd.esri.com/portal/home/item.html?id=e287dc1ac4c447958fb0e7943d9138bf):

```py
from arcgis.gis import GIS
gis = GIS("home")

import requests

#
# TLE FILE URL
#
TLE_URL = 'https://celestrak.com/NORAD/elements/active.txt'

#
# DOWNLOAD TLE FILE
#
tle_file = requests.get(TLE_URL)
tle_content = tle_file.content

#
# SAVE TLE AS LOCAL FILE
#
open('/arcgis/home/active.txt', 'wb').write(tle_content)

#
# https://boto3.amazonaws.com/v1/documentation/api/latest/guide/configuration.html
#

import boto3
from boto3.s3.transfer import TransferConfig

#
# TRANSFER TLE FILE TO S3 BUCKET
#
s3 = boto3.client('s3',
                  aws_access_key_id='*',
                  aws_secret_access_key='*')

s3.upload_file('/arcgis/home/active.txt', "apl-apps", "space/satellite-explorer/data/active.txt")

```
