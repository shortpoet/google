'use strict';

const fs = require('fs');

const writeJson = async function(data, fileTo, space) {
	fileTo = fileTo || 'data.json';
	space = space || 0;
	data = JSON.stringify(data, null, space)
	fs.writeFile(fileTo, data, (err) => {
		if (err) throw err;
		console.log(`## Data Written to file: ${fileTo}`)
	});
} 
const appendSeparatorFile = async function(data, fileTo, separator) {
	fileTo = fileTo || 'data.txt';
	separator = separator || ',';
	var stream = fs.createWriteStream(fileTo, {flags: 'a'}, (err) => {
		if (err) throw err;
	});
	await stream.write(`${ separator + data.toString()}`);
	console.log(`## Data Written to file: ${fileTo}`)
	stream.end();
} 

module.exports = {
	writeJson,
	appendSeparatorFile
}