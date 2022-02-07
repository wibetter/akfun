/*const path = require('path');
const fs = require('fs');

const currentRoot = () => fs.realpathSync(process.cwd());
const resolveToCurrentRoot = (filePath) => path.resolve(currentRoot(), filePath);

console.log(resolveToCurrentRoot('./'));*/

const akfunInit = require('../module/akfunInit');
akfunInit('vue', '');

/*const AKFun = require('../module/main');
AKFun.build('lib');*/
// createDeclaration: truec
