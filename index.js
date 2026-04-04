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
  // app.post("/iftarData", async (req, res) => {
  //   try {
  //     const { district, upazila, mosque, iftar, description } = req.body;
  //     // MongoDB driver expects plain JS object
  //     const newIftar = {
  //       district,
  //       upazila,
  //       mosque,
  //       iftar,
  //       description,
  //       createdAt: new Date(), // auto add today date
  //     };
  //     const result = await iftarCollection.insertOne(newIftar);

  //     res.status(201).send({
  //       message: "Iftar added successfully",
  //       data: result,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send({ error: "Failed to insert data" });
  //   }
  // });



  
  
app.post("/iftarData", async (req, res) => {
  try {
    const { district, upazila, mosque, iftar, description } = req.body;

    // Full address বানানো
    const address = `${mosque}, ${upazila}, ${district}, Bangladesh`;

    // Geocoding API call
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );
    const geoData = await geoRes.json();

    const lat = parseFloat(geoData[0]?.lat || 24.8093); // default
    const lng = parseFloat(geoData[0]?.lon || 88.9406); // default

    const newIftar = {
      district,
      upazila,
      mosque,
      iftar,
      description,
      lat,
      lng,
      createdAt: new Date(),
    };

    const result = await iftarCollection.insertOne(newIftar);
    res.status(201).send(result);
  } catch (error) {
    console.error(error);
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



  app.get("/iftarSearch", async (req, res) => {

  const search = req.query.search;

  const query = {
    $or: [
      { district: { $regex: search, $options: "i" } },
      { upazila: { $regex: search, $options: "i" } },
      { mosque: { $regex: search, $options: "i" } }
    ]
  };

  const result = await iftarCollection.find(query).toArray();

  res.send(result);
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
