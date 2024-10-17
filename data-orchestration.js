const { Worker } = require("worker_threads");
const path = require("path");
const mongoose = require("mongoose");

const CountryGeoJSON = require("./schemas/country.schema");
const StateGeoJSON = require("./schemas/states.schema");
const CountiesGeoJson = require("./schemas/counties.schema");
const PostalCodesGeoJson = require("./schemas/postal-codes.schema");

const mongoURI = "mongodb://localhost:27017/geo_data";

// Function to parse KML files using worker threads
function parseKmlFiles(filepath) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, "./parseKMLWorker.js"), {
      workerData: { filepath },
    });

    worker.on("message", (message) => {
      resolve({ geojson: message.geojson, file: filepath }); // Return geojson data and file name
    });
    worker.on("error", reject); // Reject the promise if there's an error
    worker.on("exit", (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

// File paths for KML files
const filesToParse = [
  "./census_kml_files/cb_2014_us_nation_5m.kml",
  "./census_kml_files/cb_2014_us_state_500k.kml",
  "./census_kml_files/cb_2014_us_county_500k.kml",
  "./census_kml_files/cb_2014_us_zcta510_500k.kml",
];

(async () => {
  try {
    // Establish connection to MongoDB once
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    // Parse the KML files
    const parsePromises = filesToParse.map(parseKmlFiles);
    const parsedData = await Promise.all(parsePromises);

    // Iterate over the parsed data and save it in MongoDB
    for (const data of parsedData) {
      if (data.geojson.features[0].id.includes("nation")) {
        const countryGeoJsonDoc = new CountryGeoJSON({
          type: data.geojson.type,
          features: data.geojson.features,
        });

        await countryGeoJsonDoc.save();
      }
      if (data.geojson.features[0].id.includes("state")) {
        for (const feature of data.geojson.features) {
          const stateGeoJsonDoc = new StateGeoJSON({
            type: feature.type,
            geometry: {
              type: feature.geometry.type,
              coordinates: feature.geometry.coordinates,
            },
            properties: feature.properties,
            id: feature.id,
          });
          // Save the document to MongoDB
          await stateGeoJsonDoc.save();
        }
      }

      if (data.geojson.features[0].id.includes("county")) {
        for (const feature of data.geojson.features) {
          const countiesGeoJsonDoc = new CountiesGeoJson({
            type: feature.type,
            geometry: feature.geometry,
            properties: feature.properties,
            id: feature.id,
          });
          // Save the document to MongoDB
          await countiesGeoJsonDoc.save();
        }
      }

      if (data.geojson.features[0].id.includes("zcta510")) {
        for (const feature of data.geojson.features) {
          const postalCodesGeoJsonDoc = new PostalCodesGeoJson({
            type: feature.type,
            geometry: feature.geometry,
            properties: feature.properties,
            id: feature.id,
          });
          // Save the document to MongoDB
          await postalCodesGeoJsonDoc.save();
        }
      }
    }

    // Close the MongoDB connection after all operations are done
    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error parsing files or saving to MongoDB:", error);
  }
})();
