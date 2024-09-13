// routes/pageRoutes.js
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const request = require("request");
const xml2js = require("xml2js");
const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/cybersec";

mongoose
  .connect(mongoURI)
  .then(() => {
    // Check if the connection is to a cloud MongoDB or local MongoDB
    if (process.env.MONGODB_URI) {
      console.log("Successfully connected to the cloud MongoDB");
    } else {
      console.log("Successfully connected to the local MongoDB");
    }
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
const joinSchema = new mongoose.Schema({
  name: String,
  email: String,
  year: Number,
  message: String,
});

const Join = mongoose.model("Join", joinSchema);

router.post("/join", async (req, res) => {
  console.log("Received join request:", req.body);
  try {
    const { name, email, year, message } = req.body;

    if (!name || !email || !year) {
      return res
        .status(400)
        .json({ message: "Name, email, and year are required fields." });
    }

    const newJoin = new Join({ name, email, year: parseInt(year), message });
    console.log("Attempting to save:", newJoin);

    await newJoin.save();
    console.log("Join request saved successfully");
    res.status(200).json({ message: "Application submitted successfully!" });
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    res
      .status(500)
      .json({ message: "Failed to submit application.", error: error.message });
  }
});

router.get("/", (req, res) => {
  res.render("home");
});

router.get("/blog", (req, res) => {
  // Render the blog page with the posts
  res.render("blog-page");
});
router.get("/resources", (req, res) => {
  res.render("resources-page");
});
router.get("/joinus", (req, res) => {
  res.render("joinus-page");
});

router.get("/medium-feed", (req, res) => {
  const mediumFeedUrl = "https://medium.com/feed/@Cyb3rsecurity";

  // Fetch the Medium RSS feed
  request(mediumFeedUrl, (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const parser = new xml2js.Parser();

      // Parse the RSS feed
      parser.parseString(body, (err, result) => {
        if (err) {
          return res.status(500).send("Error parsing RSS feed");
        }

        // Check if the expected structure is present
        const posts = result?.rss?.channel?.[0]?.item;
        if (!posts || posts.length === 0) {
          return res.status(500).send("No blog posts found");
        }

        // Map over the blog posts and render them
        const blogPosts = posts.map((post) => {
          const title = post.title?.[0] || "No title available";
          const link = post.link?.[0] || "#";
          const pubDate = post.pubDate?.[0] || "No date available";
          return { title, link, pubDate };
        });

        // Send blog posts to the template or response
        res.json({ blogPosts });
      });
    } else {
      res.status(500).send("Error fetching Medium RSS feed");
    }
  });
});

router.post("/submit-join-form", async (req, res) => {
  console.log("Request Body:", req.body);
  const { name, email, message } = req.body;

  try {
    if (!fs.existsSync(dataFolderPath)) {
      fs.mkdirSync(dataFolderPath, { recursive: true });
      console.log("Data folder created.");
    }

    let workbook;
    let sheet;
    if (fs.existsSync(filePath)) {
      // Load existing workbook
      workbook = XLSX.readFile(filePath);
      console.log("Existing file loaded.");
      sheet =
        workbook.Sheets["Join Requests"] ||
        XLSX.utils.json_to_sheet([], { header: ["Name", "Email", "Message"] });
    } else {
      // Create new workbook and sheet
      console.log("No file found, creating a new one.");
      sheet = XLSX.utils.json_to_sheet([], {
        header: ["Name", "Email", "Message"],
      });
      workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, sheet, "Join Requests");
    }

    // Add new row to the sheet
    const newRow = { Name: name, Email: email, Message: message };
    XLSX.utils.sheet_add_json(sheet, [newRow], {
      header: ["Name", "Email", "Message"],
      skipHeader: true,
      origin: -1,
    });

    // Save the workbook to file
    XLSX.writeFile(workbook, filePath);
    console.log("File saved successfully.");

    res.send("Form data saved to Excel sheet.");
  } catch (error) {
    console.error("Error saving to Excel:", error);
    res.status(500).send("Failed to save data.");
  }
});

router.post("/send-email", (req, res) => {
  const { name, email, message } = req.body;

  // Configure the transporter for nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail", // or use another email service
    auth: {
      user: "rohanunbeg0918@gmail.com", // replace with your email
      pass: "wcbp fqdo prxm jwmm", // replace with your email password or app-specific password
    },
  });

  // Email options
  const mailOptions = {
    from: email, // sender address
    to: "rohanunbegfreelance@gmail.com", // receiver address
    subject: `Message from ${name}`, // Subject line
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Message sent successfully");
    }
  });
});

module.exports = router;
