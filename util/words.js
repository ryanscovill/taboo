'use strict';
const { MongoClient } = require('mongodb');
require('dotenv').config();

let words = [];

// read only access
const uri = process.env.MONGO_READ_URI;
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
        if (this.usedWords[gameId].length === words.length - 1) {
          this.usedWords[gameId] = [];
        }
        return this.getWord(gameId);
      }
      this.usedWords[gameId].push(newWord.word);
      return newWord;
    };
}

module.exports = { WordHelper };
