const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");  // ✅ New import

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/beautybaby", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// ✅ Schema & Models
const ContactSchema = new mongoose.Schema({
  name: String,
  email: String,
  service: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", ContactSchema);

// ✅ Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Gmail use kar rahe ho
  auth: {
    user: "abhyu2325@gmail.com",  // ✅ apna Gmail dalna
    pass: "urkm eold cycq fxxp"     // ✅ Gmail ka App Password (normal password nahi chalega)
  }
});

// ✅ Routes
app.post("/api/contact", async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    // Save to MongoDB
    const newContact = new Contact({ name, email, service, message });
    await newContact.save();

    // Send Email Notification
    const mailOptions = {
      from: email,
      to: "nishadamit7256@gmail.com",   // ✅ Jisme mail receive karna hai
      subject: `New Appointment from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Service: ${service}
        Message: ${message}
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, msg: "Message saved & email sent successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Error saving data or sending email", error: err });
  }
});

app.get("/api/contacts", async (req, res) => {
  const contacts = await Contact.find();
  res.json(contacts);
});

// ✅ Run Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
