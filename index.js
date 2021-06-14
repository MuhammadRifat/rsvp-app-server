const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const bodyParser = require('body-parser');
const cors = require('cors');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a7xog.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());

const port = 5000


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const usersCollection = client.db(`${process.env.DB_NAME}`).collection("users");
  console.log("database connected");

  app.get('/', (req, res) => {
    res.send("It' Working! Hello");
  })

  app.post('/addInfo', (req, res) => {
    const info = req.body;
    usersCollection.insertOne(info)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.get('/users', (req, res) => {
    usersCollection.find({})
    .toArray( (err, result) => {
      res.send(result);
    })
  })

  // app.post('/users', (req, res) => {
  //   usersCollection.find({})
  //     .toArray( (err, result) => {
  //       console.log(result);
  //     })
  // })

});

app.listen(process.env.PORT || port);