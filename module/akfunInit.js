const gitClone = require('../src/utils/gitClone');

const templateList = {
  'vue': 'git@github.com:wibetter/akfun-vue-template.git',
  'react': 'git@github.com:wibetter/akfun-react-template.git',
  'react&ts': 'git@github.com:wibetter/akfun-react-ts-template.git',
  'library': 'git@github.com:wibetter/json-utils.git',
  'json-editor': 'git@github.com:wibetter/json-editor.git',
  'pigNews': 'git@github.com:wibetter/pigNews.git',
};

const akfunInit = function (type, dir, projectName) {
  const currentTemplateUrl = templateList[type || 'react'];
  gitClone(currentTemplateUrl, dir || 'akfunProject', () => {});
};

module.exports = akfunInit;
