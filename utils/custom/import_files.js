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