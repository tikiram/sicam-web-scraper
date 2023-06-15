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
  const finalString = results
      .filter(Boolean)
      .map(resultToString)
      .join('\n\n');

  const timestamp = moment().format(scrapConfig.timeFormat);

  const fileName = scrapConfig.output.replaceAll('$TIME', timestamp);

  await fs.writeFile(fileName, finalString);

  console.log();
  console.log('Results:');
  console.log();
  console.log(finalString);
  console.log();
  console.log('>>>> File saved: ' + fileName);
}

function serializeConfig(fieldConfig) {
  const isConfText = typeof fieldConfig === 'string'
  const field = isConfText ? fieldConfig : fieldConfig.name;
  const valueCellOffset = isConfText? 1 : fieldConfig.valueCellOffset;
  return { field, valueCellOffset };
}

function getValues(device, domCells) {
  const values = device.fields.map(fieldConfig => {
    const { field, valueCellOffset } = serializeConfig(fieldConfig);

    const titleIndex = domCells.findIndex(td => td.text.trim() === field);

    if (titleIndex === -1) {
      return undefined;
    }

    const value = domCells[titleIndex + valueCellOffset].text;
    return { field, value };
  })
  return values.filter(Boolean);
}

async function fetchResource(fetcher, uri, retriesOnError, timeIntervalOnError) {
  for(let i = 0; i < retriesOnError; i++){
    try {
      return await fetcher(uri);
    }
    catch (e) {
      await new Promise(r => setTimeout(r, timeIntervalOnError));
      console.log('Error getting resource:', uri);
    }
  }
  return undefined;
}

async function readDevices({ devices, sourceAction, retriesOnError, timeIntervalOnError }) {
  const resultPromises = devices.map(async (device) => {
    const text = await fetchResource(sourceAction, device.uri, retriesOnError, timeIntervalOnError);

    if (text === undefined) {
      return undefined;
    }

    const root = parse(text);
    const tds = root.querySelectorAll('td');

    const values = getValues(device, tds);

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
      retriesOnError: scrapConfig.onError.retries,
      timeIntervalOnError: scrapConfig.onError.timeInterval,
    });
  } catch (error) {
    console.log('An error happened:')
    console.log(error);
  }
}

void main();