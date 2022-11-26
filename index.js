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
  
  console.log('jwt inside token',req.headers.authorization)
  if (!authHeader) {
    return res.status(401).send('unauthorized access');
}

const token = authHeader.split(' ')[1];

jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
        return res.status(403).send({ message: 'forbidden access' })
    }
    req.decoded = decoded;
    next();
})

}


async function run() {
  try {
    const usersCollection = client.db('coolCarUserDB').collection('users')
    const productsCollection = client.db('coolCarUserDB').collection('products')


    //jwt

    app.get('/jwt', async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '20' });
        return res.send({ accessToken: token });
      }
      console.log(user)
      res.status(403).send({ accessToken: '' })
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


    // users read data
    app.get('/users', async (req, res) => {
      const email = req.query.email;
      //console.log('token',req.headers.authorization)
      const cursor = usersCollection.find({});
     console.log('token is users is',req.headers.authorization)
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


    app.get('/allproducts/:fuel', async (req, res) => {
      
      const fuel = req.query.fuel;
      const query={}
      //console.log(query)
      const cars = await productsCollection.find(query).toArray();
       const carQuery={Hybrid: fuel}
       const hybridcars= await productsCollection.find(query).toArray();
       console.log(hybridcars)
     // const cursor = productsCollection.find(query);
      //const cars = await cursor.toArray();
      // console.log(cars)
      // if(fuel==='Hybrid'){
      //   req.send(cars)
      //   console.log('hybrid cars',cars)
      // }
      //res.send(cars); 
    })

    //products
    // app.get('/allproducts', verifyJWT, async (req, res) => {
    //   const email = req.query.email;
    //   const decodedEmail = req.decoded.email;
    //   if (email !== decodedEmail) {
    //     return res.status(403).send({ message: 'access-forbidden' });
    //   }
    //   const query = { email: email };
    //   const products = await productsCollection.find(query).toArray();
    //   res.send(products);
    // })

    app.post('/products', async (req, res) => {
      const product = req.body;
      // console.log(product)
      const result = await productsCollection.insertOne(product);
      res.send(result);
    })

    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(filter);
      res.send(result);
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