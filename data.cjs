const axios = require('axios');
const fs = require('fs');
const PublicGoogleSheetsParser = require('public-google-sheets-parser')
const cliProgress = require('cli-progress');
require('dotenv').config({ path: `.env.data`});

const spreadsheetId = '1-bkow6bkqCSSgEeWeV9x-ZgOImEDx4JlojIumZLRLRA';
const sheet = 'LISTE COMPLETE';

const links = {
    'Official Vegan Shop': 'https://www.officialveganshop.com'
}

const handle = async items => {
    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progress.start(items.length, 0);
    const output = [];

    for (const index in items) {
        const item = items[index];
        const name = item['Nom du magasin'];
        const city = item['Ville'];
        const departmentNumber = item['Département'];
        const comments = item['Commentaires'];
        let location = undefined;
        let link = undefined;

        if (Object.keys(links).includes(name)) {
            link = links[name];
        } else {
            const search = name.replace(item['Ville'], '').trim() + ' ' + item['Ville'];
            location = await searchLocation(search);
        }

        const outputItem = {
            name,
            city,
            departmentNumber,
            comments,
            location,
            link
        };

        output.push(outputItem);

        progress.update(parseInt(index, 10) + 1);
    }

    fs.writeFileSync('public/locations.json', JSON.stringify(output));
    fs.writeFileSync('docs/locations.json', JSON.stringify(output));
    progress.stop();
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

const makeUrl = location => `https://maps.googleapis.com/maps/api/geocode/json?address=${location.split(' ').join('+')}&region=fr&key=${process.env.GOOGLE_API_TOKEN}`;

const test = async () => {
    console.log(await searchLocation('The Good Place Montpellier'));
    // console.log(await searchLocation('Super U Pripiac'));
}

if (false) {
    const parser = new PublicGoogleSheetsParser(spreadsheetId, sheet)
    parser.parse().then(items => {
        handle(items)
    })
} else {
    test()
}
