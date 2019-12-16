#!/usr/bin/env node

const fetch = require('node-fetch');
const { gzip } = require('node-gzip');
const fs = require('fs').promises;

(async () => {
  const URL = 'https://eligibilite-thd.fr/eligibilite-thd/api/public/sites/rip/coords/GERS/';
  const postBody = {
    latEast: 43.967189,
    latWest: 43.907237,
    lngNorth: 0.709905,
    lngSouth: 0.544938,
    statusFtth: ['ECE', 'ECD', 'PDI', 'DIS'],
    statusFtte: [],
    maxSites: 20,
    idZone: null,
  };

  const response = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(postBody),
  });

  // Parse json response
  const json = await response.json();

  // Create indented json string
  const jsonString = JSON.stringify(json, null, 2);

  let db = [];
  try {
    db = JSON.parse(await fs.readFile('db.json'));
  } catch (e) {
    // nothing for now
  }

  // Date & Time strings
  const [date, rawTime] = new Date().toISOString().split('T');
  const time = rawTime.split('.')[0].replace(/:/g, '-');

  // Generate and store new filename
  const filename = `${date}--${time}.json.gzip`;
  db.push(`${date}--${time}.json.gzip`);

  // Create gziped data and write to file
  const compressedJsonString = await gzip(jsonString);
  await fs.writeFile(filename, compressedJsonString);

  // Update db file
  await fs.writeFile('db.json', JSON.stringify(db, null, 2));
})();
