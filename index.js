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
    res.send("It' Working!");
  })

  // Add information of users
  app.post('/addInfo', (req, res) => {
    const info = req.body;
    usersCollection.insertOne(info)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  // load all users data form database
  app.get('/users', (req, res) => {
    usersCollection.find({})
    .toArray( (err, result) => {
      res.send(result);
    })
  })

  // Load a user data by id from database
  app.post('/userData', (req, res) => {
    const id = req.body.id;
    usersCollection.find({_id: ObjectId(id)})
      .toArray( (err, result) => {
        res.send(result[0]);
      })
  })

  // Load search data form database
  app.post('/searchUser', (req, res) => {
    const searchData = req.body.search;
    usersCollection.find({ $or: [{name: new RegExp(searchData, 'i')}, {locality: new RegExp(searchData, 'i')}] })
        .toArray((err, documents) => {
            res.send(documents);
        })
})

  // load reports data
  app.get('/reports', (req, res) => {
    let ageTotal = [];

    usersCollection.find({ $and: [{ age: {$gt: '12'}} , {age: {$lt: '18'}}]})
    .toArray((err, documents) => {
      let age13 = documents.length;
      ageTotal.push(age13);
    })

    usersCollection.find({ $and: [{ age: {$gt: '17'}} , {age: {$lt: '26'}}]})
    .toArray((err, documents) => {
      let age18 = documents.length;
      ageTotal.push(age18);
    })


    usersCollection.find({ age: {$gt: '25'}})
    .toArray((err, documents) => {
      let age25 = documents.length;
      ageTotal.push(age25);
      console.log(ageTotal);
      res.send({age13To17: ageTotal[0], age18To25: ageTotal[1], age25Plus: ageTotal[2]});
    })
    
  })

  // load locality and profession with group by from database
  app.get('/localityAndProfession', (req, res) => {
    let container = [];
    usersCollection.aggregate([
      {$group: {_id: "$locality", count: {$sum: 1}}}
    ])
    .toArray( (err, result) => {
      container.push(result);
    })

    usersCollection.aggregate([
      {$group: {_id: "$profession", count: {$sum: 1}}}
    ])
    .toArray( (err, result) => {
      container.push(result);
      res.send(container);
    })
  })

});

app.listen(process.env.PORT || port);