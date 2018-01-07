# QualTool

This is a simple tool that will analyze a text and produce some insights into the text for qualitative (or quantitative) analysis. This is very much in development so more will come.

## Features
* Descriptive analysis
	* Word count
* Character analysis
	* Counts of alphabet letters
* Semantic analysis
	* Score
	* Comparative
	* Vote
* TF-IDF
	* Scores for each word
* Subset (<span style='color: #BC2100'>NOTE: This is a rough breakdown and any results should be verified by the analyst.</span>)
	* Breakdown of people, places, organizations, questions, quotations and statements.
* Parts of speech
	* Percentage counts of nouns, verbs, adjectives and adverbs

## Getting Started

1. Install [Node.js](https://nodejs.org/).
2. Install all the dependencies by running `npm install -g` in the directory with the package.json file (see below).
	* This needs to be done with elevated privileges if you install it globally.
3. Enjoy.
	* If you want to try it out, run qualtool against the `test_doc.txt` file provided here.

### Build Tools
You may need build tools for each platform. You can install the Windows build tools with the following (from an Adminsitrator prompt): `npm install windows-build-tools`. On macOS, install the Xcode comamnd line tools by executing the following: `xcode-select --install`. Finally, on Linux, you'll need the equivalent of Ubuntu's `build-essential` package. I'm not sure what from that is necessary but I'm assuming it's gcc/llvm and make.

## Usage
The syntax is as follows:
```
qualtool <local/online> <name of file file> <output file> _<open>_
```
### Parameters
* local/online - If you set this to online, your _name of the file_ is a URL for a text that is online that you want to analyze. _local_ will set qualtool to analyze a local document.
* name of the file - the name and path of the file you want to analyze.
* output file - where the results will be saved.
* _open_ (optional): If you append _open_ to the end of the command, the output file will be opened once the analysis is complete.
**Note: NPM global installs of qualtool should work...hopefully. Proceed with caution (if concerned, run it locally for now).**

## Features

### Descriptives
* Word count - the number of words in the document.
* Characters - the number of characters, inclusive of blank space(s).
* Characters (excl. spaces) - the number of characters, ignoring blank space(s).
* Average word length - this is the average word length, using the `Characters (excl. spaces)` as the numerator, and `Word count` as the denominator.

### Character counts
* Counts - the count of each letter in the alphabet in the text, case-insensitive.

### Sentiment
* Score - the overall score the text's sentiment. Each word (token) is evaluated based on the [AFINN-111](http://www2.imm.dtu.dk/pubdb/views/publication_details.php?id=6010) list and given a score of -5 to 5. Anything lower than 0 is evaluated as a negative word and anything greater than 0 is evaluated as positive (0 is netural). 
* Comparative - where things "coalesce" on a scale of -5 to 5. Every word has a score ranging from -5 (very negative) to 5 (very positive). This is the "average" score to give you a sense of the strength of the overall positivity or negativity of the text.

### TF-IDF
* Values - the Term Frequency-Inverse Document Frequency values are listed for each term, and done so in descending order.

### Subset
* Break down the text into the following parts:
	* People
	* Places
	* Organizations
	* Questions
	* Quotations
	* Statements

### Parts of speech
* Break down the text into the following parts:
	* Nouns
	* Verbs
	* Adjectives
	* Adverbs
	* "The rest"

## Supported Platforms
* Windows 10 (tested)
* macOS 10.13
* Linux


## License

Copyright (c) 2017 Bryan Smith

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to 
deal in the Software without restriction, including without limitation the 
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or 
sell copies of the Software, and to permit persons to whom the Software is 
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in 
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE 
SOFTWARE.