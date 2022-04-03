const fs = require("fs");
const { exit } = require("process");
const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const { createCanvas, loadImage } = require(`${FOLDERS.nodeModulesDir}/canvas`);
const {
  format,
  background,
  layerConfigurations,
  rarityDelimiter,
  text,
  gif,
} = require(`${FOLDERS.sourceDir}/config.js`);
const canvas = createCanvas(format.width, format.height);
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = format.smoothing;
const DNA_DELIMITER = "-";
const HashlipsGiffer = require(`${FOLDERS.modulesDir}/HashlipsGiffer.js`);
const configNew = fs.existsSync(`${FOLDERS.sourceDir}/config_new.json`) ? require(`${FOLDERS.sourceDir}/config_new.json`) : {};

let hashlipsGiffer = null;

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

const loadBadges = async () => {
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

  return badges;
};

const addText = (_sig, x, y, size) => {
  ctx.fillStyle = text.color;
  ctx.font = `${text.weight} ${size}pt ${text.family}`;
  ctx.textBaseline = text.baseline;
  ctx.textAlign = text.align;
  ctx.fillText(_sig, x, y);
};

const drawElement = (_renderObject, _index, _layersLen) => {
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
};

async function main() {
  const index = process.argv[2];
  const path = process.argv[3];
  const metadata = JSON.parse(fs.readFileSync(path));
  
  const attributes = {};
  [...metadata.attributes, ...metadata.hiddenAttributes].forEach(a => {
    attributes[a.trait_type] = a.value;
  });

  const imageCache = {};
  for await (const layer of Object.keys(attributes)) {
    const value = attributes[layer];
    const id = `${layer}/${value}`;
    if (!imageCache[id]) {
      const path = `${FOLDERS.layersDir}/${configNew.traits.find(t => t.Layer === layer && t.DisplayName === value).Path}.png`;
      const image = await loadImage(path);
      imageCache[id] = image;
    }
  }

  const badges = await loadBadges();
  const layers = layersSetup(
    layerConfigurations[0].layersOrder
  );

  for (let i = 0; i < badges.length; i++) {
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
    layers.forEach((layer, index, arr) => {
      drawElement(
        { layer, loadedImage: imageCache[`${layer.name}/${attributes[layer.name]}`] },
        index,
        arr.length
      );
      if (gif.export) {
        hashlipsGiffer.add();
      }
    });
    if (badges[i]) {
      drawElement(
        badges[i],
        layers.length,
        layers.length
      );
      if (gif.export) {
        hashlipsGiffer.add();
      }
    }
    if (gif.export) {
      hashlipsGiffer.stop();
    }
    saveImage(badges[i]?.prefix, index);
  }
  console.log(`Created edition image: ${index}`);
  exit(0);
}

main();