const mongoose = require("mongoose");
const { Schema } = mongoose;

// Flexible GeoJSON schema
const countiesJSONSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    geometry: {
      type: {
        type: String,
        required: true,
      },
      coordinates: [[[Number]]],
    },
    properties: {
      type: Schema.Types.Mixed, // Allows dynamic key-value pairs
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
  },
  { collection: "counties" }
);

// Create the model
const CountiesGeoJSON = mongoose.model("CountiesGeoJSON", countiesJSONSchema);

module.exports = CountiesGeoJSON;
