// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();

// CORS — autorise ton front Framer
app.use(cors({
  origin: "https://giant-pages-146605.framer.app", 
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// Parse JSON bodies
app.use(express.json());

// Debug route
app.get("/", (_req, res) => {
  res.send("✅ API opérationnelle");
});

// MongoDB
const MONGODB_URI = "mongodb+srv://fdagentai:Dr5elNKwoUJDQmGa@forecasting.yrkr0.mongodb.net/your-db?retryWrites=true&w=majority";
mongoose.connect(MONGODB_URI)
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.error("Erreur MongoDB", err));

// User model
const User = mongoose.model("User", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}));

// SIGNUP
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Champs manquants" });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(400).json({ success: false, message: "Utilisateur déjà existant" });
  }
  const hash = await bcrypt.hash(password, 10);
  await new User({ email, password: hash }).save();
  res.status(201).json({ success: true, message: "Compte créé avec succès" });
});

// LOGIN
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Champs manquants" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "Utilisateur introuvable" });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
  }
  res.json({ success: true, message: "Connexion réussie" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
