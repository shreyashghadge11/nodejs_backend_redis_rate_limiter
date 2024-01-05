const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const Note = require("./models/notes");
const app = express();
const PORT = process.env.PORT || 3000;

const { MONGO_URI } = require("./config/index");
const { initializeRedis } = require("./config/redisClient");

app.use(bodyParser.json());
app.use(cors());

// Import Routes
const authRoute = require("./routes/auth");
const notesRoute = require("./routes/notes");
const searchRoute = require("./routes/search");

//Initializing Redis Client for rate limiting
(async () => {
  initializeRedis();
})();

// Route Middlewares
app.use("/api/auth", authRoute);
app.use("/api/notes", notesRoute);
app.use("/api/search", searchRoute);

// Connect to DB
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    // Ensure indexes
    return Note.ensureIndexes();
  })
  .then(() => console.log("Connected to DB and ensured indexes"))
  .catch((err) => {
    console.log(`DB Connection Error: ${err.message}`);
  });

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
