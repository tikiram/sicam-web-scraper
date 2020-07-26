const fetch = require("node-fetch");
const fs = require('fs');
const util = require('util');
const { parse } = require('node-html-parser');
const scrapConfig = require('./scrapConfig.json');

const readFile = util.promisify(fs.readFile);

async function getValueFromFile(filename) {
  const buffer = await readFile(filename);
  return buffer.toString();
}

async function getValueFromPage (uri) {
  const result = await fetch(uri);
  return await result.text();
}


async function readDevices({ devices, sourceAction }) {
  const resultPromises = devices.map(async (device) => {
    const text = await sourceAction(device.uri);
    const root = parse(text);
    const tds = root.querySelectorAll('td');

    const values = device.fields.map(field => {
      const titleIndex = tds.findIndex(td => td.text.trim() === field);
      const value = tds[titleIndex + 1].text;
      return { field, value };
    })

    return {
      name: device.name,
      uri: device.uri,
      values: values,
    };
  });

  const results = await Promise.all(resultPromises);
  console.log(JSON.stringify(results, null, 4));
}


readDevices({
  devices: scrapConfig.devices,
  sourceAction: scrapConfig.network? getValueFromPage: getValueFromFile,
});