const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const NodeGoogleDrive = require('google-drive-connect');
const { join } = require('path');
const fs = require('fs');
require('dotenv').config();

async function list({
    fileId = ROOT_FOLDER,
    pageToken = null,
    recursive = false,
    includeRemoved = false,
    fields = 'nextPageToken, files(id, name, parents, mimeType, modifiedTime)',
    q = '()',
    orderBy = null,
    spaces = 'drive',
    pageSize = 100,
    supportsTeamDrives = false,
    teamDriveId = ''
} = {}) {
    q += recursive === false ? `AND ('${fileId}' in parents)` : '';

    //console.log({q});
    let request = {
        fileId,
        pageToken,
        recursive,
        includeRemoved,
        fields,
        q,
        spaces,
        pageSize,
        supportsTeamDrives,
        teamDriveId,
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
        corpora: 'allDrives'
    };

    return this.service.files
        .listAsync(request)
        .then(function(response) {
            require('debug')(`node-google-drive:index`)('Found %s elements', response.files.length);
            response.parentFolder = fileId;
            return response;
        })
        .catch(function(err) {
            require('debug')(`node-google-drive:index`)('Error listing files ', err.message);
            throw err;
        });
};

async function getFiles() {
    const drive = new NodeGoogleDrive();
    drive.list = list;

    await drive.useServiceAccountAuth({
        client_email: process.env.client_email,
        private_key: process.env.private_key,
    });

    let lastFoldersResponse;
    const folders = [{
        id: process.env.drive_root_id
    }];
    do {
        lastFoldersResponse = await drive.listFolders(null, lastFoldersResponse?.nextPageToken, true);
        folders.push(...lastFoldersResponse.folders);
    } while (lastFoldersResponse.nextPageToken);
    function resolvePath(resource, ignore_self) {
        if (resource.id === process.env.drive_root_id)
            return BASEDIR;

        const parent = folders.find(folder => folder.id === resource.parents[0]);
        return join(resolvePath(parent), ignore_self ? '' : resource.name);
    }

    let listFilesResponse;
    const files = [];
    do {
        listFilesResponse = await drive.listFiles(null, listFilesResponse?.nextPageToken, true);
        files.push(...listFilesResponse.files);
    } while (listFilesResponse.nextPageToken);

    folders.forEach(folder => {
        const path = resolvePath(folder);
        if (!fs.existsSync(path))
            fs.mkdirSync(path, { recursive: true });
    });

    await files.filter(file => !file.mimeType.includes('application/vnd.google-apps.')).forEach(async file => {
        const path = resolvePath(file, true);
        const fullPath = join(path, file.name);

        let success = true;
        let retry = true;
        let i = 0;
        while (retry) {
            await drive.getFile(file, path);
            success = true;
            retry = false;
            try {
                const json = JSON.parse(fs.readFileSync(fullPath));
                success = !json?.error;
                retry = json?.error.message === 'Rate Limit Exceeded';
            } catch (e) {}

            if (retry) {
                const timeout = Math.pow(2, i++) * 1000;
                console.log(`Retry download of ${file.name} in ${timeout}ms`);
                await new Promise(resolve => setTimeout(resolve, timeout));
            }
        }

        if (success)
            console.log(`Downloaded ${file.name} -> ${fullPath}`);
        else
            console.error(`Download failed for ${file.name}`);
    });
}

(async() => {
    await getFiles();
})();