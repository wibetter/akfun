/*const path = require('path');
const fs = require('fs');

const currentRoot = () => fs.realpathSync(process.cwd());
const resolveToCurrentRoot = (filePath) => path.resolve(currentRoot(), filePath);

console.log(resolveToCurrentRoot('./'));*/

/*const akfunInit = require('../build/akfunInit');
akfunInit('vue', '');*/

const inspect = require('../module/inspect');
inspect('build');
