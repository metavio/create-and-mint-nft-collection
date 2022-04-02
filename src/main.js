const fs = require("fs");
const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const sha1 = require(`${FOLDERS.nodeModulesDir}/sha1`);
const { createCanvas, loadImage } = require(`${FOLDERS.nodeModulesDir}/canvas`);
const { NETWORK } = require(`${FOLDERS.constantsDir}/network.js`);
const { NFT_DETAILS } = require(`${FOLDERS.constantsDir}/nft_details.js`);
const {
  format,
  background,
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  text,
  network,
  solanaMetadata,
  gif,
} = require(`${FOLDERS.sourceDir}/config.js`);
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;
var metadataList = [];
var attributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = "-";
const HashlipsGiffer = require(`${FOLDERS.modulesDir}/HashlipsGiffer.js`);
const configNew = fs.existsSync(`${FOLDERS.sourceDir}/config_new.json`) ? require(`${FOLDERS.sourceDir}/config_new.json`) : {};

const { needsFiltration } = require('./filters');

let hashlipsGiffer = null;

const buildSetup = () => {
  if (fs.existsSync(FOLDERS.buildDir)) {
    fs.rmSync(FOLDERS.buildDir, { recursive: true });
  }
  fs.mkdirSync(FOLDERS.buildDir);
  fs.mkdirSync(FOLDERS.jsonDir);
  fs.mkdirSync(FOLDERS.imagesDir);
  if (gif.export) {
    fs.mkdirSync(FOLDERS.gifsDir);
  }
};

const getRarityWeight = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = Number(
    nameWithoutExtension.split(rarityDelimiter).pop()
  );
  if (isNaN(nameWithoutWeight)) {
    nameWithoutWeight = 1;
  }
  return nameWithoutWeight;
};

const cleanDna = (_str) => {
  const withoutOptions = removeQueryStrings(_str);
  var dna = Number(withoutOptions.split(":").shift());
  return dna;
};

const cleanName = (_str) => {
  let nameWithoutExtension = _str.slice(0, -4);
  var nameWithoutWeight = nameWithoutExtension.split(rarityDelimiter).shift();
  return nameWithoutWeight;
};

const getElements = (path, layer) => {
  return fs
    .readdirSync(path)
    .filter((item) => !/(^|\/)\.[^\/\.]/g.test(item))
    .map((i, index) => {
      if (i.includes(DNA_DELIMITER)) {
        throw new Error(`layer name can not contain "${DNA_DELIMITER}" characters, please fix: ${i}`);
      }

      const element = {
        id: index,
        name: cleanName(i),
        filename: i,
        path: `${path}${i}`,
        weight: getRarityWeight(i),
      };

      if (configNew) {
        const trait = configNew.traits.find(t => t.Path === `${layer}/${element.name}`);
        if (!trait)
          throw new Error(`No trait found for ${layer}/${element.name}`);

        element.trait = trait;
      }

      return element;
    });
};

const layersSetup = (layersOrder) => {
  const layers = layersOrder.map((layerObj, index) => ({
    id: index,
    elements: getElements(`${FOLDERS.layersDir}/${layerObj.name}/`, layerObj.name),
    name:
      layerObj.options?.["displayName"] != undefined
        ? layerObj.options?.["displayName"]
        : layerObj.name,
    maxRepeatedTrait: layerObj.maxRepeatedTrait,    
    blend:
      layerObj.options?.["blend"] != undefined
        ? layerObj.options?.["blend"]
        : "source-over",
    opacity:
      layerObj.options?.["opacity"] != undefined
        ? layerObj.options?.["opacity"]
        : 1,
    bypassDNA:
      layerObj.options?.["bypassDNA"] !== undefined
        ? layerObj.options?.["bypassDNA"]
        : false,
    noLayerMeta:
      layerObj.options?.["noLayerMeta"] !== undefined
        ? layerObj.options?.["noLayerMeta"]
        : false,
  }));
  return layers;
};

