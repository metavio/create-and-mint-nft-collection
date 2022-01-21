# The Peanut Gallery And Co's take on the code bases created by Hashlips and codeSTACKr

To find out more about The Peanut Gallery And Co, please visit:

[💻 Discord](https://discord.com/invite/ShakdpwGEn)

[🐦 Twitter](https://twitter.com/PeanutGalAndCo)

[📱 Instagram](https://www.instagram.com/thepeanutgalleryandco/)

[🌲 Linktree](https://linktr.ee/ThePeanutGalleryandco)

Base code is from the below repos - Massive thank you to the teams behind these repos!
- [hashlips_art_engine](https://github.com/HashLips/hashlips_art_engine)
- [codeSTACKr](https://github.com/codeSTACKr/video-source-code-create-nft-collection/)

File Uploads can be done via [Pinata](https://app.pinata.cloud/) or a similar service that gives you a single CID for images and another one for meta files or [NFTPort](https://nftport.xyz) can be used.

Minting uses [NFTPort](https://nftport.xyz)


## Reference the following videos from both the core code developers for more details.
Please note that some of the commands have changed and have been updated compared to the original videos, please see them under the different sections for each script / process that you can run.
- [Hashlips](https://www.youtube.com/playlist?list=PLvfQp12V0hS3AVImYdMNfkdvRtZEe7xqY)
- [codeSTACKr](https://youtu.be/AaCgydeMu64)


## TIP / Contributions Address
If you feel that this has benefitted you in any way and would like to make a contribution towards The Peanut Gallery And Co, then please use the following MetaMask wallet address:
- `0x5cE5D823f4bD8Ec610868fBa65832B479152C7E1`


## NFT Collection
If you would like to support my NFT collection, please take a look at the below.
- [Steak-Bites Collection On Opensea](https://opensea.io/collection/steak-bites)
![Banner V4](https://user-images.githubusercontent.com/52892685/149317695-82707703-a8db-4e17-8dc2-98d59aefae2e.png)


## Dependencies for scripts to run
- `npm install`
- `npm install node-fetch@2`
- `npm install async-sema`


## UPDATES & FIXES


## How To Use The Codebase
Below is a rough guideline of the order in which the processes can be used.

### 1. Download and unzip the main branch of this repo
Please note that when extracting the code base, there's two possibilities for the extracted folder. Please always make sure that you are opening the folder in VS Code or your terminal which matches the folder structure in step 2.

#### a. Extracted folder contains another folder called create-and-mint-nft-collection
If this is the caase when extracting your folder, then be sure to "cd" or move into that folder before running step 2's install commands, otherwise you will receive module errors and the npm installs won't work and your build and upload commands will not work correctly.
<img width="1040" alt="Screenshot 2022-01-19 at 15 44 26" src="https://user-images.githubusercontent.com/52892685/150142674-9371b030-5d2e-442d-88c4-aa6df8604eea.png">


#### b. Extracted folder contains all the files as in step 2
No need for any extra steps, you can start with step 2 where you run the npm install commands.
<img width="990" alt="Screenshot 2022-01-19 at 15 46 52" src="https://user-images.githubusercontent.com/52892685/150143042-91287da1-7d54-4a3f-8ced-50915cacdcde.png">


### 2. Run the dependency npm commands in the unzipped folder.
Ensure that you are in this diretory before running the npm install commands, otherwise some of your commands will not work correctly.

Example of the contents of the root folder before running the installs:
<img width="1021" alt="Screenshot 2022-01-13 at 12 45 28" src="https://user-images.githubusercontent.com/52892685/149315776-324ddb37-7942-4369-86ee-7ce5d664a0e8.png">

Example of the contents of the root folder after running the installs:
<img width="1009" alt="Screenshot 2022-01-13 at 12 46 51" src="https://user-images.githubusercontent.com/52892685/149315979-f758dcb3-b6c0-409e-9ff0-9c01b0672150.png">


### 3. Update The Main Configuration File For The Art Engine
Update the `src/config.js` file with the different settings for your generative art collection. 
Please watch the videos linked earlier on how to configure the Art Engine.

Modify the following parts at the very least, below are just sample values that I used in a demo.

#### a. If you are planning on using Solana, then update this section.
<img width="1134" alt="Screenshot 2022-01-13 at 12 47 25" src="https://user-images.githubusercontent.com/52892685/149316077-8479678d-57fc-418f-9a91-4d74c26e8b59.png">

#### b. Update your layer folder names, order in which they need to be processed and the number of images to create
<img width="420" alt="Screenshot 2022-01-13 at 12 47 53" src="https://user-images.githubusercontent.com/52892685/149316165-e1b92db3-ce8d-428e-9b30-76f2b606f960.png">


#### c. Update the width and height of your canvas
<img width="228" alt="Screenshot 2022-01-13 at 12 48 07" src="https://user-images.githubusercontent.com/52892685/149316206-fb068e39-274e-45d2-8376-0eeb16586109.png">


#### d. Update the extra metadata that you want to add into your NFT's metadata. You can remove both fields inside of this extraMetadata object or add more if you like
<img width="1305" alt="Screenshot 2022-01-13 at 12 49 21" src="https://user-images.githubusercontent.com/52892685/149316407-bc9d5970-832c-450a-8e5a-9cd8efa430a7.png">


### 4. Configure The NFT Creation Details
Update the `constants/nft_details.js` file with the details that you want to be added to your metadata for your generative art collection.

- `description` - The description that will be added to each of your NFTs
- `namePrefix` - The name prefix that will be added for each of your NFTs. Ex. Steaks #1, Steaks #2
- `imageFilesBase` - Pinned IPFS CID when making use of a service like Pinata. Ex. QmP12prm2rp1omr1Ap2orm1oprm12FQWFQOFOGdnasnsda . Only update this if you are planning to upload the files via a service other than NFTPort where you host a single URL / CID base.
- `metaDataJSONFilesBase` - Pinned IPFS CID when making use of a service like Pinata. Ex. QmP12prm2rp1omr1Ap2orm1oprm12FQWFQOFOGdnasnsda . Only update this if you are planning to upload the files via a service other than NFTPort where you host a single URL / CID base.
- `blankFilenameInLayers` - This value is a boolean with a value of false or true. If true, then any layer that contains "blank" in the metadata will be skipped and not added to the properties of the NFT. When set to false, then the information will be added to the metadata and added to the properties of the NFT.
- `genericTitle` - Replace with what you want the generic titles to say. Only change if you are planning on using NFT reveal and want a different name for your NFTs.
- `genericDescription` - Replace with what you want the generic descriptions to say. Only change if you are planning on using NFT reveal and want a different name for your NFTs.
- `genericURL` - Replace with the image URL that your generic NFTs should show. Only change if you are planning on using NFT reveal and want a different name for your NFTs.

Modify only the parts that you will be using and keep the rest as set by default.
For example, if you are planning on using NFTPort for your file and metadata uploads, then do not modify the `imageFilesBase` and `metaDataJSONFilesBase` fields. If you are planning on not doing a reveal NFT collection and simply have everything revealed, then do not modify the `genericTitle`, `genericDescription` and `genericURL` fields. If you want your NFT properties on Opensea to show, for example "Shirt - Blank - 15%", then set the `blankFilenameInLayers` value to false.

Example configuration:
<img width="1605" alt="Screenshot 2022-01-13 at 12 50 38" src="https://user-images.githubusercontent.com/52892685/149316620-6b7f64c3-705c-4ff3-93b6-990180b7f1d5.png">


### 5. Configure The NFTPort Account Details And API Limits - Only modify this if you are using NFTPort for uploading
Update the `constants/account_details.js` file with the NFTPort account details. These will only be used with the NFTPort scripts. This will be needed if you are uploading files or minting via NFTPort. Please ensure that your NFT contract was created with the `metadata_updatable` variable set to true as this allows for NFT metadata updates to be made and is needed if you are planning on doing NFT reveals after purchases. If not, then you can't change your NFT data and you will need to burn the NFT from the contract to remove it. This will cost you funds / tokens, so make sure you create your contract correctly!

- `auth` - Add your APIKey here that the NFTPort team will provide. Ex. orm1or1-efe1-112a-cccd-kqwfkfmk
- `contract_address` - Add your contract address here, not your transaction hash. After creating a contract on NFTPort, retrieve the contract address via the APIs. Ex. 0xfe81cm1l28b21753ebe117c84als2d6588e150ff
- `mint_to_address` - Add your wallet address here that will be the owner of the minted NFTs. Ex. 0x5cE5D823f4bD8Ec610293fBa65832B479152C7E1
- `chain` - Add the chain where the NFTs will be minted to here. At the time of writing, "polygon" and "rinkeby" are possible values.
- `max_rate_limit` - This will rate limit your API calls towards the NFTPort platform. Be sure to set it according to what is allowed for your APIKey. Ex. '1'
- `numberOfRetries` - This is the retry count that your NFTPort API calls will attempt when not receiving a successful response from the API. It is not advised to make the retry count too high.  Ex. '3'
- `timeout` - This is the waiting time in between API calls when errors arise on the APIs. This has been disabled at the moment as it causes the scripts to hang at times. E.x. 5000 = 5 seconds.
- `mint_range` - If you only want to mint a specific range of editions, e.x everything between editions 5 and 10.
- `mint_item` - If you only want to mint a specific edition, e.x 1.
- `uploadGenericMeta` - If you are planning on using a reveal, then set this value to true, otherwise keep this as false. When it is true, then the uploadMetas file will read from the genericJSON directory to upload the metadata. If set to false (default), then it will read from the json directory which contains your revealed items.

Modify only the parts that you will be using and keep the rest as set by default.
For example, if you are having issues and want more retries on the API or a higher rate limit, only then modify those fields. If you are planning on only minting a single edition or a range of editions, only then modify those fields. If you are planning on doing a reveal, only then modify the `uploadGenericMeta` field.

Example configuration:
<img width="1619" alt="Screenshot 2022-01-13 at 12 51 10" src="https://user-images.githubusercontent.com/52892685/149316724-d88b9ea9-54d4-427c-acd8-ba64857f15dc.png">


### 6. Create Image Layers
Create your different art layers, keeping all of them at the same Canvas size and ensuring they are all exported as .png files. 


### 7. Art Engine - 
Review the Hashlips videos on what all of the configuration items in the `src/config.js` file means and what you need to set them to. 
All of the `Art Engine Commands` make use of this configuration file along with the `constants/account_details.js` file.

Only run the commands from sections a, b and c that you would like to make use of.

#### a. Creation / Build
Use the `Art Engine - Build Command` below to create your generative art collection along with their metadata json files.

#### b. Additional Art Creation Options
- Use the `Art Engine - Pixelate Command` below to create a pixelated art collection from your previous generative art collection.
- Use the `Art Engine - Preview Command` below to create a preview of your generative art collection by combining a few of the images into a single image.
- Use the `Art Engine - Preview_Gif Command` below to create a preview_gif of your generative art collection by combining a few of the images into a single gif that loops through some of your images.

#### c. Rarity Information
Use the `Art Engine - Rarity Command` below to generate a JSON output to the terminal that will show you how your layers will be distributed.


### 8. Update NFT's Info (Description And Name)
Use the `Custom - Update_Nft_Info Command` below to update all NFT JSON files with the new `namePrefix` and `description` from the `constants/nft_details.js` file.

Please note that this should be run before you run the `NFTPort - UploadFiles Command`, `NFTPORT - UploadMetas Command` and `NFTPORT - Mint Command` commands.
Use this only if you want to use a different name and description for your NFTs compared to what got generated with the `Art Engine - Build Command` command.


### 9. Update NFTs For Reveal - Generic Image Until Purchased, Then Only Reveal NFT
Use the `Custom - Update_Json_To_Generic_Meta Command` below to update all NFT files with the `genericTitle`, `genericDescription` and `genericURL` values set in the `constants/account_details.js` files. This will be shown as your NFTs details and picture before a purchase. 

This process will create a new `genericJSON` directory where the `_metadata.json` file will be located along with each file's generic JSON object file. Remember to change your `uploadGenericMeta` key's value to `true` in the `constants/account_details.js` file before making use of the UploadMetas script so that it will upload the files in this directory instead of the normal `json` directory if you are making use of reveals.

**Please remember that your contract needs to be updateable to use this, otherwise this image will stay the image of your NFT, before and after purchase.**

**Please remember to update the genericURL field with the URL where the generic image is, otherwise you will get the one in the code base.**


### 10. Uploading Files (Images and Metadata)
There are two options that you can follow to upload your images and json files onto IPFS. Option 1 would be to go via a service like Pinata that gives a static CID to be used, while Option 2 would be to go directly via NFTPort, however, the CID will be unique for each file.

#### a. Pinata Or Similar Service
Create an account on [Pinata](https://app.pinata.cloud/) and then upload your images folder. Please note that once you have uploaded your folder, you can't add or remove any files from there. From there copy the CID into the `constants/nft_details.js` file against the `imageFilesBase` key.

Use the `Custom - Update_Image_Info Command` below to update the json files for each NFT.
This process will `only` update the `file_url` field within the json file as well as in the `_metadata.json` file.

Upload the json directory onto Pinata and copy the CID into the `constants/nft_details.js` file against the `metaDataJSONFilesBase` key. This should be either of your `json` or `genericJSON` directories, depending on whether you are doing a reveal or not. Just a note, it would make sense to get both of your json directories uploaded if you are doing a reveal so that you can simply update the metadata of your unrevealed NFT, but please see the section on NFT reveal steps to follow in the example `EXAMPLE - Reveal` below.

Use the `Custom - Update_Metadata_Info Command` below to update the json files for each NFT.
This process will create a new `ipfsMetas`, update each NFT json file with a `metadata_uri` field and create a `_ipfsMetas.json` file. All the new json files will be added to the `ipfsMetas` folder.

#### b. NFTPort
Create an account on [NFTPort](https://www.nftport.xyz/) and get an APIKey. Be sure to check your rate limit of your account as well as the amount of NFTs that you can upload with your APIKey's access levels. Update your account's details in the `constants/account_details.js` file.

Use the `NFTPort - UploadFiles Command` below to upload the image files to IPFS and then update the json files for each NFT with the `file_url` and `image` details.
This process will `only` update the `file_url` field within the json file as well as in the `_metadata.json` file.

Use the `NFTPort - UploadMetas Command` below to upload the json metadata files for each NFT to IPFS and then create a `ipfsMetas` folder with an `_ipfsMetas.json` file and a json file for every NFT, containing the upload API response.
The new json files in the `ipfsMetas` directory will now contain a `metadata_uri` field and this has also been added to each object inside the `_ipfsMetas.json` file.

`Important` - Should you wish to do a reveal, please remember that your contract should allow for updates to your NFT files. You also need to update the `uploadGenericMeta` key's value to `true` in the `constants/account_details.js` file so that the genericJSON directory's metadata will be used instead of the json directory. Please see the section on NFT reveal steps to follow in the example `EXAMPLE - Reveal` below.


### 11. Minting NFTs
- Use the `NFTPort - Mint Command` below to start minting all of your NFTs.
- Use the `NFTPort - Mint_Range Command` below to start minting a range of NFTs between specific editions.
- Use the `NFTPort - Mint_Item Command` below to start minting a specific NFT edition.

Before you use the `NFTPort - Mint_Range Command` script, please be sure to update the `mint_range` key's values to the `from` and `to` edition numbers that you would like to attempt to mint. Please note that both of these numbers are `inclusive`.

Before you use the `NFTPort - Mint_Item Command` script, please be sure to update the `mint_item` key's values to the edition number that you would like to attempt to mint.


### 12. Checking NFT Mint Files For Issues
Use the `Custom - Check Mints Command` below to start checking each mint file to determine if there are any issues with the minted files. The check performs validation of the issues experienced in the `Minting NFTs` section and writes out the json files into a `failedMints` directory. 

The checks that this script performs to determine if a NFT mint has failed are done in all of the minting scripts before a mint is attempted for a specific edition. The reason for adding this script is so that if you have 10 000 NFTs that you minted and you simply run one of the minting scripts again, then it will first scan the relevant edition (depending on the mint command used) and then perform mint. This means if you use the mint script again, it will go through all 10 000 items, every time you run it.

The check mints script will go through the 10 000 editions once off, check all of their data and provide a list of items that need to be re-minted with the `NFTPort - ReMint Command`, which will only scan the files that got picked up by the check mints process.

**Please note that every time this runs, it clears out the folder and starts again.**

**Please note that this process takes time to complete as it runs through every minted json file.**


### 13. Re-Mint Failed NFTs
Use the `NFTPort - ReMint Command` below to start re-minting each of the json files in the `failedMints` directory. This process will write out a newly minted file in the `reMinted` directory as well as update the json file in the original `minted` directory. Due to this, a backup folder will be created every time this process runs with the date to keep a backup of the json file in the minted directory at the time of running this process just as a safe guard so that you have access to the original information or how the information changed in between your processing.


### 14. Check Your Work On The Marketplace
You are done with your minting process!
Well done!
Go and check out your mints on your marketplace and refresh the metadata where needde.

GOOD LUCK!


## Art Engine Commands
### Build Command
- npm run build


### Pixelate Command
- node utils/art_engine/pixelate.js
- npm run pixelate


### Preview Command
- node utils/art_engine/preview.js
- npm run preview


### Preview_Gif Command
- node utils/art_engine/preview_gif.js
- npm run preview_gif


### Rarity Command
- node utils/art_engine/rarity.js
- npm run rarity


## Main Commands
Use the following command from the code's root directory.

### Check_Mints
- node utils/custom/check_mints.js
- npm run check_mints


### Update_Image_Info Command
- node utils/custom/update_image_info.js
- npm run update_image_info


### Update_Json_To_Generic_Meta Command
- node utils/custom/update_json_to_generic_meta.js
- npm run update_json_to_generic_meta


### Update_Metadata_Info Command
- node utils/custom/update_metadata_info.js
- npm run update_metadata_info


### Update_Nft_Info Command
- node utils/custom/update_nft_info.js
- npm run update_nft_info


## NFTPort Commands
Use the following command from the code's root directory.

### Mint_Item Command
- node utils/nftport/mint_item.js
- npm run mint_item


### Mint_Range Command
- node utils/nftport/mint_range.js
- npm run mint_range


### Mint Command
- node utils/nftport/mint.js
- npm run mint


### ReMint Command
- node utils/nftport/remint.js
- npm run remint


### UploadFiles Command
- node utils/nftport/uploadFiles.js
- npm run uploadFiles


### UploadMetas Command
- node utils/nftport/uploadMetas.js
- npm run uploadMetas


## EXAMPLE - NO REVEAL

### Download Repo And Extract
<img width="1002" alt="Screenshot 2022-01-14 at 01 26 11" src="https://user-images.githubusercontent.com/52892685/149424701-b7db389e-2be7-4be5-a597-af1400cdaa1e.png">


### Install Packages
<img width="1188" alt="Screenshot 2022-01-14 at 01 31 50" src="https://user-images.githubusercontent.com/52892685/149425212-9bc5dc99-a0b8-4216-8481-d1d1fe533ee0.png">


### Update src/config.js
<img width="1257" alt="Screenshot 2022-01-14 at 01 33 20" src="https://user-images.githubusercontent.com/52892685/149425340-fcdec29c-7e11-44d8-8f84-49d2d8b64464.png">


### Update constants/account_details.js
<img width="1599" alt="Screenshot 2022-01-14 at 01 28 02" src="https://user-images.githubusercontent.com/52892685/149424830-25efe8f5-a83f-4c5d-ae55-53ff14345e2b.png">


### Update constants/nft_details.js
<img width="1597" alt="Screenshot 2022-01-14 at 01 28 27" src="https://user-images.githubusercontent.com/52892685/149424877-e52dc6f2-b365-4905-b261-91bd6fe3a5bb.png">


### Art Engine - Build
<img width="1167" alt="Screenshot 2022-01-14 at 01 35 14" src="https://user-images.githubusercontent.com/52892685/149425539-a5208921-cc64-4594-b3c5-0fa981254abb.png">


### Upload Files
<img width="1311" alt="Screenshot 2022-01-14 at 01 37 22" src="https://user-images.githubusercontent.com/52892685/149425728-b15be911-e988-4b0b-993b-71dc98d258a8.png">

<img width="755" alt="Screenshot 2022-01-14 at 01 38 23" src="https://user-images.githubusercontent.com/52892685/149425829-0e99b018-0338-4d5c-912e-1b34864b811c.png">


### Upload Metas
<img width="1552" alt="Screenshot 2022-01-14 at 01 39 46" src="https://user-images.githubusercontent.com/52892685/149425953-716edba4-da7f-43f8-b901-5a67606dd50e.png">

<img width="520" alt="Screenshot 2022-01-14 at 01 40 49" src="https://user-images.githubusercontent.com/52892685/149426049-68feafe4-84d0-4838-911d-671ed3d4415f.png">


### Mint
<img width="526" alt="Screenshot 2022-01-14 at 01 41 35" src="https://user-images.githubusercontent.com/52892685/149426121-0cbe6184-5723-43a9-90d1-ad6aff9d9268.png">

<img width="225" alt="Screenshot 2022-01-14 at 11 56 04" src="https://user-images.githubusercontent.com/52892685/149496202-dadf2585-3bcd-4143-bcb2-a13b33c9dff5.png">

<img width="623" alt="Screenshot 2022-01-14 at 01 42 34" src="https://user-images.githubusercontent.com/52892685/149426210-8bbc03ae-d658-42c7-9a52-d275883ac738.png">


## EXAMPLE - REVEAL
### Download Repo And Extract
<img width="1002" alt="Screenshot 2022-01-14 at 01 26 11" src="https://user-images.githubusercontent.com/52892685/149424701-b7db389e-2be7-4be5-a597-af1400cdaa1e.png">


### Install Packages
<img width="1188" alt="Screenshot 2022-01-14 at 01 31 50" src="https://user-images.githubusercontent.com/52892685/149425212-9bc5dc99-a0b8-4216-8481-d1d1fe533ee0.png">


### Update src/config.js
<img width="1257" alt="Screenshot 2022-01-14 at 01 33 20" src="https://user-images.githubusercontent.com/52892685/149425340-fcdec29c-7e11-44d8-8f84-49d2d8b64464.png">


### Update constants/account_details.js
Make sure that your `uploadGenericMeta` key's value is set to `false` initially and that your contract's `metadata_updatable` value is set to `true`.
<img width="1387" alt="Screenshot 2022-01-14 at 11 15 57" src="https://user-images.githubusercontent.com/52892685/149490361-b42e8b80-e495-4629-afb5-a1b009e722b8.png">


### Update constants/nft_details.js
<img width="1597" alt="Screenshot 2022-01-14 at 01 28 27" src="https://user-images.githubusercontent.com/52892685/149424877-e52dc6f2-b365-4905-b261-91bd6fe3a5bb.png">


### Art Engine - Build
<img width="1167" alt="Screenshot 2022-01-14 at 01 35 14" src="https://user-images.githubusercontent.com/52892685/149425539-a5208921-cc64-4594-b3c5-0fa981254abb.png">


### Update JSON To Generic Meta
This script will utilize the generic field's values set in the `constants/nft_details.js` file and create a new `genericJSON` directory which will contain the metadata that you want to mint for the unrevealed NFTs.

<img width="569" alt="Screenshot 2022-01-14 at 11 34 41" src="https://user-images.githubusercontent.com/52892685/149493069-446f1000-d0a4-4dcc-a199-566e7ea1b8a0.png">

<img width="222" alt="Screenshot 2022-01-14 at 11 34 24" src="https://user-images.githubusercontent.com/52892685/149493036-6ef22890-73f0-45e9-84f3-63c8d6018481.png">

<img width="617" alt="Screenshot 2022-01-14 at 11 24 26" src="https://user-images.githubusercontent.com/52892685/149491586-621410d4-1620-4f85-aa73-272eceac77c0.png">


### Upload Files
<img width="1311" alt="Screenshot 2022-01-14 at 01 37 22" src="https://user-images.githubusercontent.com/52892685/149425728-b15be911-e988-4b0b-993b-71dc98d258a8.png">

<img width="755" alt="Screenshot 2022-01-14 at 01 38 23" src="https://user-images.githubusercontent.com/52892685/149425829-0e99b018-0338-4d5c-912e-1b34864b811c.png">


### Upload Metas - This will upload your `json` directory's files
<img width="1552" alt="Screenshot 2022-01-14 at 01 39 46" src="https://user-images.githubusercontent.com/52892685/149425953-716edba4-da7f-43f8-b901-5a67606dd50e.png">

<img width="227" alt="Screenshot 2022-01-14 at 11 36 52" src="https://user-images.githubusercontent.com/52892685/149493374-4cd82378-52c7-4244-b5d0-2786b28280f1.png">

<img width="520" alt="Screenshot 2022-01-14 at 01 40 49" src="https://user-images.githubusercontent.com/52892685/149426049-68feafe4-84d0-4838-911d-671ed3d4415f.png">


### Rename `ipfsMetas` directory 
Rename the `ipfsMetas` directory to `realIPFSMetas` or anything other than `ipfsMetas` as these are the files to be used for revealing your data after purchases.

<img width="224" alt="Screenshot 2022-01-14 at 11 19 53" src="https://user-images.githubusercontent.com/52892685/149490897-c7edcaca-d620-474d-9569-d0668f8cc57b.png">


### Update constants/account_details.js
Update your `uploadGenericMeta` key's value to `true`.
<img width="1388" alt="Screenshot 2022-01-14 at 11 07 32" src="https://user-images.githubusercontent.com/52892685/149489118-e8163e8d-bd6f-4a19-8135-990af69b883c.png">


### Upload Metas - This will upload your `genericJSON` directory's files
<img width="1380" alt="Screenshot 2022-01-14 at 11 31 40" src="https://user-images.githubusercontent.com/52892685/149492663-2a278c8f-786a-4ffa-bc53-c2399fdf6a83.png">

<img width="228" alt="Screenshot 2022-01-14 at 11 37 54" src="https://user-images.githubusercontent.com/52892685/149493517-5a087df0-0a6f-4bf8-827b-13f921170502.png">

<img width="619" alt="Screenshot 2022-01-14 at 11 28 04" src="https://user-images.githubusercontent.com/52892685/149492147-cd7b71ad-e3b6-4d97-9ea7-f41309766157.png">


### Mint - This will mint your `unrevealed` NFTs' metadata
<img width="423" alt="Screenshot 2022-01-14 at 11 53 47" src="https://user-images.githubusercontent.com/52892685/149495913-28fd8389-497d-4fd0-b396-f2b16a119fc1.png">

<img width="225" alt="Screenshot 2022-01-14 at 11 56 04" src="https://user-images.githubusercontent.com/52892685/149496202-dadf2585-3bcd-4143-bcb2-a13b33c9dff5.png">

<img width="862" alt="Screenshot 2022-01-14 at 11 58 51" src="https://user-images.githubusercontent.com/52892685/149496615-308986e6-6398-430f-a9b4-a41a765bd7c9.png">


### Manually Update Metadata After Purchase
Once your NFT has sold, go to [NFTPort](https://www.nftport.xyz/) and go to the docs / API section. From there, go to the Minting section and choose the `Update a minted NFT` API. Take the packet on the API's right hand side and update it with the details from your unrevealed folder. (`realIPFSMetas or whatever you called your backup folder`)

Send the API request on the right hand side and if all goes well, then your NFT's metadata will now be updated and the revealed image will show.

**Please note that if you want to freeze the metadata so that no more updates can happen, then include the optional `freeze_metadata: true` field and key to the json packet that you will send in the API call**

<img width="569" alt="Screenshot 2022-01-14 at 11 48 39" src="https://user-images.githubusercontent.com/52892685/149495092-87ba2020-940b-47d5-b4ac-f83544db869f.png">



## EXAMPLE - DNA EXISTS AND NEED MORE LAYERS TO GROW EDITION
When you encounter `DNA exists!`, do not panic as this simply means the combination of elements have already created an image and it will try a different combination. If you encounter `You need more layers or elements to grow your edition to 20 artworks!`, with `20` being the number of NFTs you are trying to generate, then it simply means you do not have enough unique items within your layers to create the total number of NFTs that you are trying to create. You need to add more items to your layers, so maybe add a `blank` image so that your layers only sometimes populate. Another item that you can look to modify when you are working with **big** collections is the `uniqueDnaTorrance` setting in the `src/config.js` file. This is set to `10000` by default, but if you might need to make that a higher number and try to generate your collection again. For demo purposes, I set my `uniqueDnaTorrance` to `2` to for demo purposes to trigger the error.

<img width="478" alt="Screenshot 2022-01-14 at 09 33 11" src="https://user-images.githubusercontent.com/52892685/149468855-8e1406d1-9403-4e7a-8406-b47b574c7d11.png">

<img width="191" alt="Screenshot 2022-01-14 at 09 38 09" src="https://user-images.githubusercontent.com/52892685/149469412-49b5fbed-790f-4bf1-a61a-bbb24521c982.png">


## EXAMPLE - FILE ALREADY UPLOADED
When you encounter `5 already uploaded.` error in the uploadFiles script, it means that your json file already contains a `https://xxxx` URL for the `file_url` key. If you would really like to re-upload the image, simply remove the URL value (not the whole line, just the value, otherwise you will see an error if the field key is not there) or change it to `IPFS`, then run the uploadFiles script again and the files will be re-uploaded.

<img width="1137" alt="Screenshot 2022-01-14 at 09 56 57" src="https://user-images.githubusercontent.com/52892685/149471713-41fe163b-de25-4a48-ad24-f7e2c474b3a4.png">

<img width="631" alt="Screenshot 2022-01-14 at 09 56 03" src="https://user-images.githubusercontent.com/52892685/149471584-a8548b72-aa90-4d4c-a4e6-604a85ace6a1.png">

<img width="624" alt="Screenshot 2022-01-14 at 09 58 40" src="https://user-images.githubusercontent.com/52892685/149471944-b46f4316-ee3d-45a7-88b0-50b8e2d3a2c8.png">

<img width="608" alt="Screenshot 2022-01-14 at 09 59 21" src="https://user-images.githubusercontent.com/52892685/149472026-2bd2cb0c-5869-448a-bb7d-baebe056c6a2.png">

<img width="1148" alt="Screenshot 2022-01-14 at 10 03 21" src="https://user-images.githubusercontent.com/52892685/149472534-109be0d2-e61c-448c-8376-6086b3bc5dff.png">


## EXAMPLE - UPLOAD GENERIC METAS WITHOUT CREATING GENERIC METAS FILES
When you are trying to upload your metadata files via the uploadMetas script, but you haven't run the `update_json_to_generic_meta` script before attempting the upload, then the below error will be seen as no `genericJSON` directory can be found.

<img width="1388" alt="Screenshot 2022-01-14 at 10 46 13" src="https://user-images.githubusercontent.com/52892685/149484977-d4ebf628-5c10-44f3-9267-3fe65fe57653.png">

<img width="1388" alt="Screenshot 2022-01-14 at 10 44 21" src="https://user-images.githubusercontent.com/52892685/149483988-6cf54750-90d5-4ad3-84b5-e91846f26917.png">


## EXAMPLE - METADATA ALREADY UPLOADED OUTPUT
<img width="1594" alt="Screenshot 2022-01-14 at 01 46 44" src="https://user-images.githubusercontent.com/52892685/149426543-1226ae6c-63b6-4ab7-9ee6-8cc8ece04acb.png">


## EXAMPLE - MINT FAILED, USING CHECK_MINTS AND REMINT
<img width="820" alt="Screenshot 2022-01-14 at 01 48 42" src="https://user-images.githubusercontent.com/52892685/149426726-c581480a-b3ef-4f9f-b5b0-a55f02ee0dc2.png">


## EXAMPLE - EDITION ALREADY MINTED
<img width="545" alt="Screenshot 2022-01-14 at 01 47 30" src="https://user-images.githubusercontent.com/52892685/149426612-5036e729-9e1e-4492-8652-88037d4f054e.png">


## EXAMPLE - CONTRACT ALREADY HAS THE GIVEN TOKEN ID
This means the edition number of the token that you are trying to mint already exists against your contract. Go to your contract address on your chain's explorer and you should see that the tokenid is already there. 

**Please note that there is no need to panic as you can't upload the same tokenid against a given contract, so you won't have any duplicates.**

<img width="1019" alt="Screenshot 2022-01-14 at 10 59 49" src="https://user-images.githubusercontent.com/52892685/149487898-4500a598-2129-4e2c-9a91-f356829e02d9.png">

<img width="1403" alt="Screenshot 2022-01-14 at 11 02 40" src="https://user-images.githubusercontent.com/52892685/149488352-f14a8236-5bea-44d2-8b55-6870884c6364.png">

<img width="1442" alt="Screenshot 2022-01-14 at 11 02 59" src="https://user-images.githubusercontent.com/52892685/149488412-300f54bb-f24a-4b67-8649-c3f13abaf562.png">

