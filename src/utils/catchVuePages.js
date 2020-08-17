const fs = require('fs');
const path = require('path');

const { resolveToCurrentRoot } = require('./pathUtils');

module.exports = () => {
  const vuePages = {};
  const srcDir = resolveToCurrentRoot('./src');
  if (fs.existsSync(srcDir)) {
    // 读取src中的所有vue单文件
    fs.readdirSync(srcDir)
      .filter((p) => p.match(/\.vue$/))
      .map((p) => path.join(srcDir, p))
      .forEach((p) => {
        const entryName = path.basename(p).replace(/\.vue$/, '');
        vuePages[entryName] = p;
      });
  }
  const srcPagesDir = resolveToCurrentRoot('./src/pages');
  if (fs.existsSync(srcPagesDir)) {
    // 读取src/pages中的所有vue单文件
    fs.readdirSync(srcPagesDir)
      .filter((p) => p.match(/\.vue$/))
      .map((p) => path.join(srcPagesDir, p))
      .forEach((p) => {
        const entryName = path.basename(p).replace(/\.vue$/, '');
        vuePages[entryName] = p;
      });
  }
  return vuePages;
};
