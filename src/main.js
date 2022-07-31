const fs = require("fs");
const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const sha1 = require(`${FOLDERS.nodeModulesDir}/sha1`);
const { loadImage } = require(`${FOLDERS.nodeModulesDir}/canvas`);
const { NETWORK } = require(`${FOLDERS.constantsDir}/network.js`);
const { NFT_DETAILS } = require(`${FOLDERS.constantsDir}/nft_details.js`);
const shell = require('child_process').execSync;
const {
  uniqueDnaTorrance,
  layerConfigurations,
  rarityDelimiter,
  shuffleLayerConfigurations,
  debugLogs,
  extraMetadata,
  network,
  solanaMetadata,
  gif,
} = require(`${FOLDERS.sourceDir}/config.js`);
var metadataList = [];
var attributesList = [];
var hiddenAttributesList = [];
var dnaList = new Set();
const DNA_DELIMITER = "-";
const configNew = fs.existsSync(`${FOLDERS.sourceDir}/config_new.json`) ? require(`${FOLDERS.sourceDir}/config_new.json`) : {};

const { needsFiltration } = require('./filters');

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

const addMetadata = (_dna, prefix, _edition) => {
  let dateTime = Date.now();
  let tempMetadata = {
    name: `${NFT_DETAILS.namePrefix} #${_edition}`,
    description: `${NFT_DETAILS.description}`,
    file_url: `${NFT_DETAILS.imageFilesBase}/${prefix ?? ''}${_edition}.png`,
    image: `${NFT_DETAILS.imageFilesBase}/${prefix ?? ''}${_edition}.png`,
    attributes: attributesList,
    hiddenAttributes: hiddenAttributesList,
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
  hiddenAttributesList = [];
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

  if (!ignore)
    addToAttrbutesList(_element.layer.name, selectedElement.trait?.DisplayName ?? selectedElement.name);
  addToHiddenAttributesList(_element.layer.name, selectedElement.trait?.FileName ?? selectedElement.name);
};

function addToAttrbutesList(_layerName, _elementValue) {
  attributesList.push({
    trait_type: _layerName,
    value: _elementValue
  });
}

function addToHiddenAttributesList(_layerName, _elementValue) {
  hiddenAttributesList.push({
    trait_type: _layerName,
    value: _elementValue
  });
}

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

  const fixed_edition = configNew?.fixed_editions?.find(e => id === e.ID);

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
      totalWeight += element.trait.Weight;
    });
    // number between 0 - totalWeight
    let random = Math.floor(Math.random() * totalWeight);
    for (var i = 0; i < elements.length; i++) {
      // subtract the current weight from the random weight until we reach a sub zero value.
      random -= elements[i].trait.Weight;
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

    let errors = '';
    configNew.traits.forEach(t => {
      if (!fs.existsSync(`${FOLDERS.layersDir}/${t.Path}.png`))
        errors += `No file found for ${t.Path}\n`;
      configNew.DependentTraits?.forEach(dt => {
        if (!configNew.traits.find(t2 => t2.Path === dt))
          errors += `No trait found for dependent trait ${dt} of ${t2.Path}\n`;
      });
      configNew.IncompatibleTraits?.forEach(it => {
        if (!configNew.traits.find(t2 => t2.Path === it))
          errors += `No trait found for incompatible trait ${it} of ${t2.Path}\n`;
      });
    });
    configNew.fixed_editions.forEach(fe => {
      configNew.layers.forEach(l => {
        if (fe[l.name]) {
          const path = `${l.name}/${fe[l.name]}`;
          if (!configNew.traits.find(t => t.Path === path))
            errors += `No trait found for ${path} of fixed edition #${fe.ID}\n`;
        }
      });
    });
    if (errors)
      throw new Error(errors);
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

        constructLayerToDna(newDna, layers).forEach(layer => addAttributes({ layer }));
        addMetadata(newDna, badges[0]?.prefix, abstractedIndexes[0]);
        saveMetaDataSingleFile(badges[0]?.prefix, abstractedIndexes[0]);
        console.log(`Created edition metadata: ${abstractedIndexes[0]}, with DNA: ${sha1(newDna)} (tries: ${failedCount})`);

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

  for (let i = 1; i < badges.length; i++)
    shell(`cp -r ${FOLDERS.jsonDir}/${badges[0].prefix} ${FOLDERS.jsonDir}/${badges[i].prefix}`);

  writeMetaData(JSON.stringify(metadataList, null, 2));

  const relation = metadataList.length / 10000;
  const collectedAttributes = {};
  metadataList.forEach(metadata => {
    metadata.hiddenAttributes.forEach(a => {
      if (!collectedAttributes[a.trait_type])
        collectedAttributes[a.trait_type] = {};
      if (!collectedAttributes[a.trait_type][a.value]) {
        const expected = configNew?.traits?.find(t => t.Layer === a.trait_type && t.FileName === a.value)?.Editions ?? 0;
        collectedAttributes[a.trait_type][a.value] = {
          expected: expected,
          expectedScaled: Math.round(expected * relation),
          actual: 0
        };
      }
      collectedAttributes[a.trait_type][a.value].actual++;
    });
  });

  console.log(`Attributes json exported to ${FOLDERS.buildDir}/attributes.json`);
  fs.writeFileSync(`${FOLDERS.buildDir}/attributes.json`, JSON.stringify(collectedAttributes, null, 2));

  const csv = [[
    'Layer',
    'FileName',
    'Expected',
    'Expected (Scaled)',
    'Actual'
  ]];
  for (const layer in collectedAttributes) {
    for (const fileName in collectedAttributes[layer]) {
      csv.push([
        layer,
        fileName,
        ...Object.values(collectedAttributes[layer][fileName])
      ]);
    }
  }

  console.log(`Attributes csv exported to ${FOLDERS.buildDir}/attributes.csv`);
  fs.writeFileSync(`${FOLDERS.buildDir}/attributes.csv`, csv.map(r => r.join(',')).join('\n'));

  const total_size = metadataList.length;
  const chunk_size = 100;
  const chunks = Math.ceil(total_size / chunk_size);
  for (let i = 0; i < chunks; i++) {
    const start = i * chunk_size;
    let end = ((i + 1) * chunk_size) - 1;
    if (end >= total_size)
      end = total_size - 1;

    console.log(`Creating edition images. Batch size: ${chunk_size}, Current Chunk: ${i + 1}/${chunks}, for more details check ${FOLDERS.buildDir}/output.log`);
    shell(`./metadata2image-batch-job.sh ${FOLDERS.jsonDir}/${badges[0]?.prefix ?? ''} ${start} ${end}`);
  }
};

module.exports = { startCreating, buildSetup, getElements };
