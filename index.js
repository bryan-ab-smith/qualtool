#!/usr/bin/env node

// Native module imports.
var fs = require('fs');
var cp = require('child_process');
var os = require('os');

// External modules from NPM.
var sentiment = require('node-sentiment');
var chalk = require('chalk');
var wordcount = require('wordcount');
var natural = require('natural');
var wpos = require('wordpos');
var open = require('open');
var xl = require('excel4node');

// Objects for work throughout.
var naturalTFIDF = natural.TfIdf;
var tfidf = new naturalTFIDF();
var wordpos = new wpos();
var wb = new xl.Workbook();

/*
    Variables for arguments.
    - aFile - This is the file that will be analyzed.
    - oFile - The output file.
*/
var aFile = process.argv[2];
var oFile = process.argv[3];
var openFile = process.argv[4];

// var config = require('./sampleconfig.json'); // Not used yet. Maybe in the future...
//var d = new Date();
/*
    - This is the counter for how many "functions" there are.
    - Functions:
        1. Descriptives - word count, character counts, average word length.
        2. Character - individual character counts.
        3. Sentiment - sentiment score, comparative, vote.
        4. Term Frequency-Inverse Document Frequency - score for each word.
        5. Parts of Speech - breakdown of nouns, verbs, adjectives, adverbs and the "rest".
*/
var catCount = '5';

/*
    - Style for the column headers in the output Excel file.
    - The colour is a red (with a slight orange twist).
*/
var headerStyle = {
    font: {
        color: '#BC2100'
    }
};

