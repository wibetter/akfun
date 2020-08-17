const fs = require('fs');
const path = require('path');

const { resolveToCurrentRoot } = require('./pathUtils');

module.exports = () => {
  const htmlEntries = {};
  const pagesDir = resolveToCurrentRoot('./src/pages');
  if (fs.existsSync(pagesDir)) {
    fs.readdirSync(pagesDir)
      .filter((p) => p.match(/\.html$/))
      .map((p) => path.join(pagesDir, p))
      .forEach((p) => {
        const entryName = path.basename(p).replace(/\.html$/, '');
        htmlEntries[entryName] = p;
      });
  }
  return htmlEntries;
};
