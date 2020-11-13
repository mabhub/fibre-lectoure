#!/usr/bin/env node

import fetch from 'node-fetch';
import fs from 'fs/promises';
import crypto from 'crypto';

(async () => {
  const URL = 'https://eligibilite-thd.fr/eligibilite-thd/api/public/sites/rip/coords/GERS/';
  const postBody = {
    latEast: 44.00,
    latWest: 43.88,
    lngNorth: 0.74,
    lngSouth: 0.57,
    statusFtth: ['ECE', 'ECD', 'PDI', 'DIS', 'SUS', 'RSD'],
    statusFtte: [],
    maxSites: 20,
    idZone: null,
  };

  console.log('Fetching data...');

  const response = await fetch(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(postBody),
  });

  console.log('Got response, getting hash...');

  // Parse json response
  const json = await response.json();

  // Create indented json string
  const jsonString = JSON.stringify(json, null, 2);
  const hash = crypto
    .createHash('sha1')
    .update(jsonString, 'uf8')
    .digest('hex');

  console.log('Data hash: ', hash);

  let db = [];
  try {
    db = JSON.parse(await fs.readFile('db.json'));
  } catch {
    console.error('Unable to open db file, creating new one.')
  }

  // Check if hash is already present in db
  const found = db.some(({ hash: fHash }) => (fHash === hash));
  if (found) {
    console.log('Nothing new');
    process.exit(0);
  }

  // Date & Time strings
  const [date, rawTime] = new Date().toISOString().split('T');
  const time = rawTime.split('.')[0].replace(/:/g, '-');

  // Generate and store new filename
  const dateTime = `${date}--${time}`;
  const filename = `${dateTime}.json`;

  db.push({
    hash,
    date,
    time: rawTime.split('.')[0],
    filename,
  });

  const asObject = json.reduce((acc, curr) => ({ ...acc, [curr.dossier]: curr }), {})
  const asObjectJson = JSON.stringify(asObject, null, 2);

  await fs.writeFile(filename, asObjectJson);
  await fs.writeFile('last.json', asObjectJson);

  // Update db file
  await fs.writeFile('db.json', JSON.stringify(db, null, 2));

  console.log('New data stored.');
})();