const saveImage = (prefix, _editionCount) => {
  fs.writeFileSync(
    `${FOLDERS.imagesDir}/${prefix ?? ''}${_editionCount}.png`,
    canvas.toBuffer("image/png")
  );
};

const genColor = () => {
  let hue = Math.floor(Math.random() * 360);
  let pastel = `hsl(${hue}, 100%, ${background.brightness})`;
  return pastel;
};

const drawBackground = () => {
  ctx.fillStyle = background.static ? background.default : genColor();
  ctx.fillRect(0, 0, format.width, format.height);
};

const addMetadata = (_dna, prefix, _edition) => {
  let dateTime = Date.now();
  let tempMetadata = {
    name: `${NFT_DETAILS.namePrefix} #${_edition}`,
    description: `${NFT_DETAILS.description}`,
    file_url: `${NFT_DETAILS.imageFilesBase}/${prefix ?? ''}${_edition}.png`,
    image: `${NFT_DETAILS.imageFilesBase}/${prefix ?? ''}${_edition}.png`,
    attributes: attributesList,
    custom_fields: {
      dna: sha1(_dna),
      edition: _edition,
      date: dateTime,
      compiler: "HashLips Art Engine - Modified By ThePeanutGalleryAndCo",
    },
    ...extraMetadata,
  };
  if (network == NETWORK.sol) {
    tempMetadata = {
      //Added metadata for solana
      name: tempMetadata.name,
      symbol: solanaMetadata.symbol,
      description: tempMetadata.description,
      //Added metadata for solana
      seller_fee_basis_points: solanaMetadata.seller_fee_basis_points,
      image: `${_edition}.png`,
      //Added metadata for solana
      external_url: solanaMetadata.external_url,
      edition: _edition,
      ...extraMetadata,
      attributes: tempMetadata.attributes,
      properties: {
        files: [
          {
            uri: `${_edition}.png`,
            type: "image/png",
          },
        ],
        category: "image",
        creators: solanaMetadata.creators,
      },
      custom_fields: {
        dna: sha1(_dna),
        edition: _edition,
        date: dateTime,
        compiler: "HashLips Art Engine",
      }
    };
  }
  metadataList.push(tempMetadata);
  attributesList = [];
};

const addAttributes = (_element) => {
  let selectedElement = _element.layer.selectedElement;
  let ignore = false;

  // console.log("Debug - noLayerMeta: " + _element.layer.noLayerMeta);
  if (_element.layer.noLayerMeta !== undefined && _element.layer.noLayerMeta) {
    ignore = true;
  }

  //Added ability for user to state whether they are using blank images or blank keyword within image names so that the code can already cater for it as the norm is to remove blanks from attribute lists.
  if (NFT_DETAILS.ignoreAllNamesWithBlank && selectedElement.name.trim().toLowerCase().includes("blank")) {
    ignore = true;
  }

  if (NFT_DETAILS.ignoreExactBlankName && selectedElement.name.trim().toLowerCase() === "blank") {
    ignore = true;
  }

  if (!ignore) {
    addToAttrbutesList(_element.layer.name, selectedElement.trait?.DisplayName ?? selectedElement.name);
  }
};

function addToAttrbutesList(_layerName, _elementValue) {
  attributesList.push({
    trait_type: _layerName,
    value: _elementValue
  });
}

const loadLayerImg = async (_layer) => {
  try {
    const image = await loadImage(`${_layer.selectedElement.path}`);
    return { 
      layer: _layer, 
      loadedImage: image 
    };
  } catch (error) {
    console.error("Error loading image:", error);
  }
};

