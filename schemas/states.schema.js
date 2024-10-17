const mongoose = require("mongoose");
const { Schema } = mongoose;

// Flexible GeoJSON schema
const stateJSONSchema = new Schema(
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
  { collection: "states" }
);

// Create the model
const StateGeoJSON = mongoose.model("StateGeoJSON", stateJSONSchema);

module.exports = StateGeoJSON;
