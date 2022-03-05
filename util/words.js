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
    console.log('loaded words from db');
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
    usedWords = {};

    getWord = (gameId) => {
      if (!this.usedWords[gameId]) {
        this.usedWords[gameId] = [];
      }
      let newWord = words[Math.floor(Math.random() * words.length)];
      if (this.usedWords[gameId].includes(newWord.word)) {
          return this.getWord();
      }
      this.usedWords[gameId].push(newWord.word);
      return newWord;
    };
}

module.exports = { WordHelper };