const loadAndPrepareBadges = async () => {
  if (!fs.existsSync(FOLDERS.badgesDir))
    return [undefined];  

  const badges = await Promise.all(fs.readdirSync(FOLDERS.badgesDir).filter(i => !/(^|\/)\.[^\/\.]/g.test(i)).map(async i => {
    const index = Number.parseInt(i.replace('.png', ''));
    if (Number.isNaN(index))
      throw new Error(`Badge names must be numbers!`);
    const path = `${FOLDERS.badgesDir}/${i}`;
    const image = await loadImage(path);
    return {
      index,
      prefix: `${index}/`,
      layer: {
        selectedElement: {
          path: path,
          name: i
        },
        name: 'Badge',
        blend: 'source-over',
        opacity: 1,
        noLayerMeta: true
      }, 
      loadedImage: image 
    }
  }));

  for (let i = 0; i < badges.length; i++)
    if (badges[i].index !== i)
      throw new Error(`Badges must be integers from 0 to badges.length - 1!`);
  
  badges.forEach(b => {
    fs.mkdirSync(`${FOLDERS.jsonDir}/${b.prefix}`);
    fs.mkdirSync(`${FOLDERS.imagesDir}/${b.prefix}`);
  });

  return badges;
};

const addText = (_sig, x, y, size) => {
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
};

const drawElement = (_renderObject, _index, _layersLen, _addAttributes) => {
  ctx.globalAlpha = _renderObject.layer.opacity;
  ctx.globalCompositeOperation = _renderObject.layer.blend;
  text.only
    ? addText(
        `${_renderObject.layer.name}${text.spacer}${_renderObject.layer.selectedElement.name}`,
        text.xGap,
        text.yGap * (_index + 1),
        text.size
      )
    : ctx.drawImage(
        _renderObject.loadedImage,
        0,
        0,
        format.width,
        format.height
      );

  if (_addAttributes)
    addAttributes(_renderObject);
};

const constructLayerToDna = (_dna = "", _layers = []) => {
  let mappedDnaToLayers = _layers.map((layer, index) => {
    let selectedElement = layer.elements.find(
      (e) => e.id == cleanDna(_dna.split(DNA_DELIMITER)[index])
    );
    return {
      name: layer.name,
      blend: layer.blend,
      opacity: layer.opacity,
      noLayerMeta: layer.noLayerMeta,
      selectedElement: selectedElement,
    };
  });
  return mappedDnaToLayers;
};

/**
 * In some cases a DNA string may contain optional query parameters for options
 * such as bypassing the DNA isUnique check, this function filters out those
 * items without modifying the stored DNA.
 *
 * @param {String} _dna New DNA string
 * @returns new DNA string with any items that should be filtered, removed.
 */
const filterDNAOptions = (_dna) => {
  const dnaItems = _dna.split(DNA_DELIMITER);
  const filteredDNA = dnaItems.filter((element) => {
    const query = /(\?.*$)/;
    const querystring = query.exec(element);
    if (!querystring) {
      return true;
    }
    const options = querystring[1].split("&").reduce((r, setting) => {
      const keyPairs = setting.split("=");
      return { ...r, [keyPairs[0]]: keyPairs[1] };
    }, []);

    return options.bypassDNA;
  });

  return filteredDNA.join(DNA_DELIMITER);
};

/**
 * Cleaning function for DNA strings. When DNA strings include an option, it
 * is added to the filename with a ?setting=value query string. It needs to be
 * removed to properly access the file name before Drawing.
 *
 * @param {String} _dna The entire newDNA string
 * @returns Cleaned DNA string without querystring parameters.
 */
const removeQueryStrings = (_dna) => {
  const query = /(\?.*$)/;
  return _dna.replace(query, "");
};

const isDnaUnique = (_DnaList = new Set(), _dna = "") => {
  const _filteredDNA = filterDNAOptions(_dna);
  return !_DnaList.has(_filteredDNA);
};

