const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
require("dotenv").config();

const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/cybersec";

mongoose
  .connect(mongoURI)
  .then(() => {
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
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    year: { type: Number, required: true },
    message: { type: String }
  });
  
  const Join = mongoose.model("Join", joinSchema);
  
  router.post('/join', async (req, res) => {
    console.log('Received join request:', req.body);
  
    try {
      const {
        name,
        email,
        phone,
        department,
        year,
        message
      } = req.body;
  
      // Validate required fields
      if (!name || !email || !phone || !department || !year) {
        console.log('Validation failed: Missing required fields');
        return res
          .status(400)
          .json({ message: 'Name, email, phone, department, and year are required fields.' });
      }
  
      // Ensure year is a number
      const yearNumber = parseInt(year, 10);
      console.log('Parsed year:', yearNumber);
  
      if (isNaN(yearNumber)) {
        console.log('Validation failed: Invalid year provided');
        return res.status(400).json({ message: 'Invalid year provided.' });
      }
  
      // Create a new Join instance with the data
      const newJoin = new Join({
        name,
        email,
        phone,
        department,
        year: yearNumber,
        message
      });
  
      console.log('Attempting to save:', newJoin);
  
      // Save the join request to MongoDB
      await newJoin.save();
      console.log('Join request saved successfully');
      res.status(200).json({ message: 'Application submitted successfully!' });
  
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
      res.status(500).json({ message: 'Failed to submit application.', error: error.message });
    }
  });

router.get("/", (req, res) => {
  res.render("home");
});

router.get("/blog", (req, res) => {
  res.render("blog-page");
});

router.get("/resources", (req, res) => {
  res.render("resources-page");
});

router.get("/joinus", (req, res) => {
  res.render("joinus-page");
});

router.get("/artical", (req, res) => {
  res.render("artical-page"); 
});

const articleSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date
});

const Article = mongoose.model('Article', articleSchema);

router.post('/submit-article', async (req, res) => {
  const { title, description, date } = req.body;

  const newArticle = new Article({
    title,
    description,
    date
  });

  try {
    await newArticle.save();
    res.redirect('/blog');
  } catch (err) {
    console.error('Error saving article:', err);
    res.status(500).send('Error saving article.');
  }
});

router.post("/send-email", (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rohanunbeg0918@gmail.com",
      pass: "wcbp fqdo prxm jwmm",
    },
  });

  const mailOptions = {
    from: email,
    to: "rohanunbegfreelance@gmail.com",
    subject: `Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).send("Error sending email");
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).send("Message sent successfully");
    }
  });
});

module.exports = router;
