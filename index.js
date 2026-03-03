const express = require("express");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const PORT = process.env.PORT;

// middlewares
// app.use(cors());       // allow requests from frontend
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

  app.post("/divisionData", async (req, res) => {
    const data = req.body;
    const result = await divisionCollection.insertOne(data);
    res.send(result).status(500).send({ error: "Failed to insert data" });
  });

  // get all division data
  // app.get("/divisionData", async (req, res) => {
  //   try {
  //     const divisions = await divisionCollection.find().toArray(); // fetch all
  //     res.send(divisions);
  //   } catch (error) {
  //     res.status(500).send({ error: "Fetch failed" });
  //   }
  // });

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
