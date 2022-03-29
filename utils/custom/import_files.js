const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const NodeGoogleDrive = require('google-drive-connect');
const { join } = require('path');
const fs = require('fs');
require('dotenv').config();

async function getFiles() {
    const drive = new NodeGoogleDrive({
        ROOT_FOLDER: process.env.drive_root_id
    });

    await drive.useServiceAccountAuth({
        client_email: process.env.client_email,
        private_key: process.env.private_key,
    });

    const { folders } = await drive.listFolders(null, null, true);
    function resolvePath(resource, ignore_self) {
        if (resource.id === process.env.drive_root_id)
            return BASEDIR;

        const parent = folders.find(folder => folder.id === resource.parents[0]);
        return join(resolvePath(parent), ignore_self ? '' : resource.name);
    }

    const { files } = await drive.listFiles(null, null, true);

    folders.forEach(folder => {
        const path = resolvePath(folder);
        if (!fs.existsSync(path))
            fs.mkdirSync(path);
    });

    await files.forEach(async file => {
        const path = resolvePath(file, true);
        await drive.getFile(file, path);
        console.log(`Downloaded ${file.name} -> ${join(path, file.name)}`);
    });
}

(async() => {
    await getFiles();
})();