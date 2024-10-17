const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const stream = require('stream');
const unzipper = require('unzipper');

const pipeline = promisify(stream.pipeline);

const url = 'https://www2.census.gov/geo/tiger/GENZ2014/kml/';
const outputDir = 'census_kml_files';

async function downloadAndUnzipFile(fileUrl, outputPath) {
  try {
    console.log(`Downloading: ${path.basename(fileUrl)}`);
    const response = await axios({
      url: fileUrl,
      method: 'GET',
      responseType: 'stream',
    });

    await pipeline(response.data, unzipper.Extract({ path: outputPath }));

    console.log(
      `Successfully downloaded and extracted: ${path.basename(fileUrl)}`,
    );
  } catch (error) {
    console.error(`Error processing ${fileUrl}: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
    }
  }
}

async function getFileLinks(url) {
  try {
    console.log(`Fetching directory listing from ${url}`);
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const links = $('a')
      .map((i, el) => $(el).attr('href'))
      .get()
      .filter((href) => href.endsWith('.zip'))
      .map((href) => new URL(href, url).href);
    console.log(`Found ${links.length} ZIP files`);
    return links;
  } catch (error) {
    console.error(`Error fetching file list: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
    }
    return [];
  }
}

async function downloadAndExtractAllFiles() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
    console.log(`Created output directory: ${outputDir}`);
  }

  try {
    const fileLinks = await getFileLinks(url);
    if (fileLinks.length === 0) {
      console.log(
        'No ZIP files found to download. Check if the directory listing is accessible.',
      );
      return;
    }

    for (const fileUrl of fileLinks) {
      await downloadAndUnzipFile(fileUrl, outputDir);
    }

    console.log('All files processed.');
  } catch (error) {
    console.error('An unexpected error occurred:', error.message);
  }
}

downloadAndExtractAllFiles();
