#!/usr/bin/env node

const fsLegacy = require('fs');
const fs = require('fs').promises;
const { ungzip } = require('node-gzip');

(async () => {
  // const [,, file] = process.argv;

  const dbBuffer = await fs.readFile('./db.json');
  const dbString = dbBuffer.toString();
  const db = JSON.parse(dbString);

  for (const file of db) {
    if (!file || !fsLegacy.existsSync(file)) {
      continue;
    }

    const fileBuffer = await fs.readFile(file);
    // const fileString = fileBuffer.toString();
    const fileContent = (await ungzip(fileBuffer)).toString();
    await fs.writeFile(file.replace('.gzip', ''), fileContent);
  }


  // const compressedJsonString = await fs.readFile(file);
  // const compressedJsonString = await gzip(jsonString);
  // console.log(db);
})();
