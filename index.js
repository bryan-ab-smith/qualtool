var fs = require('fs');

var sentiment = require('node-sentiment');
var ora = require('ora');
var chalk = require('chalk');
var table = require('table');

var sentScore = 0;
var aFile = process.argv[2];
var tableSentData = [
    ['Property', 'Value']
];

fs.readFile(aFile, 'utf-8', function(err, data) {

	var text = data;
	// https://github.com/sindresorhus/ora/blob/master/readme.md
	var spinner = ora('Starting analysis of ' + chalk.green(aFile) + '...\n').start();
    setTimeout(function() {
        spinner.color = 'yellow';
        spinner.text = 'Analyzing...';
    }, 1000);
      
    var sent = sentiment(data);
    tableSentData.push(['Score', (sent.score.toFixed(5) > 0) ? chalk.green(sent.score.toFixed(5)) : chalk.red(sent.score.toFixed(5))]);
    tableSentData.push(['Comparative', (sent.comparative.toFixed(5) > 0) ? chalk.green(sent.comparative.toFixed(5)) : chalk.red(sent.comparative.toFixed(5))]);
    tableSentData.push(['Vote', sent.vote]);
	/*console.log('\nScore: ' + sent.score.toFixed(5));
	console.log('Comparative: ' + sent.comparative.toFixed(5));
    console.log('Vote: ' + sent.vote);*/
    var output = table.table(tableSentData);
    console.log('\n' + chalk.bgBlue('Sentiment Analysis\n'));
    console.log(output);
	spinner.stop();
});