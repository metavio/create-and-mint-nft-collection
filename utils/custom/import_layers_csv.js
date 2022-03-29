const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');
require('dotenv').config();

async function loadSpreadsheetSheet() {
    const doc = new GoogleSpreadsheet(process.env.sheet_id);

    await doc.useServiceAccountAuth({
        client_email: process.env.client_email,
        private_key: process.env.private_key,
    });

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];
    await sheet.loadCells();

    return sheet;
}

(async() => {
    const sheet = await loadSpreadsheetSheet();

    const csv = [];
    sheet._cells.forEach(row => {
        csv.push(
            row.map(column => column._rawData.formattedValue)
        )
    });

    const headers = csv[0];
    const values = csv.slice(1).map(column => {
        const o = {};
        for (let i = 0; i < headers.length; i++)
            if (column[i] !== undefined) {
                if (headers[i] === 'Dependency') {
                    if (!o.Dependency)
                        o.Dependency = [];
                    o.Dependency.push(column[i]);
                } else
                    o[headers[i]] = column[i];
            }
        return o;
    });

    fs.writeFileSync(`${FOLDERS.sourceDir}/config_new.js`, JSON.stringify(values, null, 2));
    console.log(`Downloaded config_new.js -> ${FOLDERS.sourceDir}/config_new.js`);
})();