const selectTraits = (layers, id) => {
  let traits = [];
  let depended_traits = {};
  let incompatible_traits = {};

  const fixed_edition = configNew?.fixed_editions?.find(e => id >= e['ID start'] && id <= e['ID end']);

  function selectTrait(layer, element) {
    if (element.trait) {
      if (element.trait.DependentTraits) {
        element.trait.DependentTraits.forEach(t => {
          depended_traits[t.split('/')[0]] = true;
          depended_traits[t] = true;
        });
      }
      if (element.trait.IncompatibleTraits)
        element.trait.IncompatibleTraits.forEach(t => incompatible_traits[t] = true);
    }

    traits.push({
      layer: layer.name,
      id: element.id,
      name: element.name,
      filename: element.filename,
      bypassDNA: layer.bypassDNA,
      maxRepeatedTrait: layer.maxRepeatedTrait,
      noLayerMeta: layer.noLayerMeta,
    });
  }

  layers.forEach((layer) => {
    if (fixed_edition && fixed_edition[layer.name]) {
      const fixedElement = layer.elements.find(e => e.name === fixed_edition[layer.name]);
      return selectTrait(layer, fixedElement);
    }

    const elements = layer.elements.filter(e => {
      if (!configNew)
        return true;

      const trait = e.trait;

      if (incompatible_traits[trait.Path])
        return false;

      if (depended_traits[trait.Layer])
        return depended_traits[trait.Path];

      return true;
    });

    var totalWeight = 0;
    elements.forEach((element) => {
      totalWeight += element.weight;
    });
    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= elements[i].weight;
      if (random < 0)
        return selectTrait(layer, elements[i]);
    }
  });
  return traits;
};

const createDna = (traits) => {
  let dna = [];

  traits.forEach((trait) => {
    dna.push(
      `${trait.id}:${trait.filename}${
        trait.bypassDNA ? "?bypassDNA=true" : ""
      }`
    );
  });

  return dna.join(DNA_DELIMITER);
};

const writeMetaData = (_data) => {
  fs.writeFileSync(`${FOLDERS.jsonDir}/_metadata.json`, _data);
};

