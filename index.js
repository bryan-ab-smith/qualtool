#!/usr/bin/env node
var fs = require('fs');

var sentiment = require('node-sentiment');
var ora = require('ora');
var chalk = require('chalk');
var table = require('table');
var wordcount = require('wordcount');
var natural = require('natural');

var sentScore = 0;
var aFile = process.argv[2];
var oFile = process.argv[3];

var naturalTFIDF = natural.TfIdf;
var tfidf = new naturalTFIDF();

var config = require('./sampleconfig.json'); // Not used yet. Maybe in the future...

var tableDescripData = [
    ['Property', 'Value']
];

var tableCharCounts = [
    ['Letter', 'Count']
];

var tableSentData = [
    ['Property', 'Value']
];

var tfidfData = [
    ['Term', 'TF-IDF Value']
];

fs.readFile(aFile, 'utf-8', function(err, data) {
    var writeString = '';

	// https://github.com/sindresorhus/ora/blob/master/readme.md
	var spinner = ora('Starting analysis of ' + chalk.green(aFile) + '...\n').start();
    setTimeout(function() {
        spinner.color = 'yellow';
        spinner.text = 'Analyzing...';
    }, 1000);
    
    writeString += '-- Descriptive Data --\n';
    var count = wordcount(data);
    writeString += '\nWord Count: ' + count.toString();
    var charCountSpaces = data.length;
    writeString += '\nCharacter Count (with spaces): ' + charCountSpaces.toString();
    var charCountNoSpaces = data.replace(/ /g, '').length; // https://stackoverflow.com/a/6623263
    writeString += '\nCharacter Count (excl. spaces): ' + charCountNoSpaces.toString();
    var avgWordLen = parseFloat(charCountNoSpaces/count).toFixed(2);
    writeString += '\nAverage word length: ' + avgWordLen.toString();

    tableDescripData.push(['Word Count', count]);
    tableDescripData.push(['Characters (with spaces)', charCountSpaces]);
    tableDescripData.push(['Characters (excl. spaces)', charCountNoSpaces]);
    tableDescripData.push(['Average word length', avgWordLen]);

    var charMap = letterCounts(data);
    writeString += '\n\n\n-- Character Counts --\n';
    charMap.forEach(function(val, key, map) {
        //console.log(key + ' --> ' + val);
        if (!isNaN(val)) {
            tableCharCounts.push([key.toString(), val.toString()]);
            writeString += '\n' + key.toString() + ': ' + val.toString();
        }
    });
    

    var sent = sentiment(data);
    writeString += '\n\n\n-- Sentiment --\n';
    writeString += '\nScore: ' + sent.score.toFixed(5);
    tableSentData.push(['Score', (sent.score.toFixed(5) > 0) ? chalk.green(sent.score.toFixed(5)) : chalk.red(sent.score.toFixed(5))]);
    writeString += '\nComparative: ' + sent.comparative.toFixed(5);
    tableSentData.push(['Comparative', (sent.comparative.toFixed(5) > 0) ? chalk.green(sent.comparative.toFixed(5)) : chalk.red(sent.comparative.toFixed(5))]);
    writeString += '\nVote: ' + sent.vote;
    tableSentData.push(['Vote', sent.vote]);

    // https://github.com/NaturalNode/natural#tf-idf
    tfidf.addDocument(data);
    
    writeString += '\n\n\n-- TD-IDF Values --\n';
    tfidf.listTerms(0).forEach(function(item) {
        writeString += '\n' + item.term + ': ' + item.tfidf.toFixed(5);
        tfidfData.push([item.term, item.tfidf.toFixed(5)]);
    });

    var outputTdidf = table.table(tfidfData);
    var outputDesc = table.table(tableDescripData);
    var outputChar = table.table(tableCharCounts);
    var outputSent = table.table(tableSentData);
    
    console.log('\n' + chalk.bgBlue('Descriptive Analysis\n'));
    console.log(outputDesc);

    console.log('\n' + chalk.bgBlue('Character Counts\n'));
    console.log(outputChar);

    console.log('\n' + chalk.bgBlue('Sentiment Analysis\n'));
    console.log(outputSent);

    console.log('\n' + chalk.bgBlue('TD-IDF Analysis\n'));
    console.log(outputTdidf);

    
    
    console.log(chalk.yellow('Writing results to file...'));

    fs.writeFile(oFile, writeString, function (err) {
        if (err) throw err;
        console.log(chalk.green('File written.'));
        spinner.stop();
    });

});

function letterCounts(text) {
    var charMap = new Map([
        ['a', 0],
        ['b', 0],
        ['c', 0],
        ['d', 0],
        ['e', 0],
        ['f', 0],
        ['g', 0],
        ['h', 0],
        ['i', 0],
        ['j', 0],
        ['k', 0],
        ['l', 0],
        ['m', 0],
        ['n', 0],
        ['o', 0],
        ['p', 0],
        ['q', 0],
        ['r', 0],
        ['s', 0],
        ['t', 0],
        ['u', 0],
        ['v', 0],
        ['w', 0],
        ['x', 0],
        ['y', 0],
        ['z', 0]
    ]);

    var splitText = text.split('');

    for (var x = 0; x < splitText.length; x++) {
        var char = splitText[x];
        var count = charMap.get(char.toLowerCase());
        charMap.set(char.toLowerCase(), parseInt(count) + 1);
        /*if (char !== undefined) {
            console.log(charMap.get(char.toLowerCase()));
        }*/
        //console.log(splitText[x]);
    }
    charMap.delete(' '); // Remove the spaces 
    return charMap;
}