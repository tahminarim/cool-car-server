const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const app = express()
const port = process.env.PORT || 1000

// middlewares
app.use(cors())
app.use(express.json())

// mongo db 

const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  // console.log(authHeader)

  console.log('jwt inside token', req.headers.authorization)
  if (!authHeader) {
    return res.status(401).send('not authorized ');
  }

  const token = authHeader.split(' ')[1];
  //console.log(token)
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      console.log(err)
      return res.status(403).send({ message: 'access-forbidden ' })

    }
    // console.log(err)
    req.decoded = decoded;
    console.log('rq decode is', req.decoded)
    next();
  })

}


async function run() {
  try {
    const usersCollection = client.db('coolCarUserDB').collection('users')
    const productsCollection = client.db('coolCarUserDB').collection('products')
    const electricCarCollection = client.db('coolCarUserDB').collection('electric')
    const hybridCarCollection = client.db('coolCarUserDB').collection('hybrid')

    const essenceCarCollection = client.db('coolCarUserDB').collection('essence')
    const bookingCollection = client.db('coolCarUserDB').collection('booking')


    //jwt

    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      //console.log(email)
      const query = { email: email };
      //console.log(query)
      const user = await usersCollection.findOne(query);
      //console.log(user)
      if (user) {
        //console.log(user)
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '200h' });
        console.log(token)
        return res.send({ accessToken: token });
      }
      //console.log(user)
      else {
        res.status(403).send({ accessToken: '' })
      }

    })

    //verfy admin
    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await usersCollection.findOne(query);

      if (user?.role !== 'Admin') {
        return res.status(403).send({ message: 'forbidden access' })
      }
      next();
    }

    //verfy admin
    app.get('/users/admin/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email }
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === 'Admin' });
  })

      //verfy buyer
      app.get('/users/buyer/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email }
        const user = await usersCollection.findOne(query);
        res.send({ isBuyer: user?.role === 'Buyer' });
    })

        //verfy seller
        app.get('/users/seller/:email', async (req, res) => {
          const email = req.params.email;
          const query = { email }
          const user = await usersCollection.findOne(query);
          res.send({ isSeller: user?.role === 'Seller' });
      })



    //user udate
    app.put('/users/admin/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          verify: 'verifieduser'
        }
      }
      const result = await usersCollection.updateOne(filter, updatedDoc, options);
      res.send(result);
    })


    // app.put('/allproducts/:email', async (req, res) => {
    //   const email = req.params.id;
    //   const filter = { _id: ObjectId(id) }
    //   const options = { upsert: true };
    //   const updatedDoc = {
    //     $set: {
    //       verify: 'verifieduser'
    //     }
    //   }
    //   const result = await productsCollection.updateOne(filter, updatedDoc, options);
    //   res.send(result);
    // })
 


    // users read data
    app.get('/users', async (req, res) => {
      const email = req.query.email;
      //console.log('token',req.headers.authorization)
      const cursor = usersCollection.find({});
      //  console.log('token is users is', req.headers.authorization)
      const users = await cursor.toArray();
      res.send(users);
    })

    // data  for users
    app.post('/users', async (req, res) => {
      const user = req.body;
      //console.log(user);
      const result = usersCollection.insertOne(user);
      res.send(result);

    })


    app.get('/allproducts', async (req, res) => {
      const query = {};
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    })


    // products with jwt
    app.get('/allproducts', verifyJWT, async (req, res) => {
      const email = req.query.email;
      console.log(email)
      const decodedEmail = req.decoded.email;
      console.log(decodedEmail)
      if (email !== decodedEmail) {
        return res.status(403).send({ message: 'access-forbidden' });
      }
      const query = { email: email };
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    })

    app.post('/products', async (req, res) => {
      const product = req.body;
      // console.log(product)
      const result = await productsCollection.insertOne(product);
      res.send(result);
    })


    //electriccars api
    app.get('/electriccar', async (req, res) => {
      const query = {};
      const products = await electricCarCollection.find(query).toArray();
      res.send(products);
    })
    app.post('/electriccar', async (req, res) => {
      const product = req.body;
      // console.log(product)
      const result = await electricCarCollection.insertOne(product);
      res.send(result);
    })


    //hybrid cars
    app.get('/hybridcar', async (req, res) => {
      const query = {};
      const products = await hybridCarCollection.find(query).toArray();
      res.send(products);
    })

    app.post('/hybridcar', async (req, res) => {
      const product = req.body;
      // console.log(product)
      const result = await hybridCarCollection.insertOne(product);
      res.send(result);
    })

    //essence car
    app.get('/essencecar', async (req, res) => {
      const query = {};
      const products = await essenceCarCollection.find(query).toArray();
      res.send(products);
    })

    app.post('/essencecar', async (req, res) => {
      const product = req.body;
      // console.log(product)
      const result = await essenceCarCollection.insertOne(product);
      res.send(result);
    })



    //booking

    app.post('/booking', async (req, res) => {
      const booking = req.body;
      // console.log(booking)
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    })


// product delete
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
      res.send(result);
    })

       // user delate

       app.delete('/users/:id', async (req, res) => {
         const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result1 = await usersCollection.deleteOne(filter);
        res.send(result1);
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