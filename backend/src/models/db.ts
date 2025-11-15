/**
 * Abstraction to connect to the MongoDB database using Mongoose.
 */

import mongoose from "mongoose";

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://user:pass@localhost:27017/crawlr?authSource=admin";

mongoose.connect(MONGO_URI, {
  useUnifiedTopology: true,
});

// Listen for successful/failed connection (optional/logging purposes)
mongoose.connection.on("connected", () => {
  console.log("Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

export default mongoose;