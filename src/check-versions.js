const chalk = require('chalk'); // 带样式的log输出
const semver = require('semver'); // 版本号检测
const shell = require('shelljs'); // 命令执行
const packageConfig = require('../package.json');

function exec(cmd) {
  return require('child_process').execSync(cmd).toString().trim();
}

const versionRequirements = [
  {
    name: 'node',
    currentVersion: semver.clean(process.version),
    versionRequirement: packageConfig.engines.node
  }
];

// 判定npm命令是否可用
if (shell.which('npm')) {
  versionRequirements.push({
    name: 'npm',
    currentVersion: exec('npm --version'),
    versionRequirement: packageConfig.engines.npm
  });
}

module.exports = function () {
  const warnings = [];
  for (let i = 0; i < versionRequirements.length; i++) {
    const mod = versionRequirements[i];

    // 检验当前版本是否在当前支持版本范围内，其中satisfies [ˈsætɪsfaɪz] v.使满意;使满足;满足(要求、需要等);
    if (!semver.satisfies(mod.currentVersion, mod.versionRequirement)) {
      warnings.push(
        `${mod.name}: ${chalk.red(mod.currentVersion)} should be ${chalk.green(
          mod.versionRequirement
        )}`
      );
    }
  }

  if (warnings.length) {
    console.log('\n');
    console.log(chalk.yellow('To use this src, you must update following to modules:'));
    console.log('\n');
    for (let i = 0; i < warnings.length; i++) {
      const warning = warnings[i];
      console.log(`  ${warning}`);
    }
    console.log('\n');
    process.exit(1);
  }
};
