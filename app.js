// app.js
const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");

// Set the view engine to EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files (e.g., CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Import and use routes
const pageRoutes = require("./routes/pageRoutes");

// Middleware for JSON payloads
app.use(express.json());

// Middleware for URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.use("/", pageRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
