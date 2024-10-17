const { parentPort, workerData } = require("worker_threads");
const fs = require("fs");
const tj = require("@tmcw/togeojson");
const path = require("path");
const { DOMParser } = require("xmldom");

try {
  const kmlContent = fs.readFileSync(workerData.filepath, { encoding: "utf8" });
  console.log(`File read successfully: ${workerData.filepath}`);

  const parsedData = new DOMParser().parseFromString(kmlContent, "text/xml");
  console.log(`File parsed successfully: ${workerData.filepath}`);

  const converted = tj.kml(parsedData, { styles: false });

  // fs.writeFileSync( + ".json", converted);
  // console.log("Finished parsing data");

  parentPort.postMessage({
    geojson: converted,
    file: path.parse(workerData.filepath).name,
  });
} catch (err) {
  console.log(`Error in worker for file: ${workerData.filePath}`, err.message);
  parentPort.postMessage({ error: err.message });
}
