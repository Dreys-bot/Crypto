// server.js
const express = require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

// Remplace par ton URI MongoDB Atlas
const MONGODB_URI = "mongodb+srv://fdagentai:Dr5elNKwoUJDQmGa@forecasting.yrkr0.mongodb.net/?retryWrites=true&w=majority&appName=forecasting"

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connecté"))
.catch(err => console.error("Erreur MongoDB", err))

// Schéma utilisateur
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
})

const User = mongoose.model("User", UserSchema)

// Route SIGNUP
app.post("/signup", async (req, res) => {
    const { email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Utilisateur déjà existant" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ email, password: hashedPassword })

    await newUser.save()
    return res.status(201).json({ success: true, message: "Utilisateur créé avec succès" })
})

// Route LOGIN
app.post("/login", async (req, res) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
        return res.status(400).json({ success: false, message: "Utilisateur introuvable" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Mot de passe incorrect" })
    }

    return res.json({ success: true, message: "Connexion réussie" })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`)
})
