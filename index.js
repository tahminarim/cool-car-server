const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express()
const port = process.env.PORT || 1000

// middlewares
app.use(cors())
app.use(express.json())

// mongo db 

const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  const usersCollection = client.db('coolCarUserDB').collection('users')
  try {

    // users read data
    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    })

    // data  for users
    app.post('/users', async (req, res) => {
      const user = req.body;
      //console.log(user);
      const result = usersCollection.insertOne(user);
      res.send(result);

      //products
      

    })
  }
  finally {
  }
}

run().catch(err => console.error(err))


app.get('/', (req, res) => {
  res.send('Cool Car Server Is Running !')
})

app.listen(port, () => {
  console.log(`Cool Car Server Is Running On ${port}`)
})