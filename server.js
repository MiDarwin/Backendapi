const express = require("express");
const bodyParser = require("body-parser");
const apiRoutes = require("./api/index");
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://scienly257:a1a2a3@cluster0.1kwhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

async function createClient(collection, userName) {
  const existingUser = await collection.findOne({ name: userName });

  if (existingUser) {
    console.log("Bu isim daha önce alinmiş!");
  } else {
    const newDocument = {
      name: userName,
      score: 0,
    };
    const result = await collection.insertOne(newDocument);
    console.log("Yeni Kullanici Eklendi", result);
  }
}
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use("/api", apiRoutes); // '/api' prefixi ile API isteklerini yönlendiriyoruz

app.listen(port, () => {
  console.log(`Server çalışıyor: http://localhost:${port}`);
});
async function setScore(collection, userName, newScore) {
  const result = await collection.updateOne(
    { name: userName },
    { $set: { score: newScore } }
  );

  if (result.matchedCount > 0) {
    console.log("Puan başarili bir şekilde değişti");
  } else {
    console.log("Puan değiştirilmedi, bu isimde kullanıcı yok");
  }
}

async function getScore(collection, userName) {
  const existingUser = await collection.findOne({ name: userName });
  if (existingUser === null) {
    console.log("Bu isimde bir kullanici yok");
  } else {
    console.log(userName + " score: " + existingUser.score);
  }
}

async function topScore(collection) {
  const cursor = collection.find({}).sort({ score: -1 });

  let i = 1;
  console.log("Top Scores:");
  await cursor.forEach((user) => {
    console.log(`${i}. ${user.name} - Score: ${user.score}`);
    i++;
  });
}

async function main() {
  const client = new MongoClient(uri, {});
  const database = client.db("gameBase");
  const collection = database.collection("game");

  try {
    await client.connect();
    //await createClient(collection, "Fatma");
    //await setScore(collection, "Fatma", 80);
    //await getScore(collection, "Ahme");
    await topScore(collection);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
module.exports = getScore;
