'use strict';

const fs = require('fs');

let rawdata = fs.readFileSync('data/words.json');
const words = JSON.parse(rawdata);

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