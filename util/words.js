'use strict';
const { MongoClient } = require('mongodb');

let words = [];

// read only access
const uri = "mongodb+srv://access:F5qohL9CwriwkNRJ@cluster0.9q6g2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri);
async function run() {
  try {
    console.log('connecting to db');
    await client.connect();
    const database = client.db("taboo");
    words = await database.collection("words").find().toArray();
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

// const fs = require('fs');
// let rawdata = fs.readFileSync('data/words.json');
// const words = JSON.parse(rawdata);

class WordHelper {
    currentWord = '';

    getWord = () => {
        let newWord = words[Math.floor(Math.random() * words.length)];
        if (newWord === this.currentWord) {
            return this.getWord();
        }
        this.currentWord = newWord;
        return this.currentWord;
    };
}

module.exports = { WordHelper };
