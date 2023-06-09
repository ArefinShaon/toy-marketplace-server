const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wt96dtg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toyCollection = client.db("toyDb").collection("addtoys");

  

    app.get("/addtoys", async (req, res) => {
      const { category, email, sort } = req.query;
      let query = {};
    
      if (category) {
        query = { subCategory: category };
      } else if (email) {
        query = { sellerEmail: email };
      }
    
      const sortOptions = {};
    
      if (sort === "asc") {
        sortOptions.price = 1;
      } else if (sort === "desc") {
        sortOptions.price = -1;
      }
    
      const result = await toyCollection
        .find(query)
        .sort(sortOptions)
        .toArray();
    
      res.send(result);
    });
    
    

    app.get("/addtoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        // Include only the `title` and `imdb` fields in the returned document
        projection: {
          rating: 1,
          price: 1,
          quantity: 1,
          pictureUrl: 1,
          name: 1,
          sellerName: 1,
          sellerEmail: 1,
          description: 1,
        },
      };

      const result = await toyCollection.findOne(query, options);
      res.send(result);
    });

    // post data
    app.post("/addtoys", async (req, res) => {
      const addToy = req.body;
      console.log(addToy);
      const result = await toyCollection.insertOne(addToy);
      res.send(result);
    });

    // Update
    app.put('/addtoys/:id', async(req, res)=>{
      const id = req.params.id;
      const data= req.body;
      console.log(data);
      const filter = {_id:new ObjectId(id)};
      const updateDoc = {
          $set: data
      }
      const result = await toyCollection.updateOne(filter, updateDoc);
      if (result.acknowledged) {
          res.send({ result, success: true })
      }
      else {
          res.send({ success: false, message: 'Something went wrong' })
      }
    })
    
 
    

    // DElete
    app.delete("/addtoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyCollection.deleteOne(query);
      res.send(result);
  })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`Toy Server is running on port ${port}`);
});
