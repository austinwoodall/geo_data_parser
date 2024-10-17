const mongoose = require("mongoose");
const { Schema } = mongoose;

// Flexible GeoJSON schema
const postCodeJSONSchema = new Schema(
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
  { collection: "postal_codes" }
);

// Create the model
const PostalCodeGeoJSON = mongoose.model(
  "PostalCodeGeoJSON",
  postCodeJSONSchema
);

module.exports = PostalCodeGeoJSON;
