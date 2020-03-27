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

module.exports = {
	writeJson
}