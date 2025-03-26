require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const { nanoid } = require("nanoid");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// MongoDB Verbindung
mongoose.connect("mongodb://127.0.0.1:27017/fileupload", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Datenbank-Schema
const fileSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    size: Number,
    shortId: String,
    uploadDate: { type: Date, default: Date.now },
    expireAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Löscht Datei nach 7 Tagen
});

const File = mongoose.model("File", fileSchema);

// Multer für Datei-Uploads
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueName = nanoid(8) + path.extname(file.originalname);
        cb(null, uniqueName);
    },
});

const upload = multer({ storage });

// Statische Dateien (Frontend)
app.use(express.static("public"));

// Datei hochladen
app.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) return res.status(400).send("❌ Keine Datei hochgeladen!");

    const newFile = new File({
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        shortId: nanoid(6),
    });

    await newFile.save();
    res.send(`/download/${newFile.shortId}`);
});

// Datei abrufen (Download)
app.get("/download/:shortId", async (req, res) => {
    const file = await File.findOne({ shortId: req.params.shortId });

    if (!file) return res.status(404).send("❌ Datei nicht gefunden!");

    const filePath = path.join(__dirname, "uploads", file.filename);
    res.download(filePath, file.originalName);
});

// Starte den Server
app.listen(PORT, () => console.log(`🚀 Server läuft auf http://localhost:${PORT}`));
