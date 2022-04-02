const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
require('dotenv').config();

async function loadSpreadsheetSheet(sheet_id) {
    const doc = new GoogleSpreadsheet(process.env.sheet_id);

    await doc.useServiceAccountAuth({
        client_email: process.env.client_email,
        private_key: process.env.private_key,
    });

    await doc.loadInfo();

    const sheet = doc.sheetsById[sheet_id];
    await sheet.loadCells();

    const csv = [];
    sheet._cells.forEach(row => {
        csv.push(
            row.map(column => column._rawData.formattedValue)
        )
    });

    return {
        headers: csv[0],
        values: csv.slice(1)
    };
}

(async() => {
    const traits_sheet = await loadSpreadsheetSheet(process.env.trait_sheet_id);
    const traits = traits_sheet.values.map(column => {
        const o = {};
        for (let i = 0; i < traits_sheet.headers.length; i++)
            if (column[i] !== undefined) {
                if (traits_sheet.headers[i] === 'Dependency') {
                    if (!o.DependentTraits)
                        o.DependentTraits = [];
                    o.DependentTraits.push(column[i]);
                } else if (traits_sheet.headers[i] === 'Exclusion') {
                    if (!o.IncompatibleTraits)
                        o.IncompatibleTraits = [];
                    o.IncompatibleTraits.push(column[i]);
                } else {
                    if (!Number.isNaN(Number.parseFloat(column[i])))
                        o[traits_sheet.headers[i]] = Number.parseFloat(column[i]);
                    else
                        o[traits_sheet.headers[i]] = column[i];
                }
            }
        return o;
    });

    const layers = [];
    const dependent_traits = {};
    const incompatible_traits = {};
    traits.forEach(t => {
        if (!layers.find(l => l.name === t.Layer))
            layers.push({ name: t.Layer });
        if (t.DependentTraits)
            dependent_traits[t.Path] = t.DependentTraits;
        if (t.IncompatibleTraits)
            incompatible_traits[t.Path] = t.IncompatibleTraits;
    });

    const fixed_editions_sheet = await loadSpreadsheetSheet(process.env.fixed_editions_sheet_id);
    const fixed_editions = fixed_editions_sheet.values.map(column => {
        const o = {};
        for (let i = 0; i < fixed_editions_sheet.headers.length; i++)
            if (column[i] !== undefined) {                
                if (!Number.isNaN(Number.parseFloat(column[i])))
                    o[fixed_editions_sheet.headers[i]] = Number.parseFloat(column[i]);
                else
                    o[fixed_editions_sheet.headers[i]] = column[i];
            }
        return o;
    });

    fs.writeFileSync(`${FOLDERS.sourceDir}/config_new.json`, JSON.stringify({ traits, fixed_editions, layers, dependent_traits, incompatible_traits }, null, 2));
    console.log(`Downloaded config_new.json -> ${FOLDERS.sourceDir}/config_new.json`);
})();