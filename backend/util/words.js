'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('data/words.json');
const words = JSON.parse(rawdata);

class WordHelper {
    getWord = () => {
        return words[Math.floor(Math.random() * words.length)];
    };
}

module.exports = { WordHelper };