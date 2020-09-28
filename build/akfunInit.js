const gitClone = require('../src/utils/gitClone');

const templateList = {
  'vue': 'git@github.com:wibetter/akfun-vue-template.git',
  'react': 'git@github.com:wibetter/akfun-react-template.git',
  'library': 'git@github.com:wibetter/json-utils.git',
  'json-editor': 'git@github.com:wibetter/json-editor.git',
  'json-schema-editor': 'git@github.com:wibetter/json-schema-editor.git',
  'pigNews': 'git@github.com:wibetter/pigNews.git',
};

const akfunInit = function (type, dist, projectName) {
  const currentTemplateUrl = templateList[type || 'react'];
  gitClone(currentTemplateUrl, dist || 'akfunProject', () => {});
};

module.exports = akfunInit;
