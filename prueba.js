const fetch = require("node-fetch");
const moment = require('moment');
const fs = require('fs').promises;
const {parse} = require('node-html-parser');
const scrapConfig = require('./scrapConfig.json');


async function getValueFromFile(filename) {
  const buffer = await fs.readFile(filename);
  return buffer.toString();
}

async function getValueFromPage(uri) {
  const result = await fetch(uri);
  return await result.text();
}

function resultToString({name, uri, values}) {
  const valuesText = values.map(({field, value}) => `${field}: ${value}`).join('\n');

  return `
name: ${name}
uri: ${uri}
${valuesText}
    `.trim();
}

async function writeResults(results) {
  const finalString = results.map(resultToString).join('\n\n');

  const timestamp = moment().format(scrapConfig.timeFormat);

  const fileName = scrapConfig.output.replaceAll('$TIME', timestamp);

  await fs.writeFile(fileName, finalString);

  console.log(finalString);
  console.log();
  console.log('>>>> File saved: ' + fileName);
}


async function readDevices({devices, sourceAction}) {
  const resultPromises = devices.map(async (device) => {
    const text = await sourceAction(device.uri);
    const root = parse(text);
    const tds = root.querySelectorAll('td');

    const values = device.fields.map(field => {
      const titleIndex = tds.findIndex(td => td.text.trim() === field);
      const value = tds[titleIndex + 1].text;
      return {field, value};
    })

    return {
      name: device.name,
      uri: device.uri,
      values: values,
    };
  });

  const results = await Promise.all(resultPromises);

  await writeResults(results);
}

async function main() {
  try {
    await readDevices({
      devices: scrapConfig.devices,
      sourceAction: scrapConfig.network ? getValueFromPage : getValueFromFile,
    });
  } catch (error) {
    console.log('An error happened:')
    console.log(error);
  }
}

void main();