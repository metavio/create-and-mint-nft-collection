const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');
const { join } = require('path');
const { readdir } = require('fs').promises
require('dotenv').config();

const client = new NFTStorage({ token: process.env.nft_storage_token })

async function getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = join(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));

    return Array.prototype.concat(...files);
}

async function uploadImages() {
    const file_names = await getFiles(FOLDERS.imagesDir);

    const files = await Promise.all(file_names.map(async file_name => {
        return new File([await fs.promises.readFile(file_name)], file_name.replace(`${FOLDERS.imagesDir}\\`, '').replace('\\', '/'))
    }));

    const { cid, car } = await NFTStorage.encodeDirectory(files);
    await client.storeCar(car);

    return cid;
}

async function updateAndUploadMetas(images_cid) {
    const file_names = await getFiles(FOLDERS.jsonDir);
    function replaceContent(content) {
        content.file_url = content.file_url.replace('ADD_IPFS_IMAGE_CID_HERE', images_cid.toString());
        content.image = content.image.replace('ADD_IPFS_IMAGE_CID_HERE', images_cid.toString());
    }
    file_names.forEach(file_name => {
        const content = JSON.parse(fs.readFileSync(file_name));
        if (Array.isArray(content)) {
            content.forEach(replaceContent);
        } else
            replaceContent(content);
        fs.writeFileSync(file_name, JSON.stringify(content, null, 2));
    });

    const files = await Promise.all(file_names.map(async fileName => {
        return new File([await fs.promises.readFile(fileName)], fileName.replace(`${FOLDERS.jsonDir}\\`, '').replace('\\', '/').replace('.json', ''))
    }));

    const { cid, car } = await NFTStorage.encodeDirectory(files);
    await client.storeCar(car);

    return cid;
}

async function uploadCollection() {
    const images_cid = await uploadImages();
    console.log(`Uploaded images -> ipfs://${images_cid}`);

    const metas_cid = await updateAndUploadMetas(images_cid);
    console.log(`Uploaded metas -> ipfs://${metas_cid}`);
}

uploadCollection();