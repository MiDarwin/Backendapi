const express = require("express");
const { MongoClient } = require("mongodb");
const getScore = require("../server");

const router = express.Router();
const uri =
  "mongodb+srv://scienly257:a1a2a3@cluster0.1kwhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {});
const database = client.db("gameBase");
const collection = database.collection("game");

async function createClient(userName) {
  const existingUser = await collection.findOne({ name: userName });

  if (existingUser) {
    throw new Error("Bu isim daha önce alınmış!");
  } else {
    const newDocument = { name: userName, score: 0 };
    await collection.insertOne(newDocument);
  }
}

async function setScore(userName, newScore) {
  const result = await collection.updateOne(
    { name: userName },
    { $set: { score: newScore } }
  );
  if (result.matchedCount === 0) {
    throw new Error("Puan değiştirilmedi, bu isimde kullanıcı yok");
  }
}

async function getScores() {
  return collection.find({}).sort({ score: -1 }).toArray();
}

router.post("/create", async (req, res) => {
  const { userName } = req.body;
  try {
    await createClient(userName);
    res.status(201).send("Kullanıcı başarıyla oluşturuldu");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.post("/score", async (req, res) => {
  const { userName, score } = req.body;
  try {
    await setScore(userName, score);
    res.send("Puan başarıyla güncellendi");
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.get("/scores", async (req, res) => {
  try {
    const scores = await getScores();
    res.json(scores);
  } catch (error) {
    res.status(500).send("Bir hata oluştu");
  }
});

module.exports = router;
