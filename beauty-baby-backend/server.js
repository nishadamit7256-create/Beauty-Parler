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

// ====== NEW: User Auth (Register/Login) ======
const bcrypt = require("bcrypt");

// ==== ADD USER SCHEMA & MODEL (below Contact model) ====
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", UserSchema);

// ==== AUTH ROUTES ====

// Register
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, msg: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, msg: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: hash });

    // Send email to admin
    await transporter.sendMail({
      from: "abhyu2325@gmail.com",
      to: "nishadamit7256@gmail.com",
      subject: `New Registration: ${name}`,
      text: `A new user registered.\nName: ${name}\nEmail: ${email}`
    });

    // Optionally send welcome email to user
    await transporter.sendMail({
      from: "abhyu2325@gmail.com",
      to: email,
      subject: "Welcome to Beauty Baby",
      text: `Hi ${name}, your account has been created successfully!`
    });

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Registration error", error: err });
  }
});

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, msg: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ success: false, msg: "Invalid email or password" });

    // Send email to admin on login (optional)
    try {
      await transporter.sendMail({
        from: "abhyu2325@gmail.com",
        to: "nishadamit7256@gmail.com",
        subject: `User Login: ${user.name}`,
        text: `User logged in.\nName: ${user.name}\nEmail: ${user.email}\nTime: ${new Date().toLocaleString()}`
      });
    } catch (e) {
      console.warn("Login email failed:", e.message);
    }

    res.json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Login error", error: err });
  }
});

// Reset Password
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, msg: "Email and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Email notifications
    try {
      await transporter.sendMail({
        from: "abhyu2325@gmail.com",
        to: email,
        subject: "Password Changed",
        text: `Hi ${user.name}, your password was changed successfully.`
      });
      await transporter.sendMail({
        from: "abhyu2325@gmail.com",
        to: "nishadamit7256@gmail.com",
        subject: `Password Reset: ${user.name}`,
        text: `User reset password.\nName: ${user.name}\nEmail: ${user.email}`
      });
    } catch (e) {
      console.warn("Reset email failed:", e.message);
    }

    res.json({ success: true, msg: "Password updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, msg: "Reset error", error: err });
  }
});