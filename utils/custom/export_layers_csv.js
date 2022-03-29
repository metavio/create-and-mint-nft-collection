const BASEDIR = process.cwd();
const { FOLDERS } = require(`${BASEDIR}/constants/folders.js`);
const { layerConfigurations } = require(`${FOLDERS.sourceDir}/config.js`);
const fs = require('fs');

const headers = [
  'Layer',
  'FileName',
  'DisplayName',
  'Path',
  'Weight',
  'Probability',
  'Editions'
];

const layers = fs.readdirSync(FOLDERS.layersDir).filter(file => fs.lstatSync(`${FOLDERS.layersDir}/${file}`).isDirectory()).map(layer_dir => {
  return {
    name: layer_dir,
    image_names: fs.readdirSync(`${FOLDERS.layersDir}/${layer_dir}`).filter(i => i.endsWith('.png'))
  };
});

const csv = [JSON.parse(JSON.stringify(headers))];
Object.values(layers).forEach(layer => {
  layer.image_names.forEach(image_name => {
    const image_name_without_extension = image_name.replace('.png', '');
    let weight = '';
    if (image_name.includes('#'))
      weight = image_name_without_extension.split('#')[1];

    const dependent_traits = layerConfigurations[0].dependentTraits[`${layer.name}/${image_name_without_extension}`] ?? [];
    if (headers.length + dependent_traits.length > csv[0].length)
      csv[0].push('Dependency');

    let row_number = csv.length + 1;
    csv.push([
      layer.name,
      image_name_without_extension,
      image_name_without_extension,
      `${layer.name}/${image_name_without_extension}`,
      weight,
      `=E${row_number}/ SUMIF(A$1:A; A${row_number};E$1:E)`,
      `=F${row_number}*10000`,
      ...dependent_traits
    ]);
  });
});

fs.writeFileSync(`${BASEDIR}/export.csv`, csv.map(r => r.join(',')).join('\n'));
console.log(`Exported export.csv -> ${BASEDIR}/export.csv`);