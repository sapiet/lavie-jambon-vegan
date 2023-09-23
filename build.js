const axios = require('axios');
const fs = require('fs');
const PublicGoogleSheetsParser = require('public-google-sheets-parser')
require('dotenv').config();

const spreadsheetId = '1-bkow6bkqCSSgEeWeV9x-ZgOImEDx4JlojIumZLRLRA'

const parser = new PublicGoogleSheetsParser(spreadsheetId)
parser.parse().then(items => handle(items))

const handle = async items => {
	const output = [];

	for (const item of items) {
		output.push({
			name: item['Nom du magasin'],
			city: item['Ville'],
			departmentNumber: item['Département'],
			// department: item[''],
			comments: item['Commentaires'],
			location: await searchLocation(item['Nom du magasin'] + ', ' + item['Ville'])
		});
	}

	fs.writeFileSync('locations.json', JSON.stringify(output));
}

const searchLocation = async location => {
	const url = makeUrl(location);
	const { data } = await axios.get(url);

	if (data.results.length > 0) {
		return [data.results[0].geometry.location.lng, data.results[0].geometry.location.lat];
	} else {
		const error = `Unable to find location "${location}"`;
		console.error(url);
		console.error(data);
		console.error(error);
	}
}

const makeUrl = location => `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURI(location)}&key=${process.env.KEY}`;