const saveMetaDataSingleFile = (prefix, _editionCount) => {
  let metadata = metadataList.find((meta) => meta.custom_fields.edition == _editionCount);
  debugLogs
    ? console.log(
        `Writing metadata for ${_editionCount}: ${JSON.stringify(metadata)}`
      )
    : null;
  fs.writeFileSync(
    `${FOLDERS.jsonDir}/${prefix ?? ''}${_editionCount}.json`,
    JSON.stringify(metadata, null, 2)
  );
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

const startCreating = async () => {
  if (configNew) {
    layerConfigurations.forEach(layerConfiguration => {
      layerConfiguration.incompatibleTraits = configNew.incompatible_traits;
      layerConfiguration.dependentTraits = configNew.dependent_traits;
    });

    configNew.traits.filter(t => !fs.existsSync(`${FOLDERS.layersDir}/${t.Path}.png`)).forEach(t => {
      throw new Error(`No file found for ${t.Path}`);
    });
  }

  let layerConfigIndex = 0;
  let editionCount = 1;
  let failedCount = 0;
  let abstractedIndexes = [];
  const _startCollectionEditionFrom = Number(NFT_DETAILS.startCollectionEditionFrom);
  const badges = await loadAndPrepareBadges();
  for (
    let i =
      network == NETWORK.sol
        ? _startCollectionEditionFrom > 1
          ? _startCollectionEditionFrom
          : 0
        : NFT_DETAILS.startCollectionEditionFrom === '0'
          ? 0
          : _startCollectionEditionFrom
            ? _startCollectionEditionFrom 
            : 1;
    i <= layerConfigurations[layerConfigurations.length - 1].growEditionSizeTo + (_startCollectionEditionFrom > 1 && _startCollectionEditionFrom);
    i++
  ) {
    abstractedIndexes.push(i);
  }
  if (shuffleLayerConfigurations) {
    abstractedIndexes = shuffle(abstractedIndexes);
  }
  debugLogs
    ? console.log("Editions left to create: ", abstractedIndexes)
    : null;
  while (layerConfigIndex < layerConfigurations.length) {
    const selectedTraitsList = new Set();
    const layers = layersSetup(
      layerConfigurations[layerConfigIndex].layersOrder
    );
    while (
      editionCount <= layerConfigurations[layerConfigIndex].growEditionSizeTo
    ) {
      const traits = selectTraits(layers, abstractedIndexes[0]);
      let newDna = createDna(traits);
      if (isDnaUnique(dnaList, newDna)) {

        const maxRepeatedTraits = layerConfigurations[layerConfigIndex].maxRepeatedTraits;
        const incompatibleTraits = layerConfigurations[layerConfigIndex].incompatibleTraits;
        const layerItemsMaxRepeatedTraits = layerConfigurations[layerConfigIndex].layerItemsMaxRepeatedTraits;
        const dependentTraits = layerConfigurations[layerConfigIndex].dependentTraits;

        if (needsFiltration(selectedTraitsList, traits, maxRepeatedTraits, incompatibleTraits, layerItemsMaxRepeatedTraits, dependentTraits)) {
          failedCount++;
          if (failedCount >= uniqueDnaTorrance) {
            console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
            );
            writeMetaData(JSON.stringify(metadataList, null, 2));
            process.exit();
          }
          continue;
        }

        let results = constructLayerToDna(newDna, layers);
        let loadedElements = [];

        results.forEach((layer) => {
          loadedElements.push(loadLayerImg(layer));
        });

        await Promise.all(loadedElements).then((renderObjectArray) => {
          for (let i = 0; i < badges.length; i++) {
            debugLogs ? console.log("Clearing canvas") : null;
            ctx.clearRect(0, 0, format.width, format.height);
            if (gif.export) {
              hashlipsGiffer = new HashlipsGiffer(
                canvas,
                ctx,
                `${FOLDERS.gifsDir}/${abstractedIndexes[0]}.gif`,
                gif.repeat,
                gif.quality,
                gif.delay
              );
              hashlipsGiffer.start();
            }
            if (background.generate) {
              drawBackground();
            }
            renderObjectArray.forEach((renderObject, index) => {
              drawElement(
                renderObject,
                index,
                layerConfigurations[layerConfigIndex].layersOrder.length,
                i === 0
              );
              if (gif.export) {
                hashlipsGiffer.add();
              }
            });
            if (badges[i]) {
              drawElement(
                badges[i],
                renderObjectArray.length,
                layerConfigurations[layerConfigIndex].layersOrder.length
              );
              if (gif.export) {
                hashlipsGiffer.add();
              }
            }
            if (gif.export) {
              hashlipsGiffer.stop();
            }
            if (i === 0)
              debugLogs
                ? console.log("Editions left to create: ", abstractedIndexes)
                : null;
            saveImage(badges[i]?.prefix, abstractedIndexes[0]);
            if (i === 0)
              addMetadata(newDna, badges[i]?.prefix, abstractedIndexes[0]);
            saveMetaDataSingleFile(badges[i]?.prefix, abstractedIndexes[0]);
            if (i === 0)
              console.log(
                `Created edition: ${abstractedIndexes[0]}, with DNA: ${sha1(
                  newDna
                )} (tries: ${failedCount})`
              );
          }
        });
        dnaList.add(filterDNAOptions(newDna));
        selectedTraitsList.add(traits);
        editionCount++;
        failedCount = 0; 
        abstractedIndexes.shift();
      } else {
        console.log("DNA exists!");
        failedCount++;
        if (failedCount >= uniqueDnaTorrance) {
          console.log(
            `You need more layers or elements to grow your edition to ${layerConfigurations[layerConfigIndex].growEditionSizeTo} artworks!`
          );
          writeMetaData(JSON.stringify(metadataList, null, 2));
          process.exit();
        }
      }
    }
    layerConfigIndex++;
  }
  writeMetaData(JSON.stringify(metadataList, null, 2));
};

module.exports = { startCreating, buildSetup, getElements };
