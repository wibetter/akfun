/*
  识别当前运行环境：获取执行命令中的--env参数的值
  用于判断当时环境：本地执行环境(dev/local) or 线上测试环境(test) or 线上正式环境(online)
*/
function catchCurrentEnv() {
  const argv = process.argv; // 获取当前执行命令行中的参数数据
  let currentEnv = '';
  for (let ind = 0, size = argv.length; ind < size; ind++) {
    if (argv[ind].indexOf('--env') === 0) {
      const envStr = argv[ind].split('=');
      if (envStr && envStr[1]) {
        currentEnv = envStr[1];
      }
    }
  }
  return currentEnv;
}

module.exports = catchCurrentEnv;
