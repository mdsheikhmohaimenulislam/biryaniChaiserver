const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT;

// middlewares
app.use(cors()); // allow requests from frontend
app.use(express.json()); // parse JSON bodies

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.sltbrlg.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  const db = client.db("biryaniChai");
  const divisionCollection = db.collection("divisionData");
  const iftarCollection = db.collection("iftarData");

  app.post("/divisionData", async (req, res) => {
    const data = req.body;
    const result = await divisionCollection.insertOne(data);
    res.send(result).status(500).send({ error: "Failed to insert data" });
  });

  // get all division data
  app.get("/divisionData", async (req, res) => {
    try {
      const divisions = await divisionCollection.find().toArray(); // fetch all
      res.send(divisions);
    } catch (error) {
      res.status(500).send({ error: "Fetch failed" });
    }
  });

  // added iftarData
  app.post("/iftarData", async (req, res) => {
    try {
      const data = req.body;
      const result = await iftarCollection.insertOne(data);
      res.send(result);
    } catch (error) {
      res.status(500).send({ error: "Failed to insert data" });
    }
  });

  // get ifterData.
app.get("/ifterData", async (req, res) => {
  const search = req.query.search;


  let query = {}; // let ব্যবহার করলাম

  if (search) {
    query = {
      $or: [
        { district: { $regex: search, $options: "i" } },
        { upazila: { $regex: search, $options: "i" } },
        { mosque: { $regex: search, $options: "i" } },
      ],
    };
  }

  try {
    const result = await iftarCollection.find(query).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Failed to Fetch" });
  }
});

  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("birYanIChai server working ....");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