// The whole process is wrapped up in a file read callback (for now).
fs.readFile(aFile, 'utf-8', function (err, data) {
    /* The following two lines are for a plain text version of output (if the excel output starts to fail in the future and/or I resort back to it).
        //var dString = d.getFullYear() + '/' + String(parseInt(d.getMonth()) + 1) + '/' + d.getDate() + ', ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        //var writeString = '';
    */

    console.log('Starting analysis of ' + chalk.green(aFile) + '...\n');

    /* 
        * Descriptive Analysis
    */
    process.stdout.write('[1/' + catCount + '] Descriptive analysis...');
    // Add a wordsheet to our excel file for the descriptive info.
    var descWS = wb.addWorksheet('Descriptives');
    // Add the headers.
    descWS.cell(1, 1).string('Characteristic').style(headerStyle);
    descWS.cell(1, 2).string('Value').style(headerStyle);

    //writeString += 'Qualtool analysis of ' + aFile + '\nDate and Time: ' + dString + '\n\n-- Descriptive Data --\n';
    // Get the word count for the text.
    var count = wordcount(data);
    //writeString += '\nWord Count: ' + count.toString();
    // Create the cells for the word count label and the count itself.
    descWS.cell(2, 1).string('Word Count');
    descWS.cell(2, 2).number(count);

    // Get the length of the document, inclusive of spaces. 
    var charCountSpaces = data.length;
    //writeString += '\nCharacter Count (with spaces): ' + charCountSpaces.toString();
    // Create the cells for the character count.
    descWS.cell(3, 1).string('Character Count (with spaces)');
    descWS.cell(3, 2).number(charCountSpaces);

    // Get the length of the document, without counting whitespace.
    // Source for regular expression used here: https://stackoverflow.com/a/6623263
    var charCountNoSpaces = data.replace(/ /g, '').length;
    //writeString += '\nCharacter Count (excl. spaces): ' + charCountNoSpaces.toString();
    // Create the cells for the character count, without whitespace.
    descWS.cell(4, 1).string('Character Count (excl spaces)');
    descWS.cell(4, 2).number(charCountNoSpaces);

    // Calculate the word length. Here, we divide the no whitespace count by the word count. A rounding choice of two decimal places was chosen here.
    var avgWordLen = parseFloat(charCountNoSpaces / count).toFixed(2);
    //writeString += '\nAverage word length: ' + avgWordLen.toString();
    // Create the cells for the average word length.
    descWS.cell(5, 1).string('Average word length');
    descWS.cell(5, 2).number(parseFloat(avgWordLen));

    console.log(chalk.green('done.'));

    /* 
        * Character Analysis
    */
    process.stdout.write('[2/' + catCount + '] Character analysis...');

    // See letterCounts() function below for a description of this. 
    var charMap = letterCounts(data);
    //writeString += '\n\n\n-- Character Counts --\n';
    // Set the variable that serves as the counter for where to insert data into the worksheet. This starts at 2 as row 1 is reserved for the headers.
    var charCellCount = 2;
    // Create the worksheet where all the data will go.
    var charWS = wb.addWorksheet('Characters');
    // Set up the headers for the worksheet.
    charWS.cell(1, 1).string('Character').style(headerStyle);
    charWS.cell(1, 2).string('Count').style(headerStyle);

    // Loop over the map of characters and put them in the worksheet.
    charMap.forEach(function (val, key, map) {
        // Here, ignore those characters that have no count whatsoever.
        if (!isNaN(val)) {
            //writeString += '\n' + key.toString() + ': ' + val.toString();
            // Insert the letter and its accompanying count into the worksheet.
            charWS.cell(charCellCount, 1).string(key.toString());
            charWS.cell(charCellCount, 2).number(parseFloat(val));
            // Increment the counter.
            charCellCount++;
        }
    });
    console.log(chalk.green('done.'));

    /* 
        * Sentiment Analysis
    */
    process.stdout.write('[3/' + catCount + '] Sentiment analysis...');
    // Get the sentiment of the data through the node-sentiment module.
    var sent = sentiment(data);
    // Create the worksheet for the sentiment data.
    var sentWS = wb.addWorksheet('Sentiment');
    // Insert the headers into the worksheet.
    sentWS.cell(1, 1).string('Characteristic').style(headerStyle);
    sentWS.cell(1, 2).string('Value').style(headerStyle);
    //writeString += '\n\n\n-- Sentiment --\n';
    //writeString += '\nScore: ' + sent.score.toFixed(5);
    // Insert the score title and its accompanying value.
    sentWS.cell(2, 1).string('Score');
    sentWS.cell(2, 2).number(parseFloat(sent.score.toFixed(5)));
    //tableSentData.push(['Score', (sent.score.toFixed(5) > 0) ? chalk.green(sent.score.toFixed(5)) : chalk.red(sent.score.toFixed(5))]);
    //writeString += '\nComparative: ' + sent.comparative.toFixed(5);
    // Insert the comparative title and its accompanying value.
    sentWS.cell(3, 1).string('Comparative');
    sentWS.cell(3, 2).number(parseFloat(sent.comparative.toFixed(5)));
    //tableSentData.push(['Comparative', (sent.comparative.toFixed(5) > 0) ? chalk.green(sent.comparative.toFixed(5)) : chalk.red(sent.comparative.toFixed(5))]);
    //writeString += '\nVote: ' + sent.vote;
    // Insert the vote title and its accompanying value.
    sentWS.cell(4, 1).string('Vote');
    sentWS.cell(4, 2).string(sent.vote);
    //console.log('[3/' + catCount + '] Sentiment analysis ' + chalk.green('done') + '.');
    console.log(chalk.green('done.'));
    //tableSentData.push(['Vote', sent.vote]);

    /* 
        * TF-IDF Analysis
    */
    process.stdout.write('[4/' + catCount + '] Term frequency-inverse document frequency analysis...');
    //writeString += '\n\n\n-- TD-IDF Values --\n';
    // Add a worksheet for tf-idf analysis.
    var tfidfWS = wb.addWorksheet('TF-IDF');
    // Add headers to the worksheet.
    tfidfWS.cell(1, 1).string('Word').style(headerStyle);
    tfidfWS.cell(1, 2).string('Value').style(headerStyle);

    // Set the counter that determines where rows are inserted into the spreadsheet. This starts at 2 as row 1 is reserved for the headers.
    var tfidfCellCount = 2;
    // Add the text (aFile) as a document for the natural node module.
    // Source: https://github.com/NaturalNode/natural#tf-idf
    tfidf.addDocument(data);
    // Loop through the terms in the list for document 0 (you can add multiple documents but since we only have one, we only need to loop through document 0).
    tfidf.listTerms(0).forEach(function (item) {
        //writeString += '\n' + item.term + ': ' + item.tfidf.toFixed(5);
        // Add cells for the term and the tf-idf score, rounded to 5 decimal places.
        tfidfWS.cell(tfidfCellCount, 1).string(item.term);
        tfidfWS.cell(tfidfCellCount, 2).number(parseFloat(item.tfidf.toFixed(5)));
        // Increment the row counter.
        tfidfCellCount++;
        //tfidfData.push([item.term, item.tfidf.toFixed(5)]);
    });
    console.log(chalk.green('done.'));

    /* 
        * Parts of Speech Analysis
    */
    process.stdout.write('[5/' + catCount + '] Parts of speech analysis...');
    //writeString += '\n\n\n-- Parts of Speech Values --\n';
    // Add a worksheet for the parts of speech analysis.
    var posWS = wb.addWorksheet('Parts of Speech');
    // Get the parts of speech (POS) - nouns, verbs, adjectives, adverbs and "the rest."
    wordpos.getPOS(data, function (result) {
        // These variables serves as counts for each POS. 
        // All qualtool does now is provide counts. There is certainly room, in the future, of doing things with the words themselves.
        var nouns = result.nouns.length;
        var verbs = result.verbs.length;
        var adj = result.adjectives.length;
        var adv = result.adverbs.length;
        var rest = result.rest.length;

        // Get the total.
        var total = nouns + verbs + adj + adv + rest;
        // Add a header row.
        posWS.cell(1, 1).string('Part of Speech').style(headerStyle);
        posWS.cell(1, 2).string('Percentage').style(headerStyle);
        // Insert rows for each POS and its respective percentage (of the total).
        posWS.cell(2, 1).string('Nouns');
        posWS.cell(2, 2).number((parseFloat(nouns) / parseFloat(total)).toFixed(4) * 100);
        posWS.cell(3, 1).string('Verbs');
        posWS.cell(3, 2).number((parseFloat(verbs) / parseFloat(total)).toFixed(4) * 100);
        posWS.cell(4, 1).string('Adjectives');
        posWS.cell(4, 2).number((parseFloat(adj) / parseFloat(total)).toFixed(4) * 100);
        posWS.cell(5, 1).string('Adverbs');
        posWS.cell(5, 2).number((parseFloat(adv) / parseFloat(total)).toFixed(4) * 100);
        posWS.cell(6, 1).string('Rest');
        posWS.cell(6, 2).number((parseFloat(rest) / parseFloat(total)).toFixed(4) * 100);

        /*writeString += '\nNouns: ' + String(nouns) + ' (' + String((parseFloat(nouns)/parseFloat(total)).toFixed(4)*100) + '%)';
        writeString += '\nVerbs: ' + String(verbs) + ' (' + String((parseFloat(verbs)/parseFloat(total)).toFixed(4)*100) + '%)';
        writeString += '\nAdjectives: ' + String(adj) + ' (' + String((parseFloat(adj)/parseFloat(total)).toFixed(4)*100) + '%)';
        writeString += '\nAdverbs: ' + String(adv) + ' (' + String((parseFloat(adv)/parseFloat(total)).toFixed(4)*100) + '%)';
        writeString += '\nRest: ' + String(rest) + ' (' + String((parseFloat(rest)/parseFloat(total)).toFixed(4)*100) + '%)';*/
        console.log(chalk.green('done.'));


        console.log(chalk.yellow('\nFinishing...'));
        // Write the file.
        wb.write(oFile);
        // If the user appends 'open' to the end of the qualtool command, open the file.
        if (openFile == 'open') {
            open(oFile);
        }
    });
});

/*
    This function serves to create a JS map that contains counts for how often the character appears.
        - NOTE: Only letters of the alphabet are included and the count is case-insensitive (for now).
        - Arguments: the text that serves as the source of the analysis. 
*/
function letterCounts(text) {
    // Set up the map that will house the counts.
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

    // Split the text into its constituent parts.
    var splitText = text.split('');

    // Loop over each character in the text.
    for (var x = 0; x < splitText.length; x++) {
        // Get a character.
        var char = splitText[x];
        // Get the current count for the character that we're looking at.
        var count = charMap.get(char.toLowerCase());
        // Increment the count.
        charMap.set(char.toLowerCase(), parseInt(count) + 1);
    }
    // Remove the spaces 
    charMap.delete(' ');
    // Return the character map.
    return charMap;
}