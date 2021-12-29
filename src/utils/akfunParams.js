var consoleTag = '[akfun]'; // 输出标记

function setConsoleTag(newText) {
  consoleTag = newText;
}

module.exports = {
  get curConsoleTag() {
    return consoleTag;
  },
  setConsoleTag
};
