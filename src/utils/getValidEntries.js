const fs = require('fs');
const path = require('path');

const getEntriesByExt = (basePath, extReg) => {
  const fullPath = path.resolve(basePath, './src/pages');
  if (fs.existsSync(fullPath)) {
    const files = fs.readdirSync(fullPath);
    const result = {};

    files.forEach((file) => {
      if (file.match(extReg)) {
        result[path.basename(file).replace(extReg, '')] = path.resolve(fullPath, file);
      }
    });
    return result;
  }
  return {};
};

const getValidEntries = (basePath) => {
  const jsEntries = getEntriesByExt(basePath, /\.[tj]sx?$/);
  const htmlEntries = getEntriesByExt(basePath, /\.html$/);

  const result = {};

  if (jsEntries) {
    Object.keys(jsEntries).forEach((entry) => {
      if (htmlEntries[entry]) {
        result[entry] = {
          js: jsEntries[entry],
          html: htmlEntries[entry]
        };
      }
    });
  }

  return result;
};

module.exports = { getValidEntries };
