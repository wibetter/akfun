/*
  获取执行命令中的指定参数值
*/
function catchProcessParam(paramKey) {
  const argv = process.argv;
  let paramVal = '';
  for (let ind = 0, size = argv.length; ind < size; ind++) {
    if (argv[ind].indexOf(`--${paramKey}`) === 0) {
      const envStr = argv[ind].split('=');
      if (envStr && envStr[1]) {
        paramVal = envStr[1];
      }
    }
  }
  return paramVal;
}

module.exports = catchProcessParam;